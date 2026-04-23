import { ArrowRightLeft, Zap, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto py-10 flex flex-col items-center justify-center gap-4 text-[#8a929e]">
      <div className="flex items-center gap-8 text-sm font-medium tracking-wide">
        <div className="flex items-center gap-2">
          <ArrowRightLeft size={16} className="opacity-70" />
          <span>EN · NP · TG</span>
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
      <div className="flex flex-col items-center gap-2 mt-4">
        <a href="mailto:pmjarusuraj@gmail.com" className="text-sm font-semibold hover:text-primary transition-colors">
          Contact Us: pmjarusuraj@gmail.com
        </a>
        <p className="text-[13px] font-medium tracking-wide opacity-80">
          © 2026 reImagine. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
