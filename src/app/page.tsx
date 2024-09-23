import Header from './components/Header';
import Tools from './components/Tools';
import Portfolio from './components/Portfolio';
import Skills from './components/Skills';
import Achievements from './components/Achievements';
import GameOfLife from './components/GameOfLife';

export default function Home() {
  return (
    <>
      <Header />
      <GameOfLife />
      <Tools />
      <Portfolio />
      <Achievements />
      <Skills />
    </>
  );
}
