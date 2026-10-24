import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { THEMES } from '../constants/themes';
import { Palette, Check, X } from 'lucide-react';

const ThemeSwitcher = () => {
  const { themeId, setThemeId, theme } = useTheme();
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center">
      {open ? (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-1.5 pl-1 pr-2 border-r border-slate-200 text-xs font-bold text-slate-700">
            <Palette className={`w-4 h-4 ${theme.textAccent}`} />
            <span className="hidden sm:inline">Color:</span>
            <span className="font-semibold text-slate-500">{theme.name}</span>
          </div>

          {/* 5 Interactive Color Dots */}
          <div className="flex items-center gap-2">
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                title={`${t.name} (${t.tag})`}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  themeId === t.id 
                    ? 'ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-md' 
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: t.colorHex }}
              >
                {themeId === t.id && (
                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                )}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setOpen(false)}
            aria-label="Close theme switcher"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={`px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition cursor-pointer`}
        >
          <Palette className={`w-4 h-4 ${theme.textAccent}`} />
          <span>Change Color</span>
        </button>
      )}
    </div>
  );
};

export default ThemeSwitcher;
