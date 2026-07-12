'use client';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        width: '36px', height: '36px', borderRadius: 'var(--r-sm)',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 150ms ease-out',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {theme === 'dark'
        ? <Sun size={15} color="var(--primary)" />
        : <Moon size={15} color="var(--text-hint)" />}
    </button>
  );
}
