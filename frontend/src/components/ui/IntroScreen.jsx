import { useState, useEffect } from 'react';

export default function IntroScreen({ onDone }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const t = setTimeout(() => setPhase('leave'), 1900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'leave') return;
    const t = setTimeout(onDone, 800);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  return (
    <div className={`intro-wrap intro-${phase}`}>
      <div className="intro-glow" />
      <div className="intro-logo-container">
        <img
          src={`${import.meta.env.BASE_URL}logo-silvana-parodi.png`}
          alt="Silvana Parodi Propiedades"
          className="intro-logo-img"
        />
      </div>
      <div className="intro-shine" />
    </div>
  );
}
