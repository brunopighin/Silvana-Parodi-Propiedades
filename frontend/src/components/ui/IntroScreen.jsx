import { useState, useEffect } from 'react';

export default function IntroScreen({ onDone }) {
  const [phase, setPhase] = useState('enter'); // enter → hold → leave

  useEffect(() => {
    const hold  = setTimeout(() => setPhase('leave'), 1800);
    return () => clearTimeout(hold);
  }, []);

  useEffect(() => {
    if (phase !== 'leave') return;
    const exit = setTimeout(onDone, 800);
    return () => clearTimeout(exit);
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
