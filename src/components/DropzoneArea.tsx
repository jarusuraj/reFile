import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useAppStore } from '../store';
import { MAX_FILE_SIZE, type SupportedExt } from '../types';
import { getFileExtension } from '../utils/formatters';

export default function DropzoneArea() {
  const { file, setFile } = useAppStore();

  const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error('File is too large. Max size is 1MB.');
      } else if (error.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload a PDF, DOCX, CSV, or TSV.');
      } else {
        toast.error(error.message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      const ext = getFileExtension(uploadedFile.name);
      
      if (!ext) {
        toast.error('Could not determine file extension.');
        return;
      }

      setFile({
        raw: uploadedFile,
        name: uploadedFile.name,
        size: uploadedFile.size,
        ext: ext as SupportedExt
      });
      toast.success('File uploaded successfully!');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv']
    }
  });

  if (file) return null; // We hide the dropzone if a file is already uploaded

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="dropzone"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div
            {...getRootProps()}
            className={`glass border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-secondary/10'
            }`}
          >
            <input {...getInputProps()} />
            <motion.div 
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-lg"
            >
              <UploadCloud size={40} />
            </motion.div>
            <h3 className="text-2xl font-bold mb-3">Drag & Drop your document</h3>
            <p className="text-muted-foreground mb-8">or click to browse from your computer</p>
            <div className="flex items-center justify-center gap-3">
              {['.PDF', '.DOCX', '.CSV', '.TSV'].map(ext => (
                <span key={ext} className="px-4 py-1.5 rounded-full bg-secondary text-xs font-mono font-bold tracking-wider">{ext}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}
