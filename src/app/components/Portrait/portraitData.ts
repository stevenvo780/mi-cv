// Narrative intellectual portrait for the home (stevenvallejo.com).
// NOT a CV, NOT skills. Axes from master-brief-webs.md §2.
// Public-content rules respected: no addictions, no romance, no "immoral" past,
// no cause of the 2019 exile, no victimhood, no debts, no contempt.
// Saitama register: power and solitude shown by understatement, never declared.

export type Locale = 'es' | 'en';

export interface PortraitSection {
  kicker: string;
  title: string;
  body: string[];
  question: string; // each section closes with an open question / tension
}

export interface PortraitStrings {
  heroKicker: string;
  heroTitle: string;
  heroLead: string;
  epigraph: string;
  sections: PortraitSection[];
  blogTitle: string;
  blogLead: string;
  blogCta: string;
  cvCta: string;
  servicesCta: string;
  footNote: string;
}

export const PORTRAIT: Record<Locale, PortraitStrings> = {
  es: {
    heroKicker: 'Abstracción',
    heroTitle: 'Pensar antes de construir.',
    heroLead:
      'Llegué a la filosofía desde la ingeniería, no al revés. No soy un humanista que aprendió a programar: soy alguien que llevó muchos sistemas a producción y descubrió que el cuello de botella casi nunca era técnico, sino conceptual. Hablo de abstracción con las manos manchadas de producción.',
    epigraph: '«La abstracción no es alejarse del problema. Es verlo desde la altura exacta.»',
    sections: [
      {
        kicker: 'El método',
        title: 'Abstracción',
        body: [
          'Antes de escribir una línea de código intento ver el problema entero desde la altura exacta: sus límites, sus consecuencias, lo necesario separado de lo accesorio. La filosofía me dio ese método —analizar, definir con precisión, distinguir— y la ingeniería me dio el lugar donde el método se vuelve algo que la gente usa todos los días.',
          'Pensar bien antes de construir puede costar caro: es más lento al principio y exige resistir la prisa. Pero es lo único que sostiene un sistema cuando crece. La abstracción no es teoría sobre la práctica; es una práctica diaria.',
        ],
        question: '¿Cuánto de lo que llamamos un problema técnico es, en realidad, un problema mal planteado?',
      },
      {
        kicker: 'El origen',
        title: 'Criado por una pantalla',
        body: [
          'Crecí en un barrio de Antioquia, autodidacta, con un universo que cabía en un computador recalentado. Me crió internet: foros de gringos a las tres de la mañana, manuales mal traducidos, prueba y error sin testigos. El poder, si lo hay, no fue un don; fue paciencia rara —la de quien le habla bonito a una máquina hasta que arranca.',
          'Aprendí por repetición, en silencio, mucho antes de tener con quién compartirlo. Ese fue el primer entrenamiento: aburrido, largo, sin público.',
        ],
        question: '¿Y si la profundidad no se hereda ni se enseña, sino que solo se entrena?',
      },
      {
        kicker: 'El exilio y la obra',
        title: 'La cueva',
        body: [
          'En 2019 la gente se fue y me recluí. De esa soledad —llevada al extremo— salieron los sistemas más grandes que he construido. Lo que entró a la cueva fue un técnico; lo que salió traía una pregunta filosófica.',
          'No lo cuento como pena. La soledad del que es muy distinto no tiene por qué doler: a veces es solo el aburrimiento del que no encuentra rival, y ese aburrimiento, bien usado, se vuelve obra.',
        ],
        question: '¿Qué se construye cuando dejas de construir para otros y empiezas a construir para entender?',
      },
      {
        kicker: 'El Gorgias',
        title: 'La palabra que hace pensar',
        body: [
          'Aprendí buena parte de lo humano moderando comunidades de miles de personas. Ahí la retórica deja de ser adorno y se vuelve responsabilidad: hay una palabra que solo quiere ganar y otra que hace pensar. El Gorgias de Platón me dejó esa distinción como brújula.',
          'No basta con saber persuadir o ejecutar; hay que saber hacia qué fin. El dominio de la palabra, como el de la máquina, multiplica fuerza —no fabrica criterio.',
        ],
        question: '¿De qué sirve convencer si no se sabe mostrar lo verdadero?',
      },
      {
        kicker: 'Lógica ejecutable',
        title: 'Cuando un argumento se puede correr',
        body: [
          'Escribí ST, un lenguaje donde la lógica formal no se estudia: se ejecuta. Tiene su propio SAT solver, teoría de tipos y miles de pruebas que la sostienen. Un argumento deja de ser comentario y se vuelve código que se corre y se verifica.',
          'Eso abre una pregunta que me interesa más que el lenguaje en sí: si la lógica formal puede correr en una máquina, ¿qué dice eso sobre el pensamiento? Demostrar y calcular no son lo mismo, y la frontera entre ambos es el terreno donde trabajo.',
        ],
        question: '¿Pensar es calcular, o calcular es apenas la sombra que el pensar proyecta sobre una máquina?',
      },
      {
        kicker: 'Filosofía de la IA',
        title: 'El agente y el criterio',
        body: [
          'Me interesa lo que casi nadie pregunta del lado técnico: la diferencia entre el agente que ejecuta y el chatbot que conversa; entre el sistema que decide y el que repite. Trabajo a diario con IA agentica y, justamente por eso, sé lo que no hace.',
          'La máquina multiplica fuerza, pero no fabrica criterio. El criterio sigue siendo humano: definir el fin, sostener la consecuencia, decir qué cuenta como conocimiento. Eso ninguna emergencia lo entrega gratis.',
        ],
        question: '¿Qué parte de nuestra inteligencia es justamente la que no podemos delegar?',
      },
      {
        kicker: 'Las Ágoras',
        title: 'La plaza de los jueves',
        body: [
          'Cada jueves abro una plaza: una conversación filosófica entre gente que no necesariamente comparte mi lenguaje. Es el humanista entre quienes no lo son, la palabra puesta en común. La calidez aquí no es un dato de nacimiento; es una conquista, algo que se aprende a sostener.',
          'Es el contrapunto cálido a la lógica formal: lo que queda cuando lo formalizado no alcanza, cuando el cuerpo, el espacio y el otro entran en la ecuación.',
        ],
        question: '¿Qué entiende mejor un sistema: el que lo construye o el que lo discute en voz alta?',
      },
    ],
    blogTitle: 'Abstracción — el blog',
    blogLead:
      'Filosofía aplicada a la máquina. Ensayos sobre cómo pensamos, cómo decidimos y cómo construimos inteligencia. Escribo en el cruce, para quien ya tiene las dos bases.',
    blogCta: 'Leer el blog',
    cvCta: 'Ver la hoja de vida',
    servicesCta: 'Servicios',
    footNote: 'El traje divino zumba; el piloto sigue siendo un tipo común.',
  },
  en: {
    heroKicker: 'Abstraction',
    heroTitle: 'Think before you build.',
    heroLead:
      'I came to philosophy from engineering, not the other way around. I am not a humanist who learned to code: I am someone who took many systems to production and found that the real bottleneck was almost never technical, but conceptual. I talk about abstraction with my hands stained by production.',
    epigraph: '"Abstraction is not stepping away from the problem. It is seeing it from the exact height."',
    sections: [
      {
        kicker: 'The method',
        title: 'Abstraction',
        body: [
          'Before writing a single line of code I try to see the whole problem from the exact height: its limits, its consequences, the necessary separated from the incidental. Philosophy gave me that method —analyze, define precisely, distinguish— and engineering gave me the place where the method becomes something people use every day.',
          'Thinking well before building can be costly: it is slower at first and demands resisting the rush. But it is the only thing that holds a system up as it grows. Abstraction is not theory about practice; it is a daily practice.',
        ],
        question: 'How much of what we call a technical problem is, in fact, a badly stated one?',
      },
      {
        kicker: 'The origin',
        title: 'Raised by a screen',
        body: [
          'I grew up in a neighborhood in Antioquia, self-taught, with a universe that fit inside an overheating computer. The internet raised me: foreign forums at three in the morning, badly translated manuals, trial and error with no witnesses. The power, if any, was no gift; it was a strange patience —the patience of someone who talks gently to a machine until it boots.',
          'I learned by repetition, in silence, long before I had anyone to share it with. That was the first training: boring, long, with no audience.',
        ],
        question: 'What if depth is neither inherited nor taught, but only trained?',
      },
      {
        kicker: 'The exile and the work',
        title: 'The cave',
        body: [
          'In 2019 people left and I withdrew. Out of that solitude —taken to the extreme— came the largest systems I have ever built. What entered the cave was a technician; what came out carried a philosophical question.',
          'I do not tell it as grief. The solitude of the one who is very different need not hurt: sometimes it is only the boredom of finding no rival, and that boredom, well used, becomes work.',
        ],
        question: 'What do you build when you stop building for others and start building to understand?',
      },
      {
        kicker: 'The Gorgias',
        title: 'The word that makes you think',
        body: [
          'I learned much of what is human by moderating communities of thousands. There, rhetoric stops being ornament and becomes responsibility: there is a word that only wants to win and another that makes you think. Plato\'s Gorgias left me that distinction as a compass.',
          'It is not enough to know how to persuade or execute; one must know toward what end. Mastery of the word, like mastery of the machine, multiplies force —it does not manufacture judgment.',
        ],
        question: 'What good is convincing if you cannot show what is true?',
      },
      {
        kicker: 'Executable logic',
        title: 'When an argument can be run',
        body: [
          'I wrote ST, a language where formal logic is not studied: it is executed. It has its own SAT solver, type theory and thousands of tests that hold it up. An argument stops being commentary and becomes code that runs and is verified.',
          'That opens a question I care about more than the language itself: if formal logic can run on a machine, what does that say about thought? Proving and computing are not the same, and the border between them is the ground I work on.',
        ],
        question: 'Is thinking computing, or is computing only the shadow thought casts on a machine?',
      },
      {
        kicker: 'Philosophy of AI',
        title: 'The agent and the judgment',
        body: [
          'I care about what almost no one on the technical side asks: the difference between the agent that executes and the chatbot that converses; between the system that decides and the one that repeats. I work with agentic AI every day and, precisely because of that, I know what it does not do.',
          'The machine multiplies force, but it does not manufacture judgment. Judgment stays human: defining the end, holding the consequence, saying what counts as knowledge. No emergence hands that over for free.',
        ],
        question: 'Which part of our intelligence is exactly the part we cannot delegate?',
      },
      {
        kicker: 'The Agoras',
        title: 'The Thursday square',
        body: [
          'Every Thursday I open a square: a philosophical conversation among people who do not necessarily share my language. It is the humanist among those who are not, the word held in common. Warmth here is no birthright; it is a conquest, something you learn to sustain.',
          'It is the warm counterpoint to formal logic: what remains when the formalized does not reach, when the body, the space and the other enter the equation.',
        ],
        question: 'Who understands a system better: the one who builds it or the one who argues it out loud?',
      },
    ],
    blogTitle: 'Abstraction — the blog',
    blogLead:
      'Philosophy applied to the machine. Essays on how we think, how we decide and how we build intelligence. I write at the intersection, for the reader who already has both grounds.',
    blogCta: 'Read the blog',
    cvCta: 'See the résumé',
    servicesCta: 'Services',
    footNote: 'The divine suit hums; the pilot is still an ordinary guy.',
  },
};
