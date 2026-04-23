import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAppStore } from '../store';
import { type Language, LANGUAGE_METADATA } from '../types';
import { ArrowRightLeft, FileText, FileSpreadsheet, FileJson, X, FileCheck, Loader2, CheckCircle2, Languages, Download } from 'lucide-react';
import { formatFileSize } from '../utils/formatters';
import DropzoneArea from './DropzoneArea';
import Companion2D from './Companion2D';

const EXTENSION_ICONS: Record<string, any> = {
  pdf: FileText,
  docx: FileText,
  csv: FileSpreadsheet,
  tsv: FileJson,
};

export default function TranslationWorkspace() {
  const {
    file, status, sourceLang, targetLang, progress,
    setSourceLang, setTargetLang, swapLanguages,
    setProgress, reset, setStatus, setTranslatedUrl
  } = useAppStore();

  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleTranslate = async () => {
    if (!file) {
      toast.error('Please upload a file first.');
      return;
    }

    setStatus('translating');
    setProgress(0);
    
    progressInterval.current = setInterval(() => {
      const currentProgress = useAppStore.getState().progress;
      if (currentProgress >= 95) return;
      setProgress(Math.min(95, currentProgress + Math.random() * 15));
    }, 400);

    try {
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(100);
      setStatus('done');
      setTranslatedUrl('#'); // Dummy URL
      toast.success('File translated successfully!');
    } catch (error) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      setStatus('error');
      toast.error('Translation failed. Please try again.');
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    reset();
  };

  const FileIcon = file ? EXTENSION_ICONS[file.ext] : FileText;

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 relative z-10 flex flex-col gap-8">
      <Companion2D />
      {/* Language Selection */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Translate From</label>
            <div className="flex p-1 rounded-xl bg-secondary/50 border border-border relative">
              {(['English', 'Nepali', 'Tamang'] as Language[]).map(lang => {
                const isActive = sourceLang === lang;
                return (
                  <button
                    key={`source-${lang}`}
                    onClick={() => setSourceLang(lang)}
                    className={`relative flex-1 flex items-center justify-center py-2 px-2 rounded-lg text-sm font-semibold transition-colors duration-200 z-10 ${
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-source" 
                        className="absolute inset-0 bg-background shadow-sm rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          <motion.button 
            onClick={swapLanguages}
            whileHover={{ rotate: 180, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="mt-6 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground border border-border shrink-0"
          >
            <ArrowRightLeft size={16} />
          </motion.button>

          <div className="flex-1 w-full">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Translate To</label>
            <div className="flex p-1 rounded-xl bg-secondary/50 border border-border relative">
              {(['English', 'Nepali', 'Tamang'] as Language[]).map(lang => {
                const isActive = targetLang === lang;
                return (
                  <button
                    key={`target-${lang}`}
                    onClick={() => setTargetLang(lang)}
                    className={`relative flex-1 flex items-center justify-center py-2 px-2 rounded-lg text-sm font-semibold transition-colors duration-200 z-10 ${
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-target" 
                        className="absolute inset-0 bg-background shadow-sm rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Upload Zone / Status */}
      {!file ? (
        <DropzoneArea />
      ) : (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            key="filecard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6"
          >
            {/* Before Preview */}
            <div className="flex-1 w-full bg-secondary/30 rounded-2xl p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-sm text-primary">
                    <FileIcon size={24} />
                  </div>
                  <div className="text-left overflow-hidden">
                    <h4 className="font-semibold truncate max-w-[200px]">{file.name}</h4>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)} • {sourceLang}</p>
                  </div>
                </div>
                {status === 'idle' && (
                  <button onClick={clearFile} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <X size={18} />
                  </button>
                )}
              </div>
              
              <div className="h-24 rounded-lg bg-background/50 border border-border/50 p-4 relative overflow-hidden">
                <div className="space-y-2 opacity-40">
                  <div className="h-2 w-3/4 bg-foreground/20 rounded-full" />
                  <div className="h-2 w-full bg-foreground/20 rounded-full" />
                  <div className="h-2 w-5/6 bg-foreground/20 rounded-full" />
                  <div className="h-2 w-1/2 bg-foreground/20 rounded-full" />
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center px-4 text-muted-foreground">
              <ArrowRightLeft size={24} className="opacity-50" />
            </div>

            {/* After Preview / Progress */}
            <div className="flex-1 w-full bg-secondary/30 rounded-2xl p-6 border border-border relative overflow-hidden">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-sm text-muted-foreground">
                  {status === 'done' ? <FileCheck size={24} className="text-emerald-500" /> : <FileIcon size={24} />}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold">{status === 'done' ? `Translated_${file.name}` : 'Awaiting Translation...'}</h4>
                  <p className="text-xs text-muted-foreground">Target: {targetLang}</p>
                </div>
              </div>

              <div className="h-24 rounded-lg bg-background/50 border border-border/50 p-4 flex flex-col justify-center relative">
                {status === 'idle' && (
                  <div className="text-center text-sm text-muted-foreground">
                    Ready to translate to {targetLang}
                  </div>
                )}

                {status === 'translating' && (
                  <div className="w-full space-y-3">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-primary flex items-center gap-2">
                        <Loader2 size={12} className="animate-spin" />
                        Processing...
                      </span>
                      <span>{Math.round(progress)}%</span>
                    </div>  
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                {status === 'done' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-emerald-500 font-medium">
                      <CheckCircle2 size={18} />
                      Translation Complete
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.section>
      )}

      {/* Actions */}
      <motion.section 
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {status === 'idle' && file && (
            <motion.button
              key="btn-translate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={handleTranslate}
              className="group relative px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Languages size={20} />
              Start Translation
            </motion.button>
          )}

          {status === 'done' && (
            <motion.div 
              key="btn-done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {useAppStore.getState().translatedUrl && (
                <a
                  href={useAppStore.getState().translatedUrl!}
                  download={`Translated_${file?.name}`}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <Download size={20} />
                  Download File
                </a>
              )}
              <button
                onClick={reset}
                className="px-8 py-4 glass text-foreground font-semibold rounded-2xl hover:bg-secondary/50 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Translate Another
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
}
