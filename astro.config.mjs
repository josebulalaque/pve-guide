// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const repo = 'https://github.com/josebulalaque/pve-guide';

// https://astro.build/config
export default defineConfig({
	// Served by GitHub Pages as a project site: https://josebulalaque.github.io/pve-guide/
	site: 'https://josebulalaque.github.io',
	base: '/pve-guide',
	integrations: [
		starlight({
			title: 'Proxmox Guide',
			description:
				'A plain-English guide to Proxmox VE for developers building custom apps and the people who run the platform.',
			social: [{ icon: 'github', label: 'GitHub', href: repo }],
			editLink: { baseUrl: `${repo}/edit/main/` },
			sidebar: [
				{ label: '1. Introduction', items: [{ autogenerate: { directory: 'introduction' } }] },
				{ label: '2. Getting Started', items: [{ autogenerate: { directory: 'getting-started' } }] },
				{ label: '3. User Guide', items: [{ autogenerate: { directory: 'user-guide' } }] },
				{ label: '4. Technical Reference', items: [{ autogenerate: { directory: 'reference' } }] },
			],
		}),
	],
});
