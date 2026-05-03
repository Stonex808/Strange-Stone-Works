import StatusBadge from './StatusBadge';

export default function ProjectCard({ p }: { p: { name: string; status: 'Forging'|'Released'|'Dormant'; stack: string; milestone: string } }) {
  return <article className="forge-panel p-4"><div className="flex justify-between"><h3 className="font-heading">{p.name}</h3><StatusBadge status={p.status} /></div><p className="text-sm mt-2">Stack: {p.stack}</p><p className="text-sm text-highlight mt-1">Next: {p.milestone}</p></article>;
}
