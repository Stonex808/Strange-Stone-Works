import { useForgeStore, type ForgeIntensity } from '@/lib/store';

export default function IntensityToggle() {
  const { intensity, setIntensity } = useForgeStore();
  const opts: ForgeIntensity[] = ['low', 'medium', 'high'];
  return <div className="flex gap-2 text-xs uppercase font-mono">{opts.map((o)=><button key={o} onClick={()=>setIntensity(o)} className={`px-2 py-1 border border-border rounded ${intensity===o?'text-glow border-glow':''}`}>{o}</button>)}</div>;
}
