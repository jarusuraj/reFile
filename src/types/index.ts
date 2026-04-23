export type Language = 'English' | 'Nepali' | 'Tamang';
export type AppStatus = 'idle' | 'translating' | 'done' | 'error';
export type SupportedExt = 'pdf' | 'docx' | 'csv' | 'tsv';
export type Theme = 'dark' | 'light';

export interface UploadedFile {
  raw: File;
  name: string;
  size: number;
  ext: SupportedExt;
}

export interface LanguageMeta {
  flag: string;
}

export const SUPPORTED_EXTENSIONS: SupportedExt[] = ['pdf', 'docx', 'csv', 'tsv'];
export const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export const LANGUAGE_METADATA: Record<Language, LanguageMeta> = {
  English: { flag: 'EN' },
  Nepali:  { flag: 'NP' },
  Tamang:  { flag: 'TG' },
};
