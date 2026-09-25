import type { Viewport } from 'next';
import '@/styles/home.css';
import { HOME_FONT_VARIABLES } from './fonts';

/** Barra del navegador en móvil con el fondo de la home (--ink-0). */
export const viewport: Viewport = { themeColor: '#05090b' };

/**
 * Cara LCP del h1: preload + @font-face inline (no next/font) para que .hero-last pinte en first
 * paint con swap + fallback métrico, sin esperar el CSS chunk de home ni FOIT. Spec §5.2 / Jefe tip v5.
 */
const HERO_LCP_CSS = '@font-face{font-family:cormorantHero;src:url(/fonts/cormorant-hero.woff2) format("woff2");font-display:swap;font-weight:500;font-style:normal}@font-face{font-family:cormorantHero Fallback;src:local("Times New Roman");ascent-override:96.09%;descent-override:29.87%;line-gap-override:0.00%;size-adjust:96.09%}.home{--font-home-hero:cormorantHero,"cormorantHero Fallback"}.home .hero-title{font-family:var(--font-home-hero),Georgia,serif;font-weight:500;line-height:.86;letter-spacing:-.035em;color:#f6f1e8;font-size:clamp(3.2rem,16vw,8rem)}.home .hero-last{opacity:1;visibility:visible;color:#f6f1e8}';

// Las variables de las fuentes de la home van en este contenedor y no en <html>: así su CSS viaja en el mismo
// chunk que home.css y el portal no las ve. El preload del nombre LCP es el único (e2e §5.2).
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        rel="preload"
        href="/fonts/cormorant-hero.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <style dangerouslySetInnerHTML={{ __html: HERO_LCP_CSS }} />
      <div className={HOME_FONT_VARIABLES}>{children}</div>
    </>
  );
}
