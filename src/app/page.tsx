import Header from './components/Header';
import Tools from './components/Tools';
import Portfolio from './components/Portafolio';
import Skills from './components/Skills';
import Achievements from './components/Achievements';
import ContactMe from './components/ContactMe';

export default function Home() {
  return (
    <>
      <Header />
      <Achievements />
      <Portfolio />
      <Tools />
      <Skills />
      <ContactMe />
    </>
  );
}
