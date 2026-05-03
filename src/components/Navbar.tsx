import { motion } from 'framer-motion';

const links = ['dashboard', 'store', 'art', 'music', 'systems', 'tablets', 'annex'];

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between py-4 px-3 border-b border-border">
      <div className="font-heading text-xl tracking-widest">Strange Stone Works</div>
      <div className="flex gap-5 text-sm uppercase font-ui">
        {links.map((item) => (
          <motion.a whileHover={{ y: -2, color: '#FF8A18' }} href={item === 'dashboard' ? '/' : `/${item}`} key={item}>
            {item}
          </motion.a>
        ))}
      </div>
    </nav>
  );
}
