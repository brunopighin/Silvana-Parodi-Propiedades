import { useEffect, useRef, useState } from 'react';

export default function MagneticCursor() {
  const cursorRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onEnter = (e) => {
      if (e.target.closest('a, button, [data-magnetic]')) setHovering(true);
    };
    const onLeave = (e) => {
      if (e.target.closest('a, button, [data-magnetic]')) setHovering(false);
    };

    const onLeaveWindow = () => setVisible(false);
    const onEnterWindow = () => setVisible(true);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout', onLeave);
    document.addEventListener('mouseleave', onLeaveWindow);
    document.addEventListener('mouseenter', onEnterWindow);

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      current.current.x = lerp(current.current.x, pos.current.x, 0.14);
      current.current.y = lerp(current.current.y, pos.current.y, 0.14);

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${current.current.x}px, ${current.current.y}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout', onLeave);
      document.removeEventListener('mouseleave', onLeaveWindow);
      document.removeEventListener('mouseenter', onEnterWindow);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  const size = hovering ? 36 : 28;
  const offset = size / 2;

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>

      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: size,
          height: size,
          marginLeft: -offset,
          marginTop: -offset,
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s, width 0.15s, height 0.15s, margin 0.15s',
          willChange: 'transform',
          filter: hovering
            ? 'drop-shadow(0 0 6px rgba(196,17,17,0.7))'
            : 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          style={{
            transform: `rotate(${hovering ? -20 : -45}deg)`,
            transition: 'transform 0.2s ease',
          }}
        >
          <circle cx="8" cy="8" r="5" stroke="#d11119" strokeWidth="2" fill="white" />
          <circle cx="8" cy="8" r="2.5" fill="#d11119" />
          <path
            d="M12 12 L20 20"
            stroke="#d11119"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M17 19 L17 22"
            stroke="#d11119"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20 20 L20 23"
            stroke="#d11119"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  );
}
