import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';

const RING_COUNT = 30;
const TUNNEL_LENGTH = 150;

const Rings = () => {
  const ringsRef = useRef<THREE.Group>(null);
  
  const ringData = useMemo(() => {
    const data = [];
    for (let i = 0; i < RING_COUNT; i++) {
      data.push({
        z: -(i * (TUNNEL_LENGTH / RING_COUNT)),
        scale: 1 + Math.random() * 0.5,
        rotationSpeed: (Math.random() - 0.5) * 2,
        color: i % 3 === 0 ? '#4ecdc4' : i % 2 === 0 ? '#1a73e8' : '#ffffff'
      });
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    if (!ringsRef.current) return;
    ringsRef.current.children.forEach((child, i) => {
      child.rotation.z += ringData[i].rotationSpeed * delta;
    });
  });

  return (
    <group ref={ringsRef}>
      {ringData.map((data, i) => (
        <mesh key={i} position={[0, 0, data.z]} scale={data.scale}>
          <torusGeometry args={[3, 0.1, 16, 64]} />
          <meshStandardMaterial 
            color={data.color} 
            emissive={data.color} 
            emissiveIntensity={2} 
            wireframe={i % 4 === 0} 
          />
        </mesh>
      ))}
    </group>
  );
};

const CameraFlythrough = ({ onComplete }: { onComplete: () => void }) => {
  const speed = useRef(0);
  
  useFrame((state, delta) => {
    // Exponentially increase camera speed
    speed.current += delta * 15;
    state.camera.position.z -= speed.current * delta;

    // Add some turbulence to the camera
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 5) * 0.2;
    state.camera.position.y = Math.cos(state.clock.elapsedTime * 4) * 0.2;

    // When the camera reaches the end of the tunnel, trigger completion
    if (state.camera.position.z < -TUNNEL_LENGTH - 5) {
      onComplete();
    }
  });
  
  return null;
};

export default function Animation() {
  const [isDone, setIsDone] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleComplete = () => {
    if (!flash) {
      setFlash(true);
      setTimeout(() => setIsDone(true), 400);
    }
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div 
          className="fixed inset-0 z-[10000] bg-[#020202] flex items-center justify-center pointer-events-none overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Warp Speed Streaks (HTML overlay for extra effect) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#050505]/50 to-[#000000] z-10" />

          {/* Flash overlay at the very end */}
          <motion.div 
            className="absolute inset-0 bg-white z-[10001]"
            initial={{ opacity: 0 }}
            animate={{ opacity: flash ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />

          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" distance={20} />
            
            {/* The infinite rings */}
            <Rings />

            {/* The camera controller */}
            <CameraFlythrough onComplete={handleComplete} />
            
            {/* Fog to hide the back of the tunnel */}
            <fog attach="fog" args={['#020202', 10, 60]} />
          </Canvas>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
