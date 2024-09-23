import {
  faReact,
  faNodeJs,
  faPython,
} from '@fortawesome/free-brands-svg-icons';
import {
  faBook,
  faAtom,
  faCode,
} from '@fortawesome/free-solid-svg-icons';
import { PortfolioCategory } from './types';
import { faGamepad } from '@fortawesome/free-solid-svg-icons/faGamepad';


export const portfolioCategories: PortfolioCategory[] = [
  {
    name: 'Programación',
    icon: faCode,
    projects: [
      {
        name: 'Tertulia Literaria Frontend',
        link: 'https://github.com/stevenvo780/tertulialiteraria-frond',
        description:
          'Plataforma web para fomentar el diálogo y el aprendizaje en literatura, filosofía y más.',
        icon: faReact,
        important: true,
      },
      {
        name: 'Tertulia Literaria API',
        link: 'https://github.com/stevenvo780/tertulialiteraria-api',
        description:
          'API construida con NestJS para la comunidad de Tertulia Literaria.',
        icon: faNodeJs,
        important: true,
      },
      {
        name: 'PLACETOPAY',
        link: 'https://github.com/stevenvo780/tienda',
        description:
          'Implementación de una tienda en línea con integración de pagos.',
        icon: faCode,
        important: true,
      },
      {
        name: 'Template React Big APP',
        link: 'https://github.com/stevenvo780/TemplateReactBigAPP',
        description: 'Plantilla para aplicaciones grandes en React.',
        icon: faReact,
        important: true,
      },
      {
        name: 'Aurora CQRS',
        link: 'https://github.com/stevenvo780/auroraCQRS',
        description: 'Implementación de patrones CQRS en aplicaciones.',
        icon: faReact,
        important: true,
      },
      {
        name: 'API Node MongoDB',
        link: 'https://github.com/stevenvo780/api-node-mongodb',
        description: 'API RESTful construida con Node.js y MongoDB.',
        icon: faNodeJs,
        important: true,
      },
      {
        name: 'GraphQL Example',
        link: 'https://github.com/stevenvo780/GraphQLExample',
        description: 'Ejemplos y prácticas con GraphQL.',
        icon: faNodeJs,
        important: true,
      },
      {
        name: 'Laravel React REST',
        link: 'https://github.com/stevenvo780/LaravelReactREST',
        description: 'Aplicación full-stack con Laravel y React.',
        icon: faReact,
        important: true,
      },
      {
        name: 'Mi CV',
        link: 'https://github.com/stevenvo780/mi-cv',
        description: 'Este proyecto de CV en NextJs tambien es open source .',
        icon: faReact,
        important: true,
      },
      {
        name: 'Neutrino Sugar',
        link: 'https://github.com/stevenvo780/NeutrinoSugar',
        description: 'Utilidades y herramientas para proyectos Neutrino.',
        important: false,
      },
      {
        name: 'Sueño Dorado',
        link: 'https://github.com/stevenvo780/SuenoDorado',
        description: 'Proyecto de esquema ponzi.',
        important: false,
      },
      {
        name: 'Hardware para Programadores',
        link: 'https://github.com/stevenvo780/hardwareParaProgramadores',
        description: 'Guía y recomendaciones de hardware para programadores.',
        icon: faPython,
        important: false,
      },
      {
        name: 'Neuronal Learning',
        link: 'https://github.com/stevenvo780/neuronalLearning',
        description: 'Proyecto de aprendizaje neuronal y redes neuronales.',
        icon: faReact,
        important: true,
      },
    ],
  },
  {
    name: 'Matemáticas y Ciencias',
    icon: faAtom,
    projects: [
      {
        name: 'Teoría de la Información en Comunicación Celular',
        link: 'https://github.com/stevenvo780/teoria-informacion',
        description:
          'Simulación de comunicación entre células utilizando teoría de la información.',
        icon: faPython,
        important: true,
      },
      {
        name: 'Teoría del Caos y Atractor de Lorenz',
        link: 'https://github.com/stevenvo780/teoria-caos',
        description:
          'Exploración de la teoría del caos a través del Atractor de Lorenz.',
        icon: faPython,
        important: true,
      },
      {
        name: 'Sistema Económico Simulado',
        link: 'https://github.com/stevenvo780/teoria-sistemas',
        description:
          'Modelo de simulación de un sistema económico desde la teoría de sistemas.',
        icon: faPython,
        important: true,
      },
      {
        name: 'Algoritmo de Entrenamiento del Universo',
        link: 'https://github.com/stevenvo780/emergentismo-tesis',
        description:
          'Simulación del comportamiento de un universo con reglas físicas específicas.',
        icon: faPython,
        important: true,
      },
      {
        name: 'Fenómenos Emergentes en el Juego de la Vida de Conway',
        link: 'https://github.com/stevenvo780/emergencia-juego-de-conwey',
        description:
          'Exploración de propiedades emergentes en el Juego de la Vida de Conway.',
        icon: faPython,
        important: true,
      },
      {
        name: 'Modelo MASOES con Simulación en Python',
        link: 'https://github.com/stevenvo780/teoria-MASOES',
        description: 'Simulación de sistemas adaptativos emocionales.',
        icon: faPython,
        important: true,
      },
      {
        name: 'Teoría de Juegos',
        link: 'https://github.com/stevenvo780/teoria-de-juegos',
        description: 'Análisis y simulaciones en teoría de juegos.',
        icon: faPython,
        important: true,
      },
      {
        name: 'Teoría de la Complejidad',
        link: 'https://github.com/stevenvo780/complejidad-teoria',
        description: 'Estudios y experimentos en teoría de la complejidad.',
        icon: faPython,
        important: true,
      },
      {
        name: 'Teoría de la Decisión',
        link: 'https://github.com/stevenvo780/teoria-desicion',
        description: 'Estudios en teoría de la decisión.',
        icon: faPython,
        important: true,
      },
      {
        name: 'Extended RULIAT Graph',
        link: 'https://github.com/stevenvo780/teoria-ruliat',
        description:
          'Exploración del espacio de reglas de autómatas celulares.',
        icon: faPython,
        important: false,
      },
      {
        name: 'Experimento Macro-Micro',
        link: 'https://github.com/stevenvo780/experimento-macro-micro',
        description:
          'Simulación de interacciones macro y micro en sistemas complejos.',
        important: false,
      },
      {
        name: 'Sistema de Transporte Trenes',
        link: 'https://github.com/stevenvo780/SistemaDeTrasporteTrenes',
        description: 'Proyecto sobre sistemas de transporte ferroviario.',
        important: false,
      },
      {
        name: 'Experimento de Temperatura Emergente',
        link: 'https://github.com/stevenvo780/emergencia-experimento-temperatura',
        description:
          'Estudios de fenómenos emergentes relacionados con temperatura.',
        important: false,
      },
      {
        name: 'Entropía del Vacío',
        link: 'https://github.com/stevenvo780/entropia-vacio',
        description: 'Estudio sobre la entropía en sistemas de vacío cuántico.',
        icon: faPython,
        important: false,
      },
    ],
  },
  {
    name: 'Juegos',
    icon: faGamepad,
    projects: [
      {
        name: 'Roblox game',
        link: 'https://www.roblox.com/es/games/13343028059/ILS-TEST',
        description: 'Juego de prueba en la plataforma Roblox.',
        icon: faGamepad,
        important: true,
      },
      {
        name: 'Cashel: Resurgir de los Imperios',
        link: 'https://www.cashelresurgirdelosimperios.org/',
        description: 'Juego de estrategia económica y construcción de imperios.',
        icon: faGamepad,
        important: true,
      },
      {
        name: 'Escape Room ILS',
        link: 'https://www.roblox.com/es/games/13109815288/escape-room-ILS',
        description: 'Juego simple de buscar salida en la plataforma Roblox.',
        icon: faGamepad,
        important: true,
      },
    ],
  },
  {
    name: 'Literatura y Filosofía',
    icon: faBook,
    projects: [
      {
        name: 'Tertulia Literaria',
        link: 'https://www.tertulia-literaria.com/',
        description:
          'Proyecto de filosofía, ciencias, literatura y arte',
        icon: faBook,
        important: true,
      },
      {
        name: 'Artículos de Filosofía',
        link: 'https://medium.com/@stevenvallejo780',
        description:
          'Perfil de medium con disertaciones filosóficas',
        icon: faBook,
        important: true,
      },
    ],
  },
];