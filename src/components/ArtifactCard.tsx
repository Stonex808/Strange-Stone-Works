import GlowButton from './GlowButton';

export default function ArtifactCard({ item }: { item: { name: string; price: string; desc: string } }) {
  return <article className="forge-panel p-4"><h3 className="font-heading text-xl">{item.name}</h3><p className="text-sm mb-3">{item.desc}</p><div className="flex justify-between items-center"><span>{item.price}</span><GlowButton>Acquire</GlowButton></div></article>;
}
