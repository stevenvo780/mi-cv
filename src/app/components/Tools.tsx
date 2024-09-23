import styles from '@/styles/Home.module.css';

interface ToolCategory {
  category: string;
  items: string[];
}

const tools: ToolCategory[] = [
  {
    category: "BackEnd",
    items: ["PHP (SLIM, Laravel, Symfony)", "Node.js (Express, Strapi, Apollo, NestJS)", "Python"],
  },
  {
    category: "FrontEnd",
    items: ["HTML", "CSS3 (Bootstrap, MaterialUI, Bulma)", "JavaScript, SASS"],
  },
  {
    category: "Bases de Datos",
    items: ["MongoDB, MariaDB", "SQL Server, NEO4j, PostgreSQL, Firebase"],
  },
  {
    category: "IA",
    items: ["TensorFlow, PyTorch", "node-nlp, Numpy, Wolfram Alpha, PNL"],
  },
  // Añade más categorías de herramientas aquí
];

export default function Tools() {
  return (
    <section>
      <h3>Herramientas</h3>
      {tools.map((tool, index) => (
        <div key={index} className={styles.toolsCategory}>
          <h4>{tool.category}</h4>
          <ul>
            {tool.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
