import React, { useState, useRef, useEffect } from 'react';
import { ThemeIcon } from './icons';

export type Theme = 'light' | 'dark' | 'dracula';
const themes: { name: Theme, label: string }[] = [
  { name: 'light', label: 'Light' },
  { name: 'dark', label: 'Dark' },
  { name: 'dracula', label: 'Dracula' },
];

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentThemeLabel = themes.find(t => t.name === theme)?.label || 'Theme';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-md hover:bg-background-offset transition-colors"
        title="Change theme"
      >
        <ThemeIcon className="w-5 h-5" />
        <span className="text-sm font-medium sr-only">{currentThemeLabel}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-background-offset border border-border rounded-md shadow-lg z-20">
          <ul className="py-1">
            {themes.map(t => (
              <li key={t.name}>
                <button
                  onClick={() => {
                    setTheme(t.name);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    theme === t.name ? 'font-bold text-accent' : 'text-foreground'
                  } hover:bg-border/50`}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};