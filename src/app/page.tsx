import Header from './components/Header';
import Tools from './components/Tools';
import Portfolio from './components/Portafolio';
import Skills from './components/Skills';
import Achievements from './components/Achievements';
import GameOfLife from './components/GameOfLife';
import LorenzAttractor from './components/LorenzAttractor';
import MandelbrotSet from './components/MandelbrotSet';
import ParticleFlow from './components/ParticleFlow';

export default function Home() {
  return (
    <>
      <Header />
      <GameOfLife />
      <Tools />
      <Portfolio />
      <LorenzAttractor />
      <Achievements />
      <ParticleFlow />
      <Skills />
      <MandelbrotSet />
    </>
  );
}
