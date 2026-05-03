import type { ReactNode } from 'react';

export default function GlowButton({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <button className={`px-4 py-2 border border-glow text-highlight font-ui tracking-wider uppercase rounded-md bg-panel hover:bg-glow/10 transition duration-300 shadow-ember ${className}`}>
      {children}
    </button>
  );
}
