import { type SupportedExt, SUPPORTED_EXTENSIONS } from '../types';

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

export const getFileExtension = (filename: string): SupportedExt | null => {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (extension && (SUPPORTED_EXTENSIONS as string[]).includes(extension)) {
    return extension as SupportedExt;
  }
  return null;
};
