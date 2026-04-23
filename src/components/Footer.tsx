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
      <p className="text-[13px] font-medium tracking-wide opacity-80">
        © 2026 reImagine. All Rights Reserved.
      </p>
    </footer>
  );
}
