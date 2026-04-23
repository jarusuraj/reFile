import { create } from 'zustand';
import type { UploadedFile, Language, AppStatus } from '../types';

interface AppState {
  file: UploadedFile | null;
  status: AppStatus;
  sourceLang: Language;
  targetLang: Language;
  progress: number;
  translatedUrl: string | null;
  
  setFile: (file: UploadedFile | null) => void;
  setStatus: (status: AppStatus) => void;
  setSourceLang: (lang: Language) => void;
  setTargetLang: (lang: Language) => void;
  swapLanguages: () => void;
  setProgress: (progress: number) => void;
  setTranslatedUrl: (url: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  file: null, 
  status: 'idle',
  sourceLang: 'English',
  targetLang: 'Nepali',
  progress: 0,
  translatedUrl: null,

  setFile: (file) => set({ file, status: 'idle', translatedUrl: null, progress: 0 }),
  setStatus: (status) => set({ status }),
  setSourceLang: (sourceLang) => set((state) => {
    if (sourceLang === state.targetLang) {
      return { sourceLang, targetLang: state.sourceLang };
    }
    return { sourceLang };
  }),
  setTargetLang: (targetLang) => set((state) => {
    if (targetLang === state.sourceLang) {
      return { targetLang, sourceLang: state.targetLang };
    }
    return { targetLang };
  }),
  swapLanguages: () => set((state) => ({ 
    sourceLang: state.targetLang, 
    targetLang: state.sourceLang 
  })),
  setProgress: (progress) => set({ progress }),
  setTranslatedUrl: (translatedUrl) => set({ translatedUrl }),
  reset: () => set({ file: null, status: 'idle', progress: 0, translatedUrl: null }),
}));
