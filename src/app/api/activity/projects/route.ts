import type { ProjectResponse } from '@/activity/projects/model';
import { loadProjectActivity } from '@/activity/projects/source';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const result: ProjectResponse = { status: 'ready', snapshot: await loadProjectActivity() };
    return Response.json(result, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600' } });
  } catch {
    const result: ProjectResponse = { status: 'unavailable', snapshot: null };
    return Response.json(result, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
