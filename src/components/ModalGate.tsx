import { useState } from 'react';
import GlowButton from './GlowButton';

export default function ModalGate() {
  const [allowed, setAllowed] = useState(false);
  if (allowed) return <div className="forge-panel p-6 mt-6">Restricted archives unlocked. Mature theoretical content placeholder.</div>;
  return (
    <div className="fixed inset-0 bg-black/80 grid place-items-center z-50">
      <div className="forge-panel p-6 max-w-md text-center">
        <h2 className="font-heading text-3xl text-warning">18+ Annex Gate</h2>
        <p className="my-4">Contains mature, uncensored theory and satire. Enter only if 18+.</p>
        <div className="flex gap-3 justify-center">
          <GlowButton className="bg-warning/20" >Exit</GlowButton>
          <GlowButton className="bg-glow/20" >I am 18 or older</GlowButton>
        </div>
        <button className="mt-3 text-xs underline" onClick={() => setAllowed(true)}>Continue (demo)</button>
      </div>
    </div>
  );
}
