'use client'
import { useRef } from 'react';

export default function V2OTPInput({ length = 6, value, onChange, dark = false }) {
  const refs = useRef([]);

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const setDigit = (index, digit) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(''));
  };

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted.padEnd(length, '').slice(0, length).replace(/ /g, ''));
    const nextIndex = Math.min(pasted.length, length - 1);
    refs.current[nextIndex]?.focus();
  };

  const border = dark ? 'rgba(255,255,255,0.15)' : '#CBD5E1';
  const bg = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const color = dark ? '#F8F7F4' : '#0F172A';

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          style={{
            width: '52px', height: '52px',
            textAlign: 'center',
            fontSize: '22px', fontWeight: 600,
            color, background: bg,
            border: `1.5px solid ${digit ? '#3B82F6' : border}`,
            borderRadius: '10px',
            outline: 'none',
            fontFamily: 'var(--v2-font-ui)',
            transition: 'border-color 150ms',
          }}
        />
      ))}
    </div>
  );
}
