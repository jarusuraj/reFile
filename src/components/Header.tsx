import { Moon, Sun, Languages } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export default function Header({ theme, toggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Languages size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">reImagine</h1>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">File Translator</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/80 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
