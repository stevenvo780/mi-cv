import { SITES } from '@/lib/ecosystem';
import { type Locale, PROFILES, localeUrl } from '@/lib/site';

export type ShareDestination = {
  id: 'cv' | 'jarvis' | 'instagram' | 'github' | 'linkedin' | 'blog' | 'personal-whatsapp';
  label: string;
  category: string;
  description: string;
  url: string;
  tone: 'gold' | 'teal' | 'violet';
};

/** Cada destino abre su URL directamente. Añadir el WhatsApp personal solo cuando Steven confirme su enlace. */
export function getShareDestinations(locale: Locale): ShareDestination[] {
  const es = locale === 'es';
  return [
    {
      id: 'cv',
      label: es ? 'Mi sitio' : 'My website',
      category: es ? 'Punto de partida' : 'Start here',
      description: es ? 'Portafolio y proyectos, en un solo lugar.' : 'Portfolio and projects, in one place.',
      url: localeUrl(locale),
      tone: 'gold',
    },
    {
      id: 'jarvis',
      label: 'Jarvis · WhatsApp',
      category: es ? 'Asistente virtual' : 'Virtual assistant',
      description: es ? 'Habla con mi asistente por WhatsApp.' : 'Chat with my assistant on WhatsApp.',
      url: 'https://wa.me/573023954534',
      tone: 'teal',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      category: es ? 'Red social' : 'Social',
      description: es ? 'Fotos, ideas y momentos.' : 'Photos, ideas and moments.',
      url: PROFILES.instagram,
      tone: 'violet',
    },
    {
      id: 'github',
      label: 'GitHub',
      category: es ? 'Código' : 'Code',
      description: es ? 'Repositorios y trabajo abierto.' : 'Repositories and open work.',
      url: PROFILES.github,
      tone: 'teal',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      category: es ? 'Perfil profesional' : 'Professional profile',
      description: es ? 'Experiencia, red y colaboraciones.' : 'Experience, network and collaborations.',
      url: PROFILES.linkedin,
      tone: 'gold',
    },
    {
      id: 'blog',
      label: 'Scholḗ',
      category: es ? 'Blog' : 'Blog',
      description: es ? 'Textos y notas de filosofía.' : 'Essays and notes on philosophy.',
      url: SITES.blog,
      tone: 'violet',
    },
  ];
}

export const SHARE_COPY = {
  es: {
    title: 'Compartir · Steven Vallejo Ortiz',
    description: 'Elige cómo conectar con Steven Vallejo Ortiz y muestra un código QR para su sitio, Jarvis y sus redes.',
    skip: 'Saltar al contenido',
    back: 'Volver al sitio',
    language: 'English',
    eyebrow: 'Mouseîon / Conexiones',
    heading: 'Elige dónde seguimos.',
    introduction: 'Una pantalla para compartir mi trabajo y seguir la conversación. Selecciona un destino; el QR cambia al instante.',
    listTitle: 'Elige un destino',
    listHint: 'Cada código abre el enlace seleccionado directamente.',
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
    description: 'Choose how to connect with Steven Vallejo Ortiz and show a QR code for his website, Jarvis and social profiles.',
    skip: 'Skip to content',
    back: 'Back to website',
    language: 'Español',
    eyebrow: 'Mouseîon / Connections',
    heading: 'Choose where we connect.',
    introduction: 'One place to share my work and keep the conversation going. Pick a destination; the QR changes instantly.',
    listTitle: 'Choose a destination',
    listHint: 'Each code opens the selected link directly.',
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
