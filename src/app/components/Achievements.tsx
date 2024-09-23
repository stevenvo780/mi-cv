import styles from '@/styles/Home.module.css';

interface AchievementItem {
  title: string;
  description: string;
}

const achievements: AchievementItem[] = [
  {
    title: "Emprendimiento Humanizar",
    description: "Proveer software a empresas por servicio.",
  },
  {
    title: "Jarvis",
    description: "Proyecto que busca emular el comportamiento de la mente adaptado a una perspectiva informática.",
  },
  {
    title: "Tertulia Literaria",
    description: "La más grande comunidad de literatura de habla hispana en Discord.",
  },
  // Añade más logros aquí
];

export default function Achievements() {
  return (
    <section>
      <h3>Logros</h3>
      {achievements.map((ach, index) => (
        <div key={index} className={styles.achievementItem}>
          <h4>{ach.title}</h4>
          <p>{ach.description}</p>
        </div>
      ))}
    </section>
  );
}
