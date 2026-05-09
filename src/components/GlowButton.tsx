import type { ButtonHTMLAttributes, ReactNode } from 'react';

type GlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function GlowButton({ children, className = '', ...props }: GlowButtonProps) {
  return (
    <button
      className={`px-4 py-2 border border-glow text-highlight font-ui tracking-wider uppercase rounded-md bg-panel hover:bg-glow/10 transition duration-300 shadow-ember disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
