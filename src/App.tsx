import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, type Variants, useMotionValue, useTransform } from 'framer-motion';
import {
  Upload, X, ArrowUpDown, Download, RefreshCw, Globe,
  FileText, Table, FileSpreadsheet, CheckCircle2,
  AlertCircle, Languages, Sparkles, LayoutGrid, File,
  Sun, Moon
} from 'lucide-react';
import './App.css';

/* ─────────────── Types ─────────────── */
type Language = 'English' | 'Nepali' | 'Tamang';
type AppStatus = 'idle' | 'translating' | 'done' | 'error';
type SupportedExt = 'pdf' | 'docx' | 'csv' | 'tsv';
type Theme = 'dark' | 'light';

interface UploadedFile { raw: File; name: string; size: number; ext: SupportedExt; }

/* ─────────────── Constants ─────────────── */
const SUPPORTED: SupportedExt[] = ['pdf', 'docx', 'csv', 'tsv'];
const MAX_SIZE = 1024 * 1024;

const LANG_META: Record<Language, { flag: string }> = {
  English: { flag: '🇬🇧' },
  Nepali:  { flag: '🇳🇵' },
  Tamang:  { flag: '🏔️' },
};

const EXT_META: Record<SupportedExt, { Icon: typeof FileText; label: string; color: string; bg: string }> = {
  pdf:  { Icon: FileText,        label: 'PDF Document',    color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
  docx: { Icon: File,            label: 'Word Document',   color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  csv:  { Icon: Table,           label: 'CSV Spreadsheet', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  tsv:  { Icon: FileSpreadsheet, label: 'TSV Data File',   color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
};

/* ─────────────── Animations ─────────────── */
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  show:   { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 28 } },
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show:   { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 22 } },
};
const slideX: Variants = {
  hidden: { opacity: 0, x: -24 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

/* ─────────────── Helpers ─────────────── */
const fmtSize = (b: number) => b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`;
const getExt = (n: string): SupportedExt | null => {
  const e = n.split('.').pop()?.toLowerCase();
  return SUPPORTED.includes(e as SupportedExt) ? (e as SupportedExt) : null;
};

/* ─────────────── Floating Particle ─────────────── */
function Particles() {
  return (
    <div className="particles" aria-hidden="true">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--size': `${2 + Math.random() * 3}px`,
            '--dur': `${15 + Math.random() * 25}s`,
            '--delay': `${-Math.random() * 20}s`,
            '--drift': `${-50 + Math.random() * 100}px`,
            opacity: 0.15 + Math.random() * 0.25,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function App() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [err, setErr] = useState('');
  const [progress, setProgress] = useState(0);
  const [sourceLang, setSourceLang] = useState<Language>('English');
  const [targetLang, setTargetLang] = useState<Language>('Nepali');
  const [dragging, setDragging] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reimagine-theme') as Theme | null;
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Mouse glow effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useTransform(mouseX, v => `${v}px`);
  const glowY = useTransform(mouseY, v => `${v}px`);

  useEffect(() => {
    const move = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('reimagine-theme', theme);
  }, [theme]);

  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const pick = useCallback((f: File) => {
    setErr('');
    const ext = getExt(f.name);
    if (!ext) { setErr(`Unsupported format. Use: ${SUPPORTED.map(e => `.${e}`).join(', ')}`); return; }
    if (f.size > MAX_SIZE) { setErr('File exceeds the 1 MB limit.'); return; }
    setFile({ raw: f, name: f.name, size: f.size, ext });
    setStatus('idle');
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
  }, [blobUrl]);

  const swap = () => { setSourceLang(targetLang); setTargetLang(sourceLang); };

  const translate = async () => {
    if (!file) return;
    setStatus('translating'); setProgress(0); setErr('');
    timerRef.current = setInterval(() => setProgress(p => p >= 96 ? p : p + Math.random() * 5), 200);
    try {
      // TODO: Wire up real TMT API — user will provide API key
      await new Promise(r => setTimeout(r, 4200));
      clearInterval(timerRef.current);
      setProgress(100);
      const blob = new Blob(
        [`[Translated]\nFile: ${file.name}\n${sourceLang} → ${targetLang}\n\nPlaceholder — wire TMT API for real output.`],
        { type: 'text/plain' }
      );
      setBlobUrl(URL.createObjectURL(blob));
      setTimeout(() => setStatus('done'), 500);
    } catch {
      clearInterval(timerRef.current);
      setStatus('error');
      setErr('Translation failed. Check connection and retry.');
    }
  };

  const reset = () => {
    setFile(null); setStatus('idle'); setErr(''); setProgress(0);
    if (blobUrl) URL.revokeObjectURL(blobUrl); setBlobUrl(null);
    if (inputRef.current) inputRef.current.value = '';
    clearInterval(timerRef.current);
  };

  const meta = file ? EXT_META[file.ext] : null;
  const progLabel = progress < 25 ? 'Parsing document structure…' : progress < 55 ? 'Translating via TMT API…' : progress < 85 ? 'Reconstructing layout…' : 'Finalizing output…';

  return (
    <div className="shell">
      {/* Ambient effects */}
      <Particles />
      <div className="ambient" aria-hidden="true">
        <div className="ambient__orb ambient__orb--1" />
        <div className="ambient__orb ambient__orb--2" />
        <div className="ambient__orb ambient__orb--3" />
      </div>
      <motion.div
        className="cursor-glow"
        style={{ left: glowX, top: glowY }}
        aria-hidden="true"
      />

      {/* ── Header ── */}
      <motion.header
        className="hdr"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hdr__brand">
          <motion.div
            className="hdr__logo"
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Languages size={24} />
          </motion.div>
          <div>
            <h1 className="hdr__name">re<span>Imagine</span></h1>
            <p className="hdr__sub">File Translator</p>
          </div>
        </div>

        <div className="hdr__right">
          <span className="tag tag--accent">Track 02</span>
          <span className="tag">TMT 2026</span>
          <motion.button
            className="theme-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 400 }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {theme === 'dark' ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun size={18} />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* ── Main ── */}
      <motion.main className="content" variants={stagger} initial="hidden" animate="show">

        {/* Language Bar */}
        <motion.section className="langbar" variants={fadeUp}>
          <LangGroup label="Source" langs={(['English','Nepali','Tamang'] as Language[])} active={sourceLang} onChange={setSourceLang} />
          <motion.button
            className="langbar__swap"
            onClick={swap}
            whileHover={{ rotate: 180, scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300 }}
            aria-label="Swap languages"
          >
            <ArrowUpDown size={18} />
          </motion.button>
          <LangGroup label="Target" langs={(['English','Nepali','Tamang'] as Language[])} active={targetLang} onChange={setTargetLang} />
        </motion.section>

        {/* Upload */}
        <motion.section className="upload" variants={fadeUp}>
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="dropzone"
                className={`dropzone ${dragging ? 'dropzone--drag' : ''}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) pick(f); }}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94, y: -10 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              >
                <input ref={inputRef} type="file" accept=".pdf,.docx,.csv,.tsv" onChange={e => { const f = e.target.files?.[0]; if (f) pick(f); }} hidden />
                <motion.div
                  className="dropzone__icon"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Upload size={36} strokeWidth={1.5} />
                </motion.div>
                <h3 className="dropzone__title">Drop your file here</h3>
                <p className="dropzone__sub">or click to browse your computer</p>
                <div className="dropzone__chips">
                  {SUPPORTED.map(e => <span key={e} className="chip">.{e}</span>)}
                  <span className="chip chip--muted">≤ 1 MB</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="filecard"
                className="filecard"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              >
                <motion.div
                  className="filecard__icon"
                  style={{ background: meta?.bg, color: meta?.color }}
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.1 }}
                >
                  {meta && <meta.Icon size={26} />}
                </motion.div>
                <div className="filecard__body">
                  <h3>{file.name}</h3>
                  <p>{meta?.label} · {fmtSize(file.size)}</p>
                </div>
                {status === 'idle' && (
                  <motion.button
                    className="filecard__rm"
                    onClick={reset}
                    whileHover={{ scale: 1.15, backgroundColor: 'rgba(251,113,133,0.15)' }}
                    whileTap={{ scale: 0.85 }}
                  >
                    <X size={18} />
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {err && (
              <motion.div
                className="errbar"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle size={16} /> {err}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Actions */}
        <motion.section className="actions" variants={fadeUp}>
          <AnimatePresence mode="wait">
            {status === 'idle' && file && (
              <motion.button
                key="go"
                className="btn-go"
                onClick={translate}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.04, boxShadow: '0 16px 48px var(--accent-glow)' }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              >
                <Sparkles size={20} />
                Translate to {targetLang}
              </motion.button>
            )}

            {status === 'translating' && (
              <motion.div key="prog" className="prog" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <div className="prog__bar">
                  <motion.div
                    className="prog__fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ ease: 'easeOut', duration: 0.25 }}
                  />
                  <motion.div
                    className="prog__shimmer"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <div className="prog__info">
                  <motion.div
                    className="prog__spin"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <RefreshCw size={15} />
                  </motion.div>
                  <span className="prog__label">{progLabel}</span>
                  <span className="prog__pct">{Math.round(progress)}%</span>
                </div>
              </motion.div>
            )}

            {status === 'done' && (
              <motion.div key="done" className="done" variants={scaleIn} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <motion.div
                  className="done__check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.15 }}
                >
                  <CheckCircle2 size={30} />
                </motion.div>
                <div className="done__text">
                  <h3>Translation Complete</h3>
                  <p>{file?.ext.toUpperCase()} translated: {sourceLang} → {targetLang}</p>
                </div>
                <motion.div className="done__btns" variants={stagger} initial="hidden" animate="show">
                  {blobUrl && (
                    <motion.a href={blobUrl} download={`translated_${file?.name}`} className="btn-dl" variants={slideX} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      <Download size={18} /> Download File
                    </motion.a>
                  )}
                  <motion.button className="btn-again" onClick={reset} variants={slideX} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <RefreshCw size={15} /> Translate Another
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div key="err" className="err-action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.button className="btn-go" onClick={translate} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <RefreshCw size={18} /> Retry Translation
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Features */}
        <motion.section className="feats" variants={stagger}>
          {([
            { Icon: LayoutGrid,      title: 'Layout Preservation', desc: 'Images, tables, and fonts stay pixel-perfect — your document, just in another language.', cls: 'f1' },
            { Icon: Globe,           title: 'Trilingual Engine',   desc: 'Native English ↔ Nepali ↔ Tamang context-aware translation powered by the TMT API.', cls: 'f2' },
            { Icon: FileSpreadsheet, title: 'Multi-Format',        desc: 'Specialized parsers for PDF, DOCX, CSV, and TSV with format-aware reconstruction.', cls: 'f3' },
          ] as const).map(({ Icon, title, desc, cls }) => (
            <motion.div
              key={cls}
              className={`feat feat--${cls}`}
              variants={fadeUp}
              whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="feat__icon"><Icon size={22} /></div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </motion.div>
          ))}
        </motion.section>
      </motion.main>

      {/* Footer */}
      <motion.footer className="ftr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }}>
        <p>Information and Language Processing Lab · Kathmandu University, Dhulikhel</p>
        <p className="ftr__sub">Google Trilingual Machine Translation Hackathon 2026</p>
      </motion.footer>
    </div>
  );
}

/* ═════════════════════════════════════
   Language Group Sub-Component
   ═════════════════════════════════════ */
function LangGroup({ label, langs, active, onChange }: {
  label: string; langs: Language[]; active: Language; onChange: (l: Language) => void;
}) {
  return (
    <div className="langbar__group">
      <span className="langbar__label">{label}</span>
      <div className="langbar__pills">
        {langs.map(lang => (
          <motion.button
            key={lang}
            className={`pill ${active === lang ? 'pill--on' : ''}`}
            onClick={() => onChange(lang)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            layout
          >
            <span className="pill__flag">{LANG_META[lang].flag}</span>
            <span>{lang}</span>
            {active === lang && (
              <motion.div
                className="pill__bg"
                layoutId={`pill-${label}`}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
