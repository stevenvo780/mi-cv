import styles from '@/styles/Home.module.css';

interface EducationItem {
  title: string;
  date: string;
  location: string;
}

const educationItems: EducationItem[] = [
  {
    title: "Técnica en Desarrollo de Software - SENA",
    date: "2017",
    location: "Medellín, Antioquia, Colombia",
  },
  {
    title: "Curso de Desarrollo para HTC VR - SENA",
    date: "2017",
    location: "Medellín, Antioquia, Colombia",
  },
 
  // Puedes añadir más elementos de educación aquí
];

export default function Education() {
  return (
    <section>
      <h3>Educación</h3>
      {educationItems.map((edu, index) => (
        <div key={index} className={styles.educationItem}>
          <h4>{edu.title}</h4>
          <p><strong>{edu.date}</strong> | {edu.location}</p>
        </div>
      ))}
    </section>
  );
}
