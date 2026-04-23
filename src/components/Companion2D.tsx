import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store';

export default function Companion2D() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { status, file } = useAppStore();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      
      const angle = Math.atan2(distanceY, distanceX);
      const distance = Math.min(1, Math.sqrt(distanceX**2 + distanceY**2) / 150);
      
      setMousePosition({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Determine character expression based on app state
  let expression = 'idle';
  if (status === 'translating') expression = 'working';
  else if (status === 'done') expression = 'happy';
  else if (file) expression = 'excited';

  // Calculate eye movement limits (max 10px in any direction)
  const eyeX = mousePosition.x * 8;
  const eyeY = mousePosition.y * 8;

  return (
    <div ref={containerRef} className="fixed bottom-8 right-8 z-50 pointer-events-none select-none">
      <motion.div
        className="w-32 h-32 relative flex items-center justify-center"
        animate={{
          y: expression === 'working' ? [-5, 5, -5] : [0, -8, 0],
          rotate: expression === 'happy' ? [0, -10, 10, 0] : 0,
          scale: expression === 'excited' ? 1.1 : 1
        }}
        transition={{
          repeat: Infinity,
          duration: expression === 'working' ? 0.5 : 3,
          ease: "easeInOut"
        }}
      >
        {/* Shadow */}
        <motion.div className="absolute -bottom-4 w-20 h-4 bg-black/10 rounded-[100%] blur-md" />
        
        {/* Character Body (Blob) */}
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
          <motion.path
            fill="#4ecdc4"
            d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,97.1,-2.4C97.4,13.2,92,28.9,82.8,42.1C73.6,55.3,60.6,66.1,46,74.2C31.4,82.3,15.7,87.7,0.4,87C-14.9,86.3,-29.8,79.5,-42.6,70.2C-55.4,60.9,-66.1,49.1,-73.4,35.4C-80.7,21.7,-84.6,6.1,-84.6,-9.6C-84.6,-25.3,-80.7,-41,-71.4,-52.7C-62.1,-64.4,-47.4,-72,-33.1,-77.9C-18.8,-83.8,-4.9,-88,10.1,-86.6C25.1,-85.2,30.6,-83.6,44.7,-76.4Z"
            animate={{
              d: expression === 'working' 
                ? "M38.8,-66.3C52.4,-57.4,67.1,-51,77.3,-39.5C87.5,-28,93.2,-11.4,91.8,4.7C90.4,20.8,81.9,36.4,70.6,48.2C59.3,60,45.2,68.1,29.8,73.5C14.4,78.9,-2.3,81.7,-18.2,78.4C-34.1,75.1,-49.2,65.8,-60.9,53C-72.6,40.2,-80.9,23.9,-83.3,6.8C-85.7,-10.3,-82.2,-28.2,-72,-41.8C-61.8,-55.4,-44.9,-64.7,-29.9,-71.3C-14.9,-77.9,-1.8,-81.8,11.2,-80.1C24.2,-78.4,37.3,-71.1,38.8,-66.3Z"
                : "M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,97.1,-2.4C97.4,13.2,92,28.9,82.8,42.1C73.6,55.3,60.6,66.1,46,74.2C31.4,82.3,15.7,87.7,0.4,87C-14.9,86.3,-29.8,79.5,-42.6,70.2C-55.4,60.9,-66.1,49.1,-73.4,35.4C-80.7,21.7,-84.6,6.1,-84.6,-9.6C-84.6,-25.3,-80.7,-41,-71.4,-52.7C-62.1,-64.4,-47.4,-72,-33.1,-77.9C-18.8,-83.8,-4.9,-88,10.1,-86.6C25.1,-85.2,30.6,-83.6,44.7,-76.4Z"
            }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'mirror' }}
            transform="translate(100 100)"
          />
        </svg>

        {/* Face Container (Moves with cursor) */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          animate={{ x: eyeX, y: eyeY }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Eyes */}
          <div className="flex gap-6 mt-4">
            {/* Left Eye */}
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
              <motion.div 
                className="w-4 h-4 bg-slate-900 rounded-full relative"
                animate={{ x: eyeX * 0.5, y: eyeY * 0.5 }}
              >
                {expression === 'happy' && <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full" />}
                <div className="w-1 h-1 bg-white rounded-full absolute top-1 right-1" />
              </motion.div>
            </div>
            {/* Right Eye */}
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
              <motion.div 
                className="w-4 h-4 bg-slate-900 rounded-full relative"
                animate={{ x: eyeX * 0.5, y: eyeY * 0.5 }}
              >
                {expression === 'happy' && <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full" />}
                <div className="w-1 h-1 bg-white rounded-full absolute top-1 right-1" />
              </motion.div>
            </div>
          </div>

          {/* Mouth */}
          <motion.div 
            className="w-6 h-3 border-b-[4px] border-slate-900 rounded-b-full mt-1"
            animate={{ 
              scaleY: expression === 'excited' || expression === 'happy' ? 2 : 1,
              rotate: expression === 'working' ? [0, -10, 10, 0] : 0
            }}
            transition={expression === 'working' ? { repeat: Infinity, duration: 0.2 } : {}}
          />
        </motion.div>
        
      </motion.div>
    </div>
  );
}
