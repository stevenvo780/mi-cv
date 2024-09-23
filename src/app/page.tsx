import Header from './components/Header';
import Experience from './components/Experience';
import Tools from './components/Tools';
import Portfolio from './components/Portfolio';
import Skills from './components/Skills';
import Education from './components/Education';
import Achievements from './components/Achievements';
import '@/styles/Home.module.css';

export default function Home() {
  return (
    <div>
      <Header />
      <Experience />
      <Tools />
      <Portfolio />
      <Skills />
      <Education />
      <Achievements />
    </div>
  );
}
