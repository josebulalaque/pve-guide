# Proxmox Guide

A plain-English guide to Proxmox VE, for developers building custom apps on it and for the people who run it: from what a hypervisor is, to the 8 → 9 upgrade.

**Read it at <https://josebulalaque.github.io/pve-guide/>**

- **1. Introduction**: hypervisors, what Proxmox is, how a cluster fits together, glossary
- **2. Getting Started**: access, the web UI, the command line, the API, a first health check
- **3. User Guide**: how-tos in the web UI, CLI and API (VMs, containers, storage, Ceph, networking, firewall, permissions, backups, HA, monitoring, maintenance, certificates)
- **4. Technical Reference**: API endpoints, tasks, permissions, commands, services, files, errors, limits, upgrading, runbooks

Covers Proxmox VE 8 and 9, Ceph, SDN and Proxmox Backup Server.

> This is an independent guide and is not affiliated with Proxmox Server Solutions GmbH. Always check the [official Proxmox VE documentation](https://pve.proxmox.com/pve-docs/) before changing production systems.

## Working on the guide

Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build). Requires Node.js 22 or later.

```bash
npm ci              # install
npm run dev         # local preview at http://localhost:4321/pve-guide/
npm run build       # build the static site into dist/
npm run diagrams    # regenerate the diagrams after editing tools/diagrams.cjs
```

| What | Where |
|---|---|
| Pages | `src/content/docs/<section>/<page>.md`: Markdown with Starlight front matter |
| Sidebar order | `sidebar.order` in each page's front matter. `sidebar.badge` marks **Dev** / **Ops** pages. |
| Diagrams | `tools/diagrams.cjs` generates the SVGs in `src/assets/diagrams/`. Don't edit the SVGs by hand. |
| Site settings | `astro.config.mjs` |

Writing style: plain English, short sentences, small tables over paragraphs, a diagram for each major concept. Each page opens with an "In a nutshell" box, and how-to pages have a **Web UI / CLI / API** quick reference.

Links between pages are relative (`../ceph/`), so they work under the `/pve-guide/` base path.

## Publishing

Every push to `main` builds the site and deploys it to GitHub Pages (`.github/workflows/deploy.yml`). In the repository settings, **Pages → Source** must be set to **GitHub Actions**.

## License

© 2026 Jose Bulalaque. The guide is licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/): you may share and adapt it, including commercially, as long as you give appropriate credit and link to the license. See [LICENSE](LICENSE).
