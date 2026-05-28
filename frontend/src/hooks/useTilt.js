import { useRef, useCallback } from 'react';

export function useTilt(maxDeg = 8) {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;   // -0.5 a 0.5
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * maxDeg * 2}deg) rotateX(${-y * maxDeg * 2}deg) scale3d(1.02,1.02,1.02)`;

    const shine = el.querySelector('[data-shine]');
    if (shine) {
      shine.style.opacity = '1';
      shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.12) 0%, transparent 70%)`;
    }
  }, [maxDeg]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
    const shine = el.querySelector('[data-shine]');
    if (shine) shine.style.opacity = '0';
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
