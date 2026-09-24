declare module 'd3-force-3d' {
  export interface SimNode {
    index?: number;
    x?: number;
    y?: number;
    z?: number;
    vx?: number;
    vy?: number;
    vz?: number;
  }
  export interface SimLink {
    source: string | SimNode;
    target: string | SimNode;
  }
  export interface LinkForce<N extends SimNode, L extends SimLink> {
    id(fn: (node: N) => string): LinkForce<N, L>;
    distance(d: number | ((link: L) => number)): LinkForce<N, L>;
    strength(s: number | ((link: L) => number)): LinkForce<N, L>;
  }
  export interface ManyBodyForce<N extends SimNode> {
    strength(s: number | ((node: N) => number)): ManyBodyForce<N>;
  }
  export interface CenterForce {
    strength(s: number): CenterForce;
  }
  export interface Simulation<N extends SimNode> {
    force(name: string, force: unknown): Simulation<N>;
    randomSource(source: () => number): Simulation<N>;
    stop(): Simulation<N>;
    tick(iterations?: number): Simulation<N>;
    nodes(): N[];
  }
  export function forceSimulation<N extends SimNode>(nodes: N[], numDimensions?: 1 | 2 | 3): Simulation<N>;
  export function forceLink<N extends SimNode, L extends SimLink>(links: L[]): LinkForce<N, L>;
  export function forceManyBody<N extends SimNode>(): ManyBodyForce<N>;
  export function forceCenter(x?: number, y?: number, z?: number): CenterForce;
}
