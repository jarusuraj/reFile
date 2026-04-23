import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb';

// Preload the character
useGLTF.preload(MODEL_URL);

const RobotCharacter = ({ onProgress }: { onProgress: (p: number) => void }) => {
  const group = useRef<THREE.Group>(null);
  
  // Load the Robot model
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, group);

  // Animation parameters
  const startX = 6;
  const endX = -8;
  const duration = 2.5;
  const timeRef = useRef(0);

  useEffect(() => {
    // Play the Walking animation when the component mounts
    if (actions && actions['Walking']) {
      actions['Walking'].reset().fadeIn(0.2).play();
      // Speed up the walk cycle slightly so it matches the dragging speed
      actions['Walking'].timeScale = 1.5;
    }
    return () => {
      if (actions && actions['Walking']) {
        actions['Walking'].fadeOut(0.2);
      }
    };
  }, [actions]);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (timeRef.current < duration) {
      timeRef.current += delta;
      const t = Math.min(timeRef.current / duration, 1);
      
      // Smooth easing (ease-out cubic)
      const ease = 1 - Math.pow(1 - t, 3);
      
      // Move character from right to left
      const currentX = startX - (startX - endX) * ease;
      group.current.position.x = currentX;
      
      // Normalize progress 0 to 1 based on X position for DOM tracking
      const rawProgress = (startX - currentX) / (startX - endX);
      const normalizedProgress = Math.max(0, Math.min(1, rawProgress));
      
      onProgress(normalizedProgress);
    }
  });

  return (
    <group ref={group}>
      {/* Face the character to the left (moving direction) */}
      <group rotation={[0, -Math.PI / 2, 0]} position={[0, -2, 0]} scale={0.8}>
        <primitive object={scene} />
      </group>
    </group>
  );
};

export default function Animation() {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (progress >= 0.99) {
      const timer = setTimeout(() => setIsDone(true), 400);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (isDone) return null;

  const translateXValue = `translate3d(-${progress * 100}%, 0, 0)`;

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden">
      {/* The Solid Black OLED Overlay */}
      <div 
        className="absolute inset-0 bg-[#050505] z-40 will-change-transform"
        style={{ transform: translateXValue }}
      >
        {/* Glow Leak at the Peel Edge to sell the OLED effect */}
        <div className="absolute top-0 bottom-0 right-0 w-[80px] bg-gradient-to-l from-[#1a73e8] to-transparent opacity-60 mix-blend-screen translate-x-full" />
        <div 
          className="absolute top-0 bottom-0 right-0 w-[4px] bg-[#ffffff] opacity-90 blur-[2px] translate-x-full"
          style={{ boxShadow: '0 0 20px 5px rgba(26, 115, 232, 0.9)' }}
        />
      </div>

      {/* The 3D Scene running on top */}
      <div className="absolute inset-0 z-50">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 10, 5]} intensity={3} color="#ffffff" />
          <directionalLight position={[-5, 5, -5]} intensity={1} color="#8ab4f8" />
          {/* We wrap the character in React.Suspense so the app doesn't crash while downloading the GLB */}
          <React.Suspense fallback={null}>
            <RobotCharacter onProgress={setProgress} />
          </React.Suspense>
        </Canvas>
      </div>
    </div>
  );
}
