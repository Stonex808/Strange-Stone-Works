import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useForgeStore } from '@/lib/store';

function EmberParticles() {
  const ref = useRef<THREE.Points>(null!);
  const points = useMemo(() => new Float32Array(Array.from({ length: 900 }, () => (Math.random() - 0.5) * 8)), []);
  const intensity = useForgeStore((s) => s.intensity);
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * (intensity === 'high' ? 0.1 : 0.04);
  });
  return <Points ref={ref} positions={points} stride={3}><PointMaterial color="#FF8A18" size={0.03} transparent opacity={0.6} /></Points>;
}

export default function ForgeFX() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const spark = document.createElement('div');
      spark.className = 'fixed w-2 h-2 rounded-full bg-orange-400 pointer-events-none z-[70]';
      spark.style.left = `${e.clientX}px`; spark.style.top = `${e.clientY}px`;
      document.body.appendChild(spark);
      gsap.to(spark, { y: -30, x: Math.random() * 30 - 15, opacity: 0, scale: 0.2, duration: 0.6, onComplete: () => spark.remove() });
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  return <div className="fixed inset-0 -z-10 opacity-50"><Canvas camera={{ position: [0, 0, 3] }}><ambientLight intensity={0.8} /><EmberParticles /></Canvas></div>;
}
