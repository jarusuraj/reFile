import { useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useAppStore } from './store';
import { 
  FileText, UploadCloud, ArrowRightLeft, Languages, 
  Download, Loader2, CheckCircle2, FileJson, 
  FileSpreadsheet, X, FileCheck, Zap, Shield
} from 'lucide-react';
import { type SupportedExt, MAX_FILE_SIZE, type Language, LANGUAGE_METADATA } from './types';
import { getFileExtension, formatFileSize } from './utils/formatters';

const EXTENSION_ICONS: Record<SupportedExt, typeof FileText> = {
  pdf: FileText,
  docx: FileText,
  csv: FileSpreadsheet,
  tsv: FileJson,
};

export default function App() {
  const {
    file, status, sourceLang, targetLang, progress,
    setFile, setStatus, setSourceLang, setTargetLang, swapLanguages,
    setProgress, setTranslatedUrl, reset
  } = useAppStore();

  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clean up interval on unmount
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const selectedFile = acceptedFiles[0];
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds the 1MB limit.');
      return;
    }

    const ext = getFileExtension(selectedFile.name);
    if (!ext) {
      toast.error('Unsupported format. Please use PDF, DOCX, CSV, or TSV.');
      return;
    }

    setFile({
      raw: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
      ext
    });
    toast.success('File ready for translation.');
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleTranslate = async () => {
    if (!file) {
      toast.error('Please upload a file first.');
      return;
    }

    setStatus('translating');
    setProgress(0);
    
    // Simulate translation progress
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 400);

    try {
      // TODO: Replace with actual TMT API call
      await new Promise((resolve) => setTimeout(resolve, 3500));
      
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(100);
      
      const blob = new Blob(
        [`{"status":"success","message":"Translated content placeholder for ${file.name}"}`],
        { type: 'application/json' }
      );
      setTranslatedUrl(URL.createObjectURL(blob));
      
      toast.success('Translation completed successfully!');
      setTimeout(() => setStatus('done'), 400);
    } catch {
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
    <div className="min-h-screen dark bg-background text-foreground flex flex-col font-sans">
      {/* Background ambient light */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 glass border-b border-border/50 px-6 py-4">
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
          <div className="hidden sm:flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">Track 02</span>
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">TMT 2026</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 relative z-10 flex flex-col gap-8">
        
        {/* Language Selection */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Translate From</label>
              <div className="flex p-1 rounded-xl bg-secondary/50 border border-border">
                {(['English', 'Nepali', 'Tamang'] as Language[]).map(lang => (
                  <button
                    key={`source-${lang}`}
                    onClick={() => setSourceLang(lang)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      sourceLang === lang ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{LANGUAGE_METADATA[lang].flag}</span>
                    <span className="hidden sm:inline">{lang}</span>
                  </button>
                ))}
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
              <div className="flex p-1 rounded-xl bg-secondary/50 border border-border">
                {(['English', 'Nepali', 'Tamang'] as Language[]).map(lang => (
                  <button
                    key={`target-${lang}`}
                    onClick={() => setTargetLang(lang)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      targetLang === lang ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{LANGUAGE_METADATA[lang].flag}</span>
                    <span className="hidden sm:inline">{lang}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Upload Zone */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div
                  {...getRootProps()}
                  className={`glass border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/20'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                    <UploadCloud size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Drag & Drop your document here</h3>
                  <p className="text-muted-foreground mb-6">or click to browse from your computer</p>
                  <div className="flex items-center justify-center gap-2">
                    {['.PDF', '.DOCX', '.CSV', '.TSV'].map(ext => (
                      <span key={ext} className="px-3 py-1 rounded-full bg-secondary text-xs font-mono font-medium">{ext}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
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
            )}
          </AnimatePresence>
        </motion.section>

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
      
      <footer className="mt-auto py-10 flex flex-col items-center justify-center gap-4 text-[#8a929e]">
        <div className="flex items-center gap-8 text-sm font-medium tracking-wide">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={16} className="opacity-70" />
            <span>EN · NE · TA</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="opacity-70" />
            <span>Real-time</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={16} className="opacity-70" />
            <span>Secure</span>
          </div>
        </div>
        <p className="text-[13px] font-medium tracking-wide opacity-80">
          © 2026 reImagine. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
