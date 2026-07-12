'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';

export default function BeforeAfterSlider({
  before,
  after,
  beforeLabel = 'BEFORE',
  afterLabel  = 'AFTER',
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const dragging     = useRef(false);
  const containerRef = useRef(null);
  const hasIntro     = useRef(false);

  const updatePos = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(2, Math.min(((clientX - rect.left) / rect.width) * 100, 98));
    setSliderPos(x);
  }, []);

  /* Mouse handlers */
  const onMouseDown = (e) => { dragging.current = true; updatePos(e.clientX); };
  const onMouseMove = (e) => { if (dragging.current) updatePos(e.clientX); };
  const onMouseUp   = () => { dragging.current = false; };

  /* Touch handlers */
  const onTouchStart = (e) => { dragging.current = true; updatePos(e.touches[0].clientX); };
  const onTouchMove  = (e) => {
    if (!dragging.current) return;
    e.preventDefault();
    updatePos(e.touches[0].clientX);
  };
  const onTouchEnd = () => { dragging.current = false; };

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  /* Intro animation — slides from 50→30→50 once to hint draggability */
  useEffect(() => {
    if (hasIntro.current) return;
    hasIntro.current = true;
    const t1 = setTimeout(() => setSliderPos(30), 600);
    const t2 = setTimeout(() => setSliderPos(50), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: '16px', userSelect: 'none',
        cursor: 'ew-resize', width: '100%', height: '280px',
        boxShadow: 'var(--shadow-md)', touchAction: 'none',
      }}
    >
      {/* Before image */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Image src={before} alt="Before" fill style={{ objectFit: 'cover' }}
          sizes="(max-width:768px) 100vw, 50vw" />
      </div>

      {/* After image — clipped */}
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${sliderPos}%)`,
        transition: dragging.current ? 'none' : 'clip-path 600ms ease-in-out' }}>
        <Image src={after} alt="After" fill style={{ objectFit: 'cover' }}
          sizes="(max-width:768px) 100vw, 50vw" />
      </div>

      {/* Drag handle — 44×44 touch target */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: `${sliderPos}%`, transform: 'translateX(-50%)',
        width: '3px', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10,
        transition: dragging.current ? 'none' : 'left 600ms ease-in-out',
      }}>
        {/* Visible circle inside larger touch target */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <path d="M9 18l-6-6 6-6M15 6l6 6-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div style={{ position: 'absolute', top: '12px', left: '14px',
        background: 'rgba(0,0,0,.55)', color: '#fff',
        fontSize: '10px', fontWeight: 700, letterSpacing: '.1em',
        padding: '4px 10px', borderRadius: '4px', zIndex: 5 }}>
        {beforeLabel}
      </div>
      <div style={{ position: 'absolute', top: '12px', right: '14px',
        background: 'rgba(0,0,0,.55)', color: '#fff',
        fontSize: '10px', fontWeight: 700, letterSpacing: '.1em',
        padding: '4px 10px', borderRadius: '4px', zIndex: 5 }}>
        {afterLabel}
      </div>

      {/* Hint text (fades after interaction) */}
      <div style={{ position: 'absolute', bottom: '14px', left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,.45)', color: 'rgba(255,255,255,.9)',
        fontSize: '11px', padding: '4px 12px', borderRadius: '20px',
        zIndex: 5, whiteSpace: 'nowrap', pointerEvents: 'none',
        opacity: sliderPos !== 50 ? 0 : 1, transition: 'opacity 400ms',
      }}>
        ← Drag to compare →
      </div>
    </div>
  );
}
