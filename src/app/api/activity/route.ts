import type { ActivityResponse } from '@/activity/model';
import { loadActivity } from '@/activity/source';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result: ActivityResponse = { status: 'ready', snapshot: await loadActivity() };
    return Response.json(result, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600' } });
  } catch {
    // Ni errores del proveedor, ni URLs del feed, ni su respuesta cruda llegan al visitante.
    const result: ActivityResponse = { status: 'unavailable', snapshot: null };
    return Response.json(result, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
