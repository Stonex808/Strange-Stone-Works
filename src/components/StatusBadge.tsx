export default function StatusBadge({ status }: { status: 'Forging' | 'Released' | 'Dormant' }) {
  const map = {
    Forging: 'bg-amber-900/60 text-highlight',
    Released: 'bg-emerald-900/50 text-emerald-300',
    Dormant: 'bg-zinc-800 text-zinc-300'
  };
  return <span className={`px-2 py-1 rounded text-xs font-mono ${map[status]}`}>{status}</span>;
}
