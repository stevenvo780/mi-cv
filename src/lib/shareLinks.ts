import { catalogos, frenteOrder, frentesMeta } from '@/data/frentes';
import { SITES } from '@/lib/ecosystem';
import { type Locale, PROFILES, localeUrl } from '@/lib/site';

export type ShareGroup = 'main' | 'fronts' | 'catalogs' | 'contact';

export type ShareDestination = {
  id: string;
  group: ShareGroup;
  label: string;
  category: string;
  description: string;
  url: string;
  tone: 'gold' | 'teal' | 'violet';
};

/** URL pública directa de cada sitio. El WhatsApp personal espera su enlace confirmado. */
export function getShareDestinations(locale: Locale): ShareDestination[] {
  const es = locale === 'es';
  const category = {
    site: es ? 'Sitio principal' : 'Main website',
    cv: es ? 'Currículum' : 'Résumé',
    services: es ? 'Servicios' : 'Services',
    blog: 'Blog',
    story: es ? 'Historia' : 'Story',
    front: es ? 'Área de trabajo' : 'Field of work',
    catalog: es ? 'Catálogo' : 'Catalog',
  };
  return [
    {
      id: 'cv',
      group: 'main',
      label: es ? 'Sitio principal' : 'Main website',
      category: category.site,
      description: es ? 'El punto de partida para explorar todo mi trabajo.' : 'Start here to explore all my work.',
      url: localeUrl(locale),
      tone: 'gold',
    },
    {
      id: 'cv-engineer', group: 'main',
      label: es ? 'CV informático' : 'Engineering résumé', category: category.cv,
      description: es ? 'Trayectoria, experiencia y proyectos de ingeniería.' : 'Engineering experience and projects.',
      url: SITES.cvEngineer, tone: 'teal',
    },
    {
      id: 'cv-philosopher', group: 'main',
      label: es ? 'CV filósofo' : 'Philosophy résumé', category: category.cv,
      description: es ? 'Investigación, docencia y trabajo filosófico.' : 'Research, teaching and philosophical work.',
      url: SITES.cvPhilosopher, tone: 'violet',
    },
    {
      id: 'services', group: 'main',
      label: 'Práxis', category: category.services,
      description: es ? 'Servicios profesionales y formas de colaborar.' : 'Professional services and ways to collaborate.',
      url: SITES.services, tone: 'gold',
    },
    {
      id: 'blog', group: 'main',
      label: 'Scholḗ', category: category.blog,
      description: es ? 'Ensayos, artículos y notas.' : 'Essays, articles and notes.',
      url: SITES.blog, tone: 'violet',
    },
    {
      id: 'lore', group: 'main',
      label: es ? 'Mi historia' : 'My story', category: category.story,
      description: es ? 'El recorrido detrás del trabajo.' : 'The path behind the work.',
      url: localeUrl(locale, '/lore'), tone: 'teal',
    },
    ...frenteOrder.map((id, index): ShareDestination => ({
      id: `front-${id}`, group: 'fronts',
      label: frentesMeta[id].nombre[locale], category: category.front,
      description: frentesMeta[id].tagline[locale],
      url: localeUrl(locale, `/${id}`),
      tone: (['teal', 'violet', 'gold', 'teal'] as const)[index],
    })),
    ...catalogos.filter((catalogo) => catalogo.url).map((catalogo, index): ShareDestination => ({
      id: `catalog-${catalogo.id}`, group: 'catalogs',
      label: catalogo.nombre, category: category.catalog,
      description: catalogo.subtitulo?.[locale] ?? catalogo.descripcion[locale],
      url: catalogo.url!,
      tone: (['gold', 'teal', 'violet', 'teal'] as const)[index % 4],
    })),
    {
      id: 'jarvis',
      group: 'contact',
      label: 'Jarvis · WhatsApp',
      category: es ? 'Asistente virtual' : 'Virtual assistant',
      description: es ? 'Habla con mi asistente por WhatsApp.' : 'Chat with my assistant on WhatsApp.',
      url: 'https://wa.me/573023954534',
      tone: 'teal',
    },
    {
      id: 'instagram',
      group: 'contact',
      label: 'Instagram',
      category: es ? 'Red social' : 'Social',
      description: es ? 'Fotos, ideas y momentos.' : 'Photos, ideas and moments.',
      url: PROFILES.instagram,
      tone: 'violet',
    },
    {
      id: 'github',
      group: 'contact',
      label: 'GitHub',
      category: es ? 'Código' : 'Code',
      description: es ? 'Repositorios y trabajo abierto.' : 'Repositories and open work.',
      url: PROFILES.github,
      tone: 'teal',
    },
    {
      id: 'linkedin',
      group: 'contact',
      label: 'LinkedIn',
      category: es ? 'Perfil profesional' : 'Professional profile',
      description: es ? 'Experiencia, red y colaboraciones.' : 'Experience, network and collaborations.',
      url: PROFILES.linkedin,
      tone: 'gold',
    },
  ];
}

export const SHARE_COPY = {
  es: {
    title: 'Compartir · Steven Vallejo Ortiz',
    description: 'Elige un sitio, currículum, catálogo o canal de contacto y muestra su código QR para compartirlo.',
    skip: 'Saltar al contenido',
    back: 'Volver al sitio',
    language: 'English',
    eyebrow: 'Mouseîon / Conexiones',
    heading: 'Elige dónde seguimos.',
    introduction: 'Todo mi trabajo, en enlaces listos para compartir. Selecciona un destino; el QR cambia al instante.',
    listTitle: 'Elige un destino',
    listHint: 'Cada código abre el enlace seleccionado directamente.',
    groups: { main: 'Mis sitios', fronts: 'Áreas', catalogs: 'Catálogos', contact: 'Contacto y redes' },
    chooseAnother: 'Elegir otro destino',
    qrEyebrow: 'Listo para escanear',
    scan: 'Escanea para abrir',
    qrAlt: 'Código QR para',
    selectedUrl: 'Destino',
    open: 'Abrir enlace',
    copy: 'Copiar enlace',
    copied: 'Enlace copiado',
    copyFailed: 'No se pudo copiar. Abre el enlace para compartirlo.',
    present: 'Mostrar QR grande',
    close: 'Cerrar vista ampliada',
    presentationHint: 'Apunta la cámara hacia el código.',
    footer: 'Steven Vallejo Ortiz · Un enlace para cada conversación.',
  },
  en: {
    title: 'Share · Steven Vallejo Ortiz',
    description: 'Choose a website, résumé, catalog or contact channel and show its QR code to share it.',
    skip: 'Skip to content',
    back: 'Back to website',
    language: 'Español',
    eyebrow: 'Mouseîon / Connections',
    heading: 'Choose where we connect.',
    introduction: 'All my work in links ready to share. Pick a destination; the QR changes instantly.',
    listTitle: 'Choose a destination',
    listHint: 'Each code opens the selected link directly.',
    groups: { main: 'My sites', fronts: 'Fields', catalogs: 'Catalogs', contact: 'Contact and social' },
    chooseAnother: 'Choose another destination',
    qrEyebrow: 'Ready to scan',
    scan: 'Scan to open',
    qrAlt: 'QR code for',
    selectedUrl: 'Destination',
    open: 'Open link',
    copy: 'Copy link',
    copied: 'Link copied',
    copyFailed: 'Could not copy. Open the link to share it.',
    present: 'Show large QR',
    close: 'Close enlarged view',
    presentationHint: 'Point your camera at the code.',
    footer: 'Steven Vallejo Ortiz · A link for every conversation.',
  },
} as const;
