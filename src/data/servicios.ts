/* ================================================================
   SERVICIOS — bilingual (ES/EN), the 6 sellable services.
   Transcribed from steven-vallejo-services/app/content.ts
   (contentES.services + contentEN.services), with a category for
   the in-page dashboard tabs/filter. Prices kept verbatim.
   CTA target: services.stevenvallejo.com (the dedicated site).
   ================================================================ */

export type ServicioCategoria = 'ia' | 'desarrollo' | 'marca';

export interface LocalizedText {
  es: string;
  en: string;
}

export interface Servicio {
  id: string;
  categoria: ServicioCategoria;
  titulo: LocalizedText;
  descripcion: LocalizedText;
  precio: LocalizedText;
}

export const servicios: Servicio[] = [
  {
    id: 'chatbot-whatsapp',
    categoria: 'ia',
    titulo: {
      es: 'Chatbot de WhatsApp con IA (24/7)',
      en: 'AI-powered WhatsApp chatbot (24/7)',
    },
    descripcion: {
      es: 'Tu negocio responde, califica y agenda solo —dejas de perder ventas por contestar tarde. Sobre la API oficial de WhatsApp, con tu tono y tus reglas.',
      en: 'Your business responds, qualifies and schedules on its own — you stop losing sales from slow replies. Built on the official WhatsApp API, with your tone and your rules.',
    },
    precio: {
      es: 'Desde $400 USD + $30–60/mes',
      en: 'From $400 USD + $30–60/mo',
    },
  },
  {
    id: 'automatizacion-ia',
    categoria: 'ia',
    titulo: {
      es: 'Automatización con IA',
      en: 'AI automation',
    },
    descripcion: {
      es: 'Lo que hoy te roba horas, el sistema lo hace solo: OCR de documentos, flujos entre apps, sync de CRMs y respuestas automáticas. Conecto todo lo que ya usas.',
      en: 'Whatever steals your hours today, the system does on its own: document OCR, multi-app flows, CRM sync and automated replies. I connect everything you already use.',
    },
    precio: {
      es: 'Desde $300 USD',
      en: 'From $300 USD',
    },
  },
  {
    id: 'escalado-fotos-ia',
    categoria: 'marca',
    titulo: {
      es: 'Escalado y restauración de fotos con IA',
      en: 'AI photo upscaling and restoration',
    },
    descripcion: {
      es: 'Tus fotos borrosas o de baja resolución quedan nítidas y profesionales, por lote. Catálogo listo para publicar en 48 h.',
      en: 'Blurry or low-resolution images come out sharp and professional, in batch. Catalogue ready to sell within 48 h.',
    },
    precio: {
      es: 'Desde $150 USD',
      en: 'From $150 USD',
    },
  },
  {
    id: 'pack-assets-marca',
    categoria: 'marca',
    titulo: {
      es: 'Pack de assets de marca con IA',
      en: 'AI brand asset pack',
    },
    descripcion: {
      es: 'Hasta 50 piezas visuales coherentes para redes y campañas, generadas con IA y curadas a mano. Tu marca lista para publicar.',
      en: 'Up to 50 consistent visual pieces for social media and campaigns, AI-generated and hand-curated. Your brand ready to publish.',
    },
    precio: {
      es: '$200–500 USD',
      en: '$200–500 USD',
    },
  },
  {
    id: 'backend-a-medida',
    categoria: 'desarrollo',
    titulo: {
      es: 'Backend y sistemas a medida (NestJS / Node)',
      en: 'Custom backend and systems (NestJS / Node)',
    },
    descripcion: {
      es: 'Cuando el problema es grande de verdad: ERPs, CMS, RAG e integraciones de IA. Diagnostico la raíz y construyo el sistema entero —no parches.',
      en: 'When the problem is genuinely large: ERPs, CMS, RAG and AI integrations. I diagnose the root and build the whole system — no patches.',
    },
    precio: {
      es: '$35 USD/h o por proyecto',
      en: '$35 USD/h or fixed scope',
    },
  },
  {
    id: 'landing-web',
    categoria: 'desarrollo',
    titulo: {
      es: 'Landing o web que convierte',
      en: 'Landing page or conversion-focused website',
    },
    descripcion: {
      es: 'Sitios en Next.js, rápidos, con SEO y pensados para vender. Carga instantánea y listos para recibir clientes.',
      en: 'Next.js sites, fast, SEO-ready and built to sell. Instant load and ready to receive clients.',
    },
    precio: {
      es: 'Desde $500 USD',
      en: 'From $500 USD',
    },
  },
];

export interface CategoriaMeta {
  id: ServicioCategoria;
  label: LocalizedText;
}

/** Tabs/filter for the services dashboard. 'todos' is rendered by the UI. */
export const servicioCategorias: CategoriaMeta[] = [
  { id: 'ia', label: { es: 'IA', en: 'AI' } },
  { id: 'desarrollo', label: { es: 'Desarrollo', en: 'Development' } },
  { id: 'marca', label: { es: 'Marca', en: 'Brand' } },
];

export const SERVICIOS_URL = 'https://services.stevenvallejo.com';
