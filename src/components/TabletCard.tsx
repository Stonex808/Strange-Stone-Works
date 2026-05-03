export default function TabletCard({ title, excerpt, href }: { title: string; excerpt: string; href: string }) {
  return <a href={href} className="forge-panel p-4 block hover:border-glow transition"><h3 className="font-heading">{title}</h3><p className="text-sm opacity-80">{excerpt}</p></a>;
}
