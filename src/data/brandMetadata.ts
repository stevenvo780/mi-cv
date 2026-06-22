// Generated brand metadata from Pinakotheke Eikon config
export interface BrandPalette {
  bg: string;
  primario: string;
  acento: string;
  acento_2: string;
  acento_3: string;
  texto: string;
  texto_muted: string;
  surface: string;
}

export interface BrandMetadata {
  nombre_producto: string;
  nombre_corporativo: string;
  simbolo: string;
  frente: string | null;
  paleta: BrandPalette;
  gradiente_hero: string;
  gradiente_bg: string;
  tagline: string;
  titulo: string;
  subtitulo: string;
  copy: string;
  has_logo: boolean;
  logo_path: string | null;
}

export const BRAND_METADATA: Record<string, BrandMetadata> = {
  "clavis": {
    "nombre_producto": "Paideía",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "Π",
    "frente": "filosofia",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#e0a85e",
      "acento_2": "#b8873a",
      "acento_3": "#c0522a",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #e0a85e 0%, #b8873a 60%, #7a5520 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 30% 40%, #131e22 0%, #0b1417 70%)",
    "tagline": "Portal de humanidades digitales con 227 rutas estáticas en MDX: Griego Clásico (morfología, traducciones, glosario), Neurofilosofía (210 archivos, 10 módulos) y Filosofía de la Ciudad. Construido en Next.js 15, sin base de datos, 100% estático.",
    "titulo": "Paideía — Portal de humanidades",
    "subtitulo": "Griego Clásico · Neurofilosofía · Filosofía de la Ciudad",
    "copy": "227 rutas estáticas de contenido académico en MDX. Pinakothḗke.",
    "has_logo": true,
    "logo_path": "/brand/paideia/logo_lockup_color.png"
  },
  "debatesuite": {
    "nombre_producto": "Agón",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "⚔",
    "frente": "filosofia",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#e0a85e",
      "acento_2": "#c0522a",
      "acento_3": "#b8873a",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #e0a85e 0%, #c0522a 50%, #8b3a1a 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 25% 45%, #131e22 0%, #0b1417 70%)",
    "tagline": "PWA offline para moderar debates académicos y competitivos: gestiona turnos, cronómetro, puntuación y detección de falacias. Incluye simulador de dinámicas con autómata celular (canvas 2D).",
    "titulo": "Agón",
    "subtitulo": "Moderador de debates · agon.stevenvallejo.com",
    "copy": "Herramienta filosófica para el debate estructurado: timer, turnos, scoring, falacias y simulador de emergencias complejas.",
    "has_logo": true,
    "logo_path": "/brand/agon/logo_lockup_color.png"
  },
  "estructuras-preontologicas": {
    "nombre_producto": "Estructuras Preontológicas",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "Ω",
    "frente": "ciencias",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#e0a85e",
      "acento_2": "#cf6a3c",
      "acento_3": "#b8873a",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #e0a85e 0%, #cf6a3c 55%, #7a3a1a 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 35% 45%, #1a1810 0%, #0b1417 70%)",
    "tagline": "Tesis doctoral (Jacob Agudelo + Steven Vallejo, UdeA) en filosofía de la ciencia y ciencias de la complejidad: propone «estructuras pre-ontológicas» como regularidades operativas previas a la objetualidad, validadas mediante métrica EDI y compresión multiescala con evidencia multidominio.",
    "titulo": "Estructuras Preontológicas",
    "subtitulo": "Filosofía de la Ciencia · Investigación Doctoral",
    "copy": "Todo fenómeno empírico anclado en un sustrato dinámico. Compresión multiescala y evidencia EDI multidominio.",
    "has_logo": false,
    "logo_path": null
  },
  "complexlab": {
    "nombre_producto": "Kósmos",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "⬡",
    "frente": "ciencias",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#43b5a6",
      "acento_2": "#8d7cc0",
      "acento_3": "#A3E4D7",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #43b5a6 0%, #8d7cc0 60%, #4a3a80 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 30% 40%, #131e22 0%, #0b1417 70%)",
    "tagline": "Simulación del orden natural",
    "titulo": "Kósmos",
    "subtitulo": "Simulación científica · 16 repos · 22 páginas",
    "copy": "Emergencia, caos, redes, agentes y filosofía de la ciencia en un solo catálogo. Pinakothḗke.",
    "has_logo": true,
    "logo_path": "/brand/kosmos/logo_lockup_color.png"
  },
  "aporia": {
    "nombre_producto": "Áporía",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "∞",
    "frente": "ciencias",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#6fd3c4",
      "acento_2": "#43b5a6",
      "acento_3": "#2a7a70",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #6fd3c4 0%, #43b5a6 45%, #2a5a54 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 25% 55%, #0f2028 0%, #0b1417 70%)",
    "tagline": "Plataforma editorial CMS full-stack (Next.js 16 + Neon/Postgres + Firebase Auth): publica papers, archiva investigación y corre experimentos colectivos con visualización en tiempo real. Panel /studio para CRUD editorial con auth real.",
    "titulo": "Áporía",
    "subtitulo": "Paradojas · Fronteras del conocimiento · Ciencias",
    "copy": "Paradojas, problemas sin solución y las fronteras donde el rigor tropieza con lo inexplicable.",
    "has_logo": false,
    "logo_path": null
  },
  "nlp-to-logic": {
    "nombre_producto": "Órganon",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "⊢",
    "frente": "informatica",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#43b5a6",
      "acento_2": "#8d7cc0",
      "acento_3": "#A3E4D7",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #43b5a6 0%, #8d7cc0 55%, #5a3a9a 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 30% 40%, #131e22 0%, #0b1417 70%)",
    "tagline": "Pipeline interactivo en vivo: entrada en español → autologic (formalizador NLP basado en reglas) → ST (lenguaje lógico con SAT solver CDCL propio, 6 333 tests) → resultado ejecutado. Sin IA, sin base de datos, todo en proceso serverless Vercel.",
    "titulo": "Órganon",
    "subtitulo": "Lenguaje natural → lógica formal ejecutable",
    "copy": "NLP por reglas sin IA. Escribe un argumento en español, Órganon lo formaliza y ST lo ejecuta con un SAT solver CDCL propio.",
    "has_logo": true,
    "logo_path": "/brand/organon/logo_lockup_color.png"
  },
  "stevenai": {
    "nombre_producto": "Daímon",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "◉",
    "frente": "informatica",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#43b5a6",
      "acento_2": "#8d7cc0",
      "acento_3": "#2a7a70",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #8d7cc0 0%, #43b5a6 60%, #2a7a70 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 40% 30%, #131e22 0%, #0b1417 70%)",
    "tagline": "Vitrina de la pila de IA personal: Jarvis v1/v2 (RAG + ChromaDB, modelos 14B–70B), chat GGUF local (llama-cpp-python), swarm MCP con Ollama (deepseek-r1 + qwen2.5) y conversor OCR PDF→Markdown en GPU. Documentación estática Next.js 15.",
    "titulo": "Daímon",
    "subtitulo": "Vitrina de la pila de IA personal: Jarvis v1/v2 (RAG + ChromaDB, modelos 14B–70B), chat GGUF local (llama-cpp-python), swarm MCP con Ollama (deepseek-r1 + qwen2.5) y conversor OCR PDF→Markdown en GPU. Documentación estática Next.js 15.",
    "copy": "",
    "has_logo": true,
    "logo_path": "/brand/daimon/logo_lockup_color.png"
  },
  "stevendevbox": {
    "nombre_producto": "Téchne",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "⚙",
    "frente": "informatica",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#43b5a6",
      "acento_2": "#2a7a70",
      "acento_3": "#A3E4D7",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #43b5a6 0%, #2a7a70 60%, #1a4a45 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 25% 55%, #131e22 0%, #0b1417 70%)",
    "tagline": "Documentación y showcase de 4 devtools OSS para Linux: Ultimate Terminal (control distribuido de máquinas via browser), Mission Center Web (monitor de recursos sin Electron), clawbar (voz + barra de estado Hyprland con Whisper/Kokoro) e Hyprland Multi-Monitor (workspaces independientes por monitor). Astro Starlight, 100% estático.",
    "titulo": "Téchne — 8 devtools OSS",
    "subtitulo": "Pinakothḗke · Ingeniería",
    "copy": "Terminal remota distribuida, monitor de sistema web, log vault, CLI de automatización y más. Código abierto, sin lock-in.",
    "has_logo": true,
    "logo_path": "/brand/techne/logo_lockup_color.png"
  },
  "communityos": {
    "nombre_producto": "Koinonía",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "◎",
    "frente": "informatica",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#43b5a6",
      "acento_2": "#2a7a70",
      "acento_3": "#8d7cc0",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #43b5a6 0%, #2a7a70 50%, #8d7cc0 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 30% 50%, #131e22 0%, #0b1417 70%)",
    "tagline": "Plataforma multi-tenant para comunidades Discord: portal web (eventos, biblioteca, ranking, tienda, roles), API NestJS 10 + Neon Postgres y bot discord.js con XP y recompensas por voz. Un solo codebase y una sola BD para múltiples comunidades aisladas por tenantId.",
    "titulo": "Koinonía — Plataforma de comunidades",
    "subtitulo": "Multi-tenant · Eventos · Biblioteca · Ranking",
    "copy": "Next.js 15 + NestJS serverless + Neon + Firebase auth. Fusión de Cafetería del Caos y Tertulia Literaria.",
    "has_logo": true,
    "logo_path": "/brand/koinonia/logo_lockup_color.png"
  },
  "agora": {
    "nombre_producto": "Agora",
    "nombre_corporativo": "Elenxos",
    "simbolo": "ε",
    "frente": "agora",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0F2519",
      "acento": "#43b5a6",
      "acento_2": "#A3E4D7",
      "acento_3": "#2a7a70",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#0d1e12"
    },
    "gradiente_hero": "linear-gradient(135deg, #43b5a6 0%, #A3E4D7 60%, #0F2519 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 25% 60%, #0d1e12 0%, #0b1417 70%)",
    "tagline": "Traducimos el caos en estructuras lógicas",
    "titulo": "Agora · Elenxos",
    "subtitulo": "Plataforma académica de lógica formal ejecutable",
    "copy": "ST (SAT solver CDCL, 6333 tests) + auto.logic (NLP→lógica, 11 perfiles) + colaboración en tiempo real. Humanidades con el rigor de las ciencias.",
    "has_logo": false,
    "logo_path": null
  },
  "devkits": {
    "nombre_producto": "Érgon",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "▣",
    "frente": "ingenieria",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#43b5a6",
      "acento_2": "#2a7a70",
      "acento_3": "#A3E4D7",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #43b5a6 0%, #2a7a70 70%, #1a4a45 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 20% 60%, #131e22 0%, #0b1417 70%)",
    "tagline": "Landing comercial para una suite de tres starter kits PYME listos para customizar: CRM (React+Vite+Express), Hours Tracker (Next.js 15 + Turso) y VPN Manager (Flask+Docker). Modelo «80% construido, pagas el 20% a medida».",
    "titulo": "Érgon",
    "subtitulo": "Landing comercial para una suite de tres starter kits PYME listos para customizar: CRM (React+Vite+Express), Hours Tracker (Next.js 15 + Turso) y VPN Manager (Flask+Docker). Modelo «80% construido, pagas el 20% a medida».",
    "copy": "",
    "has_logo": true,
    "logo_path": "/brand/ergon/logo_lockup_color.png"
  },
  "devkits-hours": {
    "nombre_producto": "Chrónos",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "⏱",
    "frente": "ingenieria",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#43b5a6",
      "acento_2": "#2a7a70",
      "acento_3": "#A3E4D7",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #43b5a6 0%, #2a7a70 60%, #163a35 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 70% 30%, #131e22 0%, #0b1417 70%)",
    "tagline": "App SaaS de control de horas freelance y cuentas de cobro localizadas para Colombia: registro individual y masivo, cálculo de ingresos con tarifa configurable, exportación PDF, filtros por día de semana y llenado automático por promedios. Next.js 15 + SQLite.",
    "titulo": "Chrónos",
    "subtitulo": "App SaaS de control de horas freelance y cuentas de cobro localizadas para Colombia: registro individual y masivo, cálculo de ingresos con tarifa configurable, exportación PDF, filtros por día de semana y llenado automático por promedios. Next.js 15 + SQLite.",
    "copy": "",
    "has_logo": true,
    "logo_path": "/brand/chronos/logo_lockup_color.png"
  },
  "devkits-crm": {
    "nombre_producto": "Xenía",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "◇",
    "frente": "informatica",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#43b5a6",
      "acento_2": "#2a7a70",
      "acento_3": "#e0a85e",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #43b5a6 0%, #2a7a70 50%, #e0a85e 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 35% 45%, #131e22 0%, #0b1417 70%)",
    "tagline": "CRM para PYMEs colombianas con 19 entidades: pipeline kanban, contactos, empresas, negocios, actividades, cotizaciones y facturas. Localizado para NIT, COP, departamentos y tipos societarios. React 19 + Vite + Express + Neon Postgres, desplegado en Vercel.",
    "titulo": "Xenía",
    "subtitulo": "CRM para PYMEs colombianas con 19 entidades: pipeline kanban, contactos, empresas, negocios, actividades, cotizaciones y facturas. Localizado para NIT, COP, departamentos y tipos societarios. React 19 + Vite + Express + Neon Postgres, desplegado en Vercel.",
    "copy": "",
    "has_logo": true,
    "logo_path": "/brand/xenia/logo_lockup_color.png"
  },
  "scrapekit": {
    "nombre_producto": "Nómos",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "§",
    "frente": "informatica",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#43b5a6",
      "acento_2": "#2a7a70",
      "acento_3": "#A3E4D7",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #2a7a70 0%, #43b5a6 60%, #A3E4D7 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 65% 35%, #131e22 0%, #0b1417 70%)",
    "tagline": "Indexador de documentos legislativos con búsqueda full-text: adapta scraping a Cámara y Senado de Colombia y Cámara de Diputados de RD. FastAPI + Neon Postgres + Mangum en Vercel serverless. Patrón Source Adapter intercambiable sin tocar el pipeline.",
    "titulo": "Nómos",
    "subtitulo": "Indexador de documentos legislativos con búsqueda full-text: adapta scraping a Cámara y Senado de Colombia y Cámara de Diputados de RD. FastAPI + Neon Postgres + Mangum en Vercel serverless. Patrón Source Adapter intercambiable sin tocar el pipeline.",
    "copy": "",
    "has_logo": true,
    "logo_path": "/brand/nomos/logo_lockup_color.png"
  },
  "warehouse": {
    "nombre_producto": "Apothḗke",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "▦",
    "frente": "informatica",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#43b5a6",
      "acento_2": "#2a7a70",
      "acento_3": "#A3E4D7",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #43b5a6 0%, #2a7a70 65%, #163a35 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 25% 65%, #131e22 0%, #0b1417 70%)",
    "tagline": "Sistema de gestión de almacén e inventario: stock, órdenes, movimientos, roles (admin/manager/worker), notificaciones y analítica. React 19 + Vite + Neon Postgres en funciones serverless Vercel, con seed de datos demo.",
    "titulo": "Apothḗke",
    "subtitulo": "Sistema de gestión de almacén e inventario: stock, órdenes, movimientos, roles (admin/manager/worker), notificaciones y analítica. React 19 + Vite + Neon Postgres en funciones serverless Vercel, con seed de datos demo.",
    "copy": "",
    "has_logo": true,
    "logo_path": "/brand/apotheke/logo_lockup_color.png"
  },
  "eikon": {
    "nombre_producto": "Eikón",
    "nombre_corporativo": "Pinakothḗke",
    "simbolo": "◈",
    "frente": "informatica",
    "paleta": {
      "bg": "#0b1417",
      "primario": "#0b1417",
      "acento": "#43b5a6",
      "acento_2": "#e0a85e",
      "acento_3": "#cf6a3c",
      "texto": "#e8e0d4",
      "texto_muted": "#8fa3a8",
      "surface": "#131e22"
    },
    "gradiente_hero": "linear-gradient(135deg, #43b5a6 0%, #e0a85e 50%, #cf6a3c 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 50% 30%, #152028 0%, #0b1417 65%)",
    "tagline": "Generador de pack de imagen de marca en GPU local (SDXL / FLUX.1-schnell): produce 15+ renders sociales (LinkedIn, Instagram, X, YouTube, WhatsApp, OG) para el media kit. Python puro, RTX 5070 Ti requerida. Herramienta interna.",
    "titulo": "Eikón",
    "subtitulo": "Logos · Paletas · Kits de identidad visual · IA",
    "copy": "Generador de imagen de marca: logos, paletas, activos visuales y kits de identidad con IA.",
    "has_logo": false,
    "logo_path": null
  },
  "prizma": {
    "nombre_producto": "Prizma",
    "nombre_corporativo": "Prizma",
    "simbolo": "◈",
    "frente": null,
    "paleta": {
      "bg": "#0c0e10",
      "primario": "#0c0e10",
      "acento": "#f0b94a",
      "acento_2": "#d4622e",
      "acento_3": "#43b5a6",
      "texto": "#f0ece6",
      "texto_muted": "#a09080",
      "surface": "#16120e"
    },
    "gradiente_hero": "linear-gradient(135deg, #f0b94a 0%, #d4622e 55%, #9e3015 100%)",
    "gradiente_bg": "radial-gradient(ellipse at 70% 30%, #1a120a 0%, #0c0e10 65%)",
    "tagline": "Suite corporativa modular en producción sobre Cloud Run: POS con facturación DIAN (Talanton), crédito sin interés (Pistis), marketing por WhatsApp (Iris), e-commerce conversacional (Hermes), logística última milla (Talaria) y CRM, orquestados por un hub de eventos (Nous). NestJS + Next.js, 8 microservicios desplegados.",
    "titulo": "Prizma",
    "subtitulo": "Suite empresarial modular",
    "copy": "POS · Crédito · WhatsApp · E-commerce · Logística — en producción con clientes reales sobre Cloud Run.",
    "has_logo": false,
    "logo_path": null
  }
};
