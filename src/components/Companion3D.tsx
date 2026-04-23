import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

const Eye = ({ position }: { position: [number, number, number] }) => {
  const group = useRef<THREE.Group>(null);
  const pupil = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!group.current || !pupil.current) return;
    
    // Map mouse position to look direction
    const x = (state.pointer.x * Math.PI) / 3;
    const y = (state.pointer.y * Math.PI) / 3;
    
    // Smooth look tracking
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y, 0.1);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x, 0.1);
  });

  return (
    <group ref={group} position={position}>
      {/* Sclera (White part) */}
      <Sphere args={[0.3, 32, 32]}>
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </Sphere>
      {/* Pupil (Black part) */}
      <Sphere ref={pupil} args={[0.15, 16, 16]} position={[0, 0, 0.2]}>
        <meshStandardMaterial color="#000000" roughness={0.4} />
      </Sphere>
      {/* Highlight */}
      <Sphere args={[0.04, 8, 8]} position={[0.05, 0.05, 0.3]}>
        <meshBasicMaterial color="#ffffff" />
      </Sphere>
    </group>
  );
};

const CuteCompanion = () => {
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!bodyRef.current) return;
    // Cheerful floating bounce
    bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
    // Slight idle sway
    bodyRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
  });

  return (
    <group ref={bodyRef}>
      {/* Main Body */}
      <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4ecdc4" roughness={0.3} metalness={0.1} />
      </Sphere>
      {/* Eyes */}
      <Eye position={[-0.3, 0.2, 0.65]} />
      <Eye position={[0.3, 0.2, 0.65]} />
      
      {/* Little smile */}
      <mesh position={[0, -0.2, 0.75]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.15, 0.03, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
};

export default function Companion3D() {
  return (
    <div className="w-48 h-48 absolute -top-24 right-0 z-50 pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[2, 5, 2]} intensity={2} color="#ffffff" />
        <directionalLight position={[-2, -2, 2]} intensity={0.5} color="#8ab4f8" />
        <CuteCompanion />
      </Canvas>
    </div>
  );
}
