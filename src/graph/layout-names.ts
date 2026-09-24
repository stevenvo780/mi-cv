/** Sin dependencias: lo importan el códec y el worker WebGL (Plan 2). */
export const LAYOUT_NAMES = ['red', 'hemisferios', 'helice', 'clusters', 'lemniscata'] as const;
export type LayoutName = (typeof LAYOUT_NAMES)[number];
export type Layouts = Record<LayoutName, Float32Array>;
