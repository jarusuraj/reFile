import { motion } from 'motion/react';
import { ArrowUpDown } from 'lucide-react';
import { type Language, LANGUAGE_METADATA } from '../../types';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  sourceLang: Language;
  targetLang: Language;
  onSourceChange: (lang: Language) => void;
  onTargetChange: (lang: Language) => void;
  onSwap: () => void;
}

const LANGUAGES: Language[] = ['English', 'Nepali', 'Tamang'];

export default function LanguageSelector({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap
}: LanguageSelectorProps) {
  return (
    <div className="language-selector">
      <div className="language-selector__group">
        <span className="language-selector__label">Source</span>
        <div className="language-selector__pills">
          {LANGUAGES.map((lang) => (
            <motion.button
              key={lang}
              className={`pill ${sourceLang === lang ? 'pill--active' : ''}`}
              onClick={() => onSourceChange(lang)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              layout
            >
              <span className="pill__flag">{LANGUAGE_METADATA[lang].flag}</span>
              <span>{lang}</span>
              {sourceLang === lang && (
                <motion.div
                  className="pill__background"
                  layoutId="pill-Source"
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        className="language-selector__swap"
        onClick={onSwap}
        whileHover={{ rotate: 180, scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 300 }}
        aria-label="Swap languages"
      >
        <ArrowUpDown size={18} />
      </motion.button>

      <div className="language-selector__group">
        <span className="language-selector__label">Target</span>
        <div className="language-selector__pills">
          {LANGUAGES.map((lang) => (
            <motion.button
              key={lang}
              className={`pill ${targetLang === lang ? 'pill--active' : ''}`}
              onClick={() => onTargetChange(lang)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              layout
            >
              <span className="pill__flag">{LANGUAGE_METADATA[lang].flag}</span>
              <span>{lang}</span>
              {targetLang === lang && (
                <motion.div
                  className="pill__background"
                  layoutId="pill-Target"
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
