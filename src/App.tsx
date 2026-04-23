import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import TranslationWorkspace from './components/TranslationWorkspace';
import Animation from './components/Animation';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }
    document.startViewTransition(() => {
      setTheme(newTheme);
    });
  }, [theme]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className={`min-h-screen ${theme} bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative`}>
      {/* The 3D Initial Splash / Meme Peel Effect */}
      <Animation />

      {/* Main App Layout */}
      <Header theme={theme} toggleTheme={toggleTheme} />
      <TranslationWorkspace />
      <Footer />
    </div>
  );
}
