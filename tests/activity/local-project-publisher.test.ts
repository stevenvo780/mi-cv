import { mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PROJECT_CATALOG } from '@/activity/projects/catalog';
import {
  assertExternalConfigPath, collectSelectedProjects, mapWithConcurrency, parsePublisherArgs,
  parsePublisherViewer, parseSelectedHistory, publisherWindows, publishSelectedFeed,
  releaseUploadArgs, SELECTED_HISTORY_QUERY, validatePublisherConfig, writeSelectedFeed,
  runNativeGh,
  BACKUPASSET,
  probeSelectedSlots, releaseDownloadArgs,
  type GhRunner,
} from '../../scripts/publish-project-activity-local.mjs';

vi.mock('node:child_process', async (original) => ({
  ...await original<typeof import('node:child_process')>(), spawn: vi.fn(),
}));

const now = new Date('2026-10-06T18:00:00Z');
const config = () => ({ projects: PROJECT_CATALOG.map(({ id }, i) => ({ id, repo: `local-map-${i}` })) });
const viewer = JSON.stringify({ data: { viewer: { id: 'mock-viewer-id', login: 'stevenvo780' } } });
const response = (counts = { week: 2, month: 7, year: 21 }) => JSON.stringify({ data: {
  repository: { privateMetadata: 'never-publish-local-map', defaultBranchRef: { target: {
    week: { totalCount: counts.week }, month: { totalCount: counts.month },
    year: { totalCount: counts.year, nodes: counts.year ? [{ committedDate: '2026-10-06T12:00:00Z', message: 'never-publish-message', email: 'never-publish-email', oid: 'never-publish-sha' }] : [] },
  } } },
} });
const gh = (): GhRunner => vi.fn(async (_args, input) => {
  const request = JSON.parse(input!);
  return request.query.includes('PublisherViewer') ? viewer : response();
});
const remoteRunner = (remote: Map<string, string>, failUpload: (asset: string) => boolean = () => false) =>
  vi.fn<GhRunner>(async (args, input) => {
    if (args[0] === 'api') return JSON.parse(input!).query.includes('PublisherViewer') ? viewer : response();
    if (args[1] === 'download') {
      const asset = args[args.indexOf('--pattern') + 1];
      const payload = remote.get(asset);
      if (payload === undefined) throw new Error('private-download-detail');
      return payload;
    }
    if (args[1] === 'upload') {
      const asset = basename(args[3]);
      const payload = await readFile(args[3], 'utf8');
      remote.delete(asset); // gh --clobber can delete successfully and then fail to upload.
      if (failUpload(asset)) throw new Error('private-upload-detail');
      remote.set(asset, payload);
      return '';
    }
    throw new Error('Unexpected mock command');
  });
const uploaded = (runner: ReturnType<typeof remoteRunner>) => runner.mock.calls
  .filter(([args]) => args[1] === 'upload').map(([args]) => basename(args[3]));
const temporary: string[] = [];
afterEach(async () => { for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true }); });
const directory = async () => { const path = await mkdtemp(join(tmpdir(), 'project-publisher-test-')); temporary.push(path); return path; };

