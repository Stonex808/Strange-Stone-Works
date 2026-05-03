'use client';
import { useState } from 'react';

export default function AudioPlayer() {
  const tracks = ['Echoes in Stone', 'Pressure Makes Shapes', 'Neon Prayer'];
  const [active, setActive] = useState(0);
  return <div className="forge-panel p-4">{tracks.map((t, i) => <button key={t} className={`w-full flex justify-between py-2 border-b border-border ${active===i?'text-glow':''}`} onClick={() => setActive(i)}><span>{t}</span><span className="font-mono text-xs">0{i+3}:4{i}</span></button>)}<div className="mt-3 h-12 bg-gradient-to-r from-glow/40 to-transparent rounded" /></div>;
}
