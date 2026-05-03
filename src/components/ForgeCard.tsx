import { motion } from 'framer-motion';

export default function ForgeCard({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
  return (
    <motion.a href={href} whileHover={{ y: -6, scale: 1.02 }} className="forge-panel glow-border p-5 block">
      <h3 className="font-heading text-2xl">{title}</h3>
      <p className="font-ui text-sm text-text/75">{subtitle}</p>
    </motion.a>
  );
}
