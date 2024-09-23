import Header from './components/Header';
import Tools from './components/Tools';
import Portfolio from './components/Portafolio';
import Skills from './components/Skills';
import Achievements from './components/Achievements';

import LorenzAttractor from './components/LorenzAttractor';
import MandelbrotSet from './components/MandelbrotSet';
import ParticleFlow from './components/ParticleFlow';

export default function Home() {
  return (
    <>
      <div style={{ paddingBottom: '7rem' }}>
        <Header />
      </div >
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
