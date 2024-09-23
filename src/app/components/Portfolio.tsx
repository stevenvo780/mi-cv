interface PortfolioItem {
  name: string;
  link: string;
}

const portfolioItems: PortfolioItem[] = [
  { name: "GitHub", link: "https://github.com/stevenvo780" },
  { name: "CodeRank", link: "https://profile.codersrank.io/user/stevenvo780" },
  { name: "Videojuegos", link: "https://mega.nz/folder/dLZwHCAL#A4xL0DJDmbkOej5uDP96xg" },
  // Añade más elementos al portafolio
];

export default function Portfolio() {
  return (
    <section>
      <h3>Portafolio</h3>
      <ul>
        {portfolioItems.map((item, index) => (
          <li key={index}>
            <a href={item.link} target="_blank" rel="noreferrer">{item.name}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
