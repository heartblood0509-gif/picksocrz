'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Simplified Crystal Ship - using basic materials instead of heavy transmission
function CrystalShip() {
  const shipRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!shipRef.current) return;
    // Gentle floating motion - simplified
    shipRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    shipRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.015;
  });

  return (
    <group ref={shipRef} position={[0, 0, 0]}>
      {/* Main Hull - simple glass-like material */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.8, 3, 8, 16]} />
        <meshPhysicalMaterial
          color="#0ea5e9"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.3}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Upper Deck */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.2, 0.4, 2.5]} />
        <meshPhysicalMaterial
          color="#06b6d4"
          transparent
          opacity={0.5}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>

      {/* Bridge */}
      <mesh position={[0, 1, -0.5]}>
        <boxGeometry args={[0.8, 0.5, 1]} />
        <meshPhysicalMaterial
          color="#f59e0b"
          transparent
          opacity={0.7}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}

// Reduced floating debris - fewer items, simpler materials
function FloatingDebris() {
  const debrisRef = useRef<THREE.Group>(null);

  // Reduced from 20 to 8 items
  const debris = useMemo(() => {
    const items = [];
    for (let i = 0; i < 8; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 8 - 2
        ] as [number, number, number],
        scale: Math.random() * 0.25 + 0.1,
        rotationSpeed: Math.random() * 0.008 + 0.004
      });
    }
    return items;
  }, []);

  useFrame(() => {
    if (!debrisRef.current) return;
    debrisRef.current.children.forEach((child, i) => {
      const item = debris[i];
      if (!item) return;
      child.rotation.x += item.rotationSpeed;
      child.rotation.y += item.rotationSpeed * 0.5;
    });
  });

  const colors = ['#0ea5e9', '#06b6d4', '#f59e0b'];

  return (
    <group ref={debrisRef}>
      {debris.map((item, i) => (
        <Float
          key={i}
          speed={0.5}
          rotationIntensity={0.2}
          floatIntensity={0.3}
        >
          <mesh position={item.position} scale={item.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
              color={colors[i % 3]}
              transparent
              opacity={0.6}
              roughness={0.1}
              metalness={0.3}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Main Scene Component - optimized
export default function OceanScene() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  // Use effect for event listeners to avoid memory leaks
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    // Simplified parallax with less frequent updates
    const targetX = mouseRef.current.x * 1.5;
    const targetY = mouseRef.current.y * 0.8;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + 1, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* Reduced stars count */}
      <Stars
        radius={80}
        depth={40}
        count={1500}
        factor={3}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Simplified lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[8, 8, 8]} intensity={0.8} color="#0ea5e9" />
      <pointLight position={[-8, 4, -8]} intensity={0.5} color="#f59e0b" />

      {/* Main objects */}
      <CrystalShip />
      <FloatingDebris />
    </>
  );
}