describe('native local selected-project publisher', () => {
  it('requires a complete approved selection and rejects extra config fields and repeated paths', () => {
    expect(validatePublisherConfig(config()).projects).toHaveLength(PROJECT_CATALOG.length);
    const unknown = config(); unknown.projects[0].id = 'unapproved';
    expect(() => validatePublisherConfig(unknown)).toThrow('Invalid local publisher configuration');
    const duplicate = config(); duplicate.projects[1].id = duplicate.projects[0].id;
    expect(() => validatePublisherConfig(duplicate)).toThrow();
    const duplicateRepo = config(); duplicateRepo.projects[1].repo = duplicateRepo.projects[0].repo.toUpperCase();
    expect(() => validatePublisherConfig(duplicateRepo)).toThrow();
    const missing = config(); missing.projects.pop(); expect(() => validatePublisherConfig(missing)).toThrow();
    expect(() => validatePublisherConfig({ ...config(), token: 'never accepted' })).toThrow();
    const extra = config(); Object.assign(extra.projects[0], { owner: 'someone-else' });
    expect(() => validatePublisherConfig(extra)).toThrow();
    for (const repo of ['.', '..', '../local', 'owner/repo', 'repo with space', 'x'.repeat(101)]) {
      const invalid = config(); invalid.projects[0].repo = repo;
      expect(() => validatePublisherConfig(invalid)).toThrow();
    }
  });

  it('requires explicit separate JSON paths and fixes the publish filename, release and repository', () => {
    expect(() => parsePublisherArgs([])).toThrow();
    expect(() => parsePublisherArgs(['config.json'])).toThrow();
    expect(() => parsePublisherArgs(['config.json', 'config.json'])).toThrow();
    expect(() => parsePublisherArgs(['config.json', 'output.json', '--unknown'])).toThrow();
    expect(() => parsePublisherArgs(['config.json', 'output.json', '--publish'])).toThrow();
    expect(() => parsePublisherArgs(['config.json', BACKUPASSET, '--publish'])).toThrow();
    const args = parsePublisherArgs(['/tmp/config.json', '/tmp/projects-selected.json', '--publish']);
    expect(args.publish).toBe(true);
    expect(releaseUploadArgs(args.destination)).toEqual(['release', 'upload', 'activity-feed', '/tmp/projects-selected.json', '--repo', 'github.com/stevenvo780/mi-cv', '--clobber']);
    expect(releaseUploadArgs(`/tmp/${BACKUPASSET}`)[3]).toBe(`/tmp/${BACKUPASSET}`);
    expect(() => releaseUploadArgs('/tmp/unapproved.json')).toThrow();
    expect(releaseDownloadArgs(BACKUPASSET)).toEqual(['release', 'download', 'activity-feed', '--repo', 'github.com/stevenvo780/mi-cv', '--pattern', BACKUPASSET, '--output', '-']);
    expect(() => releaseDownloadArgs('../unapproved.json')).toThrow();
    expect(() => assertExternalConfigPath('/repo/config.json', '/repo')).toThrow();
    expect(() => assertExternalConfigPath('/repo', '/repo')).toThrow();
    expect(() => assertExternalConfigPath('/repo-other/config.json', '/repo')).not.toThrow();
  });

  it('uses inclusive UTC windows, authenticates only the approved owner, and refuses partial GraphQL results', () => {
    const windows = publisherWindows(now);
    expect(windows).toEqual({ week: '2026-09-30T00:00:00.000Z', month: '2026-09-07T00:00:00.000Z', year: '2025-10-07T00:00:00.000Z', until: '2026-10-06T23:59:59.999Z' });
    expect(publisherWindows(new Date('2026-10-06T01:00:00Z'))).toEqual(windows);
    expect(parsePublisherViewer(viewer)).toBe('mock-viewer-id');
    expect(() => parsePublisherViewer(viewer.replace('stevenvo780', 'someone-else'))).toThrow();
    expect(() => parseSelectedHistory(JSON.stringify({ data: { repository: null } }), windows)).toThrow();
    expect(() => parseSelectedHistory(JSON.stringify({ data: { repository: {} }, errors: [{ message: 'private-details' }] }), windows)).toThrow();
    expect(() => parseSelectedHistory(response({ week: 9, month: 2, year: 21 }), windows)).toThrow();
    expect(() => parseSelectedHistory(response().replace('2026-10-06T12:00:00Z', '2025-10-06T12:00:00Z'), windows)).toThrow();
    expect(() => parseSelectedHistory(response().replace('2026-10-06T12:00:00Z', '2026-02-30T12:00:00Z'), windows)).toThrow();
    expect(parseSelectedHistory(JSON.stringify({ data: { repository: { defaultBranchRef: null } } }), windows)).toEqual({ counts: { week: 0, month: 0, year: 0 }, lastActive: null });
    expect(parseSelectedHistory(response({ week: 0, month: 0, year: 0 }), windows).lastActive).toBe(null);
  });

  it('queries only bounded author-filtered histories and publishes no mappings, identifiers or metadata', async () => {
    const runner = gh();
    const snapshot = await collectSelectedProjects(config(), now, runner);
    expect(snapshot.source).toBe('github-authorized');
    expect(snapshot.projects).toHaveLength(PROJECT_CATALOG.length);
    expect(snapshot.projects[0].name).toEqual(PROJECT_CATALOG[0].name);
    expect(snapshot.projects[0].counts).toEqual({ week: 2, month: 7, year: 21 });
    expect(JSON.stringify(snapshot)).not.toMatch(/local-map|mock-viewer|privateMetadata|never-publish|committedDate|oid|email|"repo"/);
    expect(SELECTED_HISTORY_QUERY).not.toMatch(/message|email|oid|files|author\s*\{/);
    for (const [args, input] of vi.mocked(runner).mock.calls) {
      expect(args).toEqual(['api', 'graphql', '--hostname', 'github.com', '--input', '-']);
      const request = JSON.parse(input!);
      if (request.query.includes('SelectedProjectActivity')) {
        expect(request.query).toContain('repository(owner:"stevenvo780",name:$repo)');
        expect(request.variables.author).toBe('mock-viewer-id');
        expect(request.variables.until).toBe('2026-10-06T23:59:59.999Z');
      }
    }
  });

  it('never runs more than four native requests at once and does not return a partial result', async () => {
    let running = 0, peak = 0;
    const values = await mapWithConcurrency(Array.from({ length: 29 }, (_, i) => i), 4, async (i) => {
      running++; peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 1)); running--; return i * 2;
    });
    expect(peak).toBe(4); expect(values).toEqual(Array.from({ length: 29 }, (_, i) => i * 2));
    await expect(mapWithConcurrency([1, 2, 3, 4, 5], 4, async (i) => { if (i === 2) throw new Error('private details'); return i; })).rejects.toThrow('Selected project activity unavailable');
  });

  it('writes only validated complete files atomically, preserves old output on failure and rejects symlinks', async () => {
    const path = await directory();
    const output = join(path, 'projects-selected.json');
    const snapshot = await collectSelectedProjects(config(), now, gh());
    await writeSelectedFeed(output, snapshot, now);
    const before = await readFile(output, 'utf8');
    await expect(writeSelectedFeed(output, { ...snapshot, projects: [] }, now)).rejects.toThrow();
    expect(await readFile(output, 'utf8')).toBe(before);
    expect(await readdir(path)).toEqual(['projects-selected.json']);
    const link = join(path, 'link.json'); await symlink(output, link);
    await expect(writeSelectedFeed(link, snapshot, now)).rejects.toThrow('Invalid feed destination');
  });

  it('uploads a validated backup before primary and never publishes invalid collections', async () => {
    const path = await directory();
    const configPath = join(path, 'config.json');
    const destination = join(path, 'projects-selected.json');
    await writeFile(configPath, JSON.stringify(config()));
    const previous = JSON.stringify(await collectSelectedProjects(config(), now, gh()));
    const remote = new Map([['projects-selected.json', previous], [BACKUPASSET, previous]]);
    const runner = remoteRunner(remote);
    await publishSelectedFeed({ configPath, destination, publish: true }, now, runner);
    expect(uploaded(runner)).toEqual([BACKUPASSET, 'projects-selected.json']);
    expect(runner.mock.calls.filter(([args]) => args[1] === 'download').map(([args]) => args[6])).toEqual(['projects-selected.json', BACKUPASSET, BACKUPASSET]);
    expect(await readFile(join(path, BACKUPASSET), 'utf8')).toBe(await readFile(destination, 'utf8'));
    expect(remote.get(BACKUPASSET)).toBe(remote.get('projects-selected.json'));
    expect(remote.get(BACKUPASSET)).not.toMatch(/local-map|mock-viewer|never-publish/);
    const failure = vi.fn<GhRunner>(async (_args, input) => JSON.parse(input!).query.includes('PublisherViewer') ? viewer : '{"errors":[{"message":"private details"}]}');
    const before = await readFile(destination, 'utf8');
    await expect(publishSelectedFeed({ configPath, destination, publish: true }, now, failure)).rejects.toThrow();
    expect(failure.mock.calls.every(([args]) => args[0] !== 'release')).toBe(true);
    expect(await readFile(destination, 'utf8')).toBe(before);
  });

  it('leaves primary untouched when the backup upload fails', async () => {
    const path = await directory();
    const configPath = join(path, 'config.json');
    const destination = join(path, 'projects-selected.json');
    await writeFile(configPath, JSON.stringify(config()));
    const previous = JSON.stringify(await collectSelectedProjects(config(), now, gh()));
    await writeFile(destination, previous);
    const remote = new Map([['projects-selected.json', previous]]);
    const runner = remoteRunner(remote, () => true);
    await expect(publishSelectedFeed({ configPath, destination, publish: true }, now, runner)).rejects.toThrow('Selected feed publication unavailable');
    expect(uploaded(runner)).toEqual([BACKUPASSET]);
    expect(remote.get('projects-selected.json')).toBe(previous);
    expect(await readFile(destination, 'utf8')).toBe(previous);
  });

  it('retains a confirmed valid fresh backup when primary is deleted and its upload fails', async () => {
    const path = await directory();
    const configPath = join(path, 'config.json');
    const destination = join(path, 'projects-selected.json');
    await writeFile(configPath, JSON.stringify(config()));
    const expected = await collectSelectedProjects(config(), now, gh());
    const previous = { ...expected, updatedAt: '2026-10-05T18:00:00.000Z',
      projects: expected.projects.map((project) => ({ ...project, counts: { week: 1, month: 2, year: 3 }, lastActive: '2026-10-05' })) };
    const remote = new Map([['projects-selected.json', JSON.stringify(previous)]]);
    const runner = remoteRunner(remote, (asset) => asset === 'projects-selected.json');
    await expect(publishSelectedFeed({ configPath, destination, publish: true }, now, runner)).rejects.toThrow('Selected feed publication unavailable');
    expect(uploaded(runner)).toEqual([BACKUPASSET, 'projects-selected.json']);
    expect(remote.has('projects-selected.json')).toBe(false);
    expect(JSON.parse(remote.get(BACKUPASSET)!)).toEqual(expected);
    expect(JSON.parse(remote.get(BACKUPASSET)!).updatedAt).not.toBe(previous.updatedAt);
    expect(remote.get(BACKUPASSET)).not.toMatch(/local-map|mock-viewer|never-publish/);
  });

  it('probes both exact slots independently and rejects non-authorized or malformed payloads', async () => {
    const snapshot = await collectSelectedProjects(config(), now, gh());
    const remote = new Map([[BACKUPASSET, JSON.stringify(snapshot)]]);
    const runner = remoteRunner(remote);
    expect(await probeSelectedSlots(now, runner)).toEqual({ primary: false, backup: true });
    expect(runner.mock.calls.map(([args]) => args[6])).toEqual(['projects-selected.json', BACKUPASSET]);
    remote.set('projects-selected.json', JSON.stringify({ ...snapshot, source: 'github-public' }));
    remote.set(BACKUPASSET, 'private-malformed-response');
    expect(await probeSelectedSlots(now, runner)).toEqual({ primary: false, backup: false });
  });

  it('updates primary first when only backup is valid and preserves backup if that first upload fails', async () => {
    const path = await directory();
    const configPath = join(path, 'config.json');
    const destination = join(path, 'projects-selected.json');
    await writeFile(configPath, JSON.stringify(config()));
    const previous = JSON.stringify(await collectSelectedProjects(config(), now, gh()));
    const remote = new Map([[BACKUPASSET, previous]]);
    const runner = remoteRunner(remote, () => true);
    await expect(publishSelectedFeed({ configPath, destination, publish: true }, now, runner)).rejects.toThrow('Selected feed publication unavailable');
    expect(uploaded(runner)).toEqual(['projects-selected.json']);
    expect(remote.get(BACKUPASSET)).toBe(previous);
    expect(remote.has('projects-selected.json')).toBe(false);
    expect((await readdir(path)).includes(BACKUPASSET)).toBe(false);
  });

  it('performs no file writes or uploads when neither remote slot is valid', async () => {
    for (const remote of [new Map<string, string>(), new Map([['projects-selected.json', '{}'], [BACKUPASSET, 'not-json']])]) {
      const path = await directory();
      const configPath = join(path, 'config.json');
      const destination = join(path, 'projects-selected.json');
      await writeFile(configPath, JSON.stringify(config()));
      const runner = remoteRunner(remote);
      await expect(publishSelectedFeed({ configPath, destination, publish: true }, now, runner)).rejects.toThrow('Selected publication requires a valid existing slot');
      expect(uploaded(runner)).toEqual([]);
      expect(await readdir(path)).toEqual(['config.json']);
    }
  });

  it('survives primary failure followed by backup failure in the next publication', async () => {
    const path = await directory();
    const configPath = join(path, 'config.json');
    const destination = join(path, 'projects-selected.json');
    await writeFile(configPath, JSON.stringify(config()));
    const snapshot = await collectSelectedProjects(config(), now, gh());
    const remote = new Map([['projects-selected.json', JSON.stringify(snapshot)], [BACKUPASSET, JSON.stringify(snapshot)]]);
    let failing = 'projects-selected.json';
    const runner = remoteRunner(remote, (asset) => asset === failing);
    await expect(publishSelectedFeed({ configPath, destination, publish: true }, now, runner)).rejects.toThrow();
    expect([...remote.keys()]).toEqual([BACKUPASSET]);
    failing = BACKUPASSET;
    await expect(publishSelectedFeed({ configPath, destination, publish: true }, now, runner)).rejects.toThrow();
    expect(uploaded(runner)).toEqual([BACKUPASSET, 'projects-selected.json', 'projects-selected.json', BACKUPASSET]);
    expect(JSON.parse(remote.get('projects-selected.json')!)).toEqual(snapshot);
    expect(remote.has(BACKUPASSET)).toBe(false);
  });

  it('does not touch the survivor when the first replacement cannot be confirmed by readback', async () => {
    const path = await directory();
    const configPath = join(path, 'config.json');
    const destination = join(path, 'projects-selected.json');
    await writeFile(configPath, JSON.stringify(config()));
    const previous = JSON.stringify(await collectSelectedProjects(config(), now, gh()));
    const remote = new Map([['projects-selected.json', previous]]);
    const base = remoteRunner(remote);
    const runner = vi.fn<GhRunner>(async (args, input) => {
      if (args[1] === 'upload') { remote.set(basename(args[3]), '{}'); return ''; }
      return base(args, input);
    });
    await expect(publishSelectedFeed({ configPath, destination, publish: true }, now, runner)).rejects.toThrow('Selected feed publication unavailable');
    expect(uploaded(runner)).toEqual([BACKUPASSET]);
    expect(remote.get('projects-selected.json')).toBe(previous);
  });

  it('rejects missing config/output paths before gh and sanitizes upstream command errors', async () => {
    const path = await directory();
    const runner = vi.fn<GhRunner>(async () => { throw new Error('private-upstream-detail'); });
    await expect(publishSelectedFeed({ configPath: join(path, 'missing.json'), destination: join(path, 'projects-selected.json'), publish: true }, now, runner)).rejects.toThrow();
    expect(runner).not.toHaveBeenCalled();
    await expect(collectSelectedProjects(config(), now, runner)).rejects.toThrow('Native GitHub command unavailable');
    await expect(collectSelectedProjects(config(), now, runner)).rejects.not.toThrow('private-upstream-detail');
  });

  it('kills failed native commands and bounds stdout instead of leaving a detached request running', async () => {
    const child = () => Object.assign(new EventEmitter(), {
      stdin: new PassThrough(), stdout: new PassThrough(), kill: vi.fn(),
    });
    const failed = child();
    vi.mocked(spawn).mockReturnValueOnce(failed as unknown as ReturnType<typeof spawn>);
    const brokenInput = runNativeGh(['api', 'graphql'], '{}');
    failed.stdin.emit('error', new Error('private native error'));
    await expect(brokenInput).rejects.toThrow('Native GitHub command unavailable');
    expect(failed.kill).toHaveBeenCalledWith('SIGKILL');
    const oversized = child();
    vi.mocked(spawn).mockReturnValueOnce(oversized as unknown as ReturnType<typeof spawn>);
    const excessiveOutput = runNativeGh(['api', 'graphql'], '{}');
    oversized.stdout.write(Buffer.alloc(1_048_577));
    await expect(excessiveOutput).rejects.toThrow('Native GitHub command unavailable');
    expect(oversized.kill).toHaveBeenCalledWith('SIGKILL');
  });
});
