/**
 * Sitios hermanos del ecosistema y canales de contacto. Los usan la barra y el hero de la home, el asistente
 * (su system prompt y sus mensajes de error) y scripts/build-assistant-profile.mts. Cada sitio vive en su propio
 * subdominio y en su propio repo.
 */
export const SITES = {
  services: 'https://praxis.stevenvallejo.com',
  cvEngineer: 'https://informatico.stevenvallejo.com',
  cvPhilosopher: 'https://filosofo.stevenvallejo.com',
  blog: 'https://schole.stevenvallejo.com',
} as const;

export const EMAIL = 'steven@stevenvallejo.com';

/** WhatsApp con el mensaje de entrada ya escrito (el mismo que llevaba la home anterior). */
export const WHATSAPP_URL = 'https://wa.me/573023954534?text=Hola%20Steven%2C%20vi%20tu%20portafolio%20y%20quiero%20hablar%20contigo';
