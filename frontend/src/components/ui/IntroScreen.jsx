import { useState, useEffect } from 'react';

export default function IntroScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setLeaving(true), 2400);
    return () => clearTimeout(show);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const exit = setTimeout(onDone, 900);
    return () => clearTimeout(exit);
  }, [leaving, onDone]);

  return (
    <div className={`intro-screen${leaving ? ' intro-leaving' : ''}`}>
      <img src="/fotomodificada.jpg" className="intro-img" alt="" />
      <div className="intro-logo">
        <img src="/silvana parodi fondo transparente.png" alt="Silvana Parodi Propiedades" />
      </div>
    </div>
  );
}
