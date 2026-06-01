import { useState, useEffect } from 'react';

export default function IntroScreen({ onDone }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const t = setTimeout(() => setPhase('leave'), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'leave') return;
    const t = setTimeout(onDone, 800);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  return (
    <div className={`intro-wrap intro-${phase}`}>
      <img
        src={`${import.meta.env.BASE_URL}logo-silvana-parodi.png`}
        alt="Silvana Parodi Propiedades"
        className="intro-logo-img"
      />
    </div>
  );
}
