import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  integrations: [react(), mdx()]
});
