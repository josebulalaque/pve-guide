# Proxmox Guide: notes for coding agents

`CLAUDE.md` is a link to this file.

## Project

A public, plain-English Proxmox VE guide for two audiences: **developers** building custom apps on the Proxmox API, and **operators / tech support** running the platform. Built with Astro + Starlight and deployed to GitHub Pages at `https://josebulalaque.github.io/pve-guide/` (`site` + `base: '/pve-guide'` in `astro.config.mjs`).

**This repo is the source of truth for the guide's content.** It started as a merge of two internal guides and is now edited here directly. Keep it free of anything organisation-specific: no internal hostnames, people, placeholders ("TO FILL"), or "our application". Refer to the reader's software as "a custom app".

## Commands

```bash
npm run build       # must pass before committing
npm run diagrams    # regenerate src/assets/diagrams/*.svg from tools/diagrams.cjs
astro dev --background   # preview; manage with `astro dev stop|status|logs`
```

## Structure and conventions

- Pages: `src/content/docs/{introduction,getting-started,user-guide,reference}/*.md`. The home page is `src/content/docs/index.mdx`. Sidebar groups autogenerate from these folders (`astro.config.mjs`), and order comes from `sidebar.order` in front matter.
- Titles carry section numbers ("3.5 Ceph"). Renumbering a page means updating its title, `sidebar.order`, and any link text that mentions the number.
- Audience: `sidebar.badge` `Dev` (variant `note`) or `Ops` (variant `success`). Pages without a badge are for everyone.
- Page pattern: `:::note[In a nutshell]` first, a diagram for each major concept, short sections, a **Web UI / CLI / API** quick-reference table on how-to pages, then Gotchas. Callouts: `:::note`, `:::tip`, `:::caution`.
- Links between pages are **relative** (`../ceph/`, `../../reference/services/`) because of the `/pve-guide/` base path. Absolute `/…` links break on GitHub Pages.
- Diagrams are generated: edit `tools/diagrams.cjs` (shared `box`/`arrow`/`text` helpers, fixed palette: green = custom app, orange = Proxmox, blue = VMs, purple = hypervisor), run `npm run diagrams`, and check the result visually. Reference them as `![alt text](../../../assets/diagrams/<name>.svg)` with meaningful alt text. Diagrams have transparent backgrounds and follow light/dark mode through a built-in stylesheet: any **new colour** must be added to `DARK_FILL` / `DARK_LINE` in `tools/diagrams.cjs`, or it won't change in dark mode. Labels of 12px or less are drawn larger (`text()`), because diagrams are shown at about 630px wide, so check that text still fits its box.
- curl / Python examples use Starlight tabs: `<Tabs syncKey="client">` with `<TabItem label="curl">` and `<TabItem label="Python">`. Tabs need the page to be `.mdx` (see `getting-started/first-api-calls.mdx`). In MDX, keep `{`, `}` and `<` inside code.
- Look: Starlight's default accent colours. The logo (`src/assets/logo.svg`, also `public/favicon.svg`) and the home-page hero (`src/assets/hero.svg`) are original SVGs. Don't use the Proxmox logo (trademark). `src/styles/custom.css` adds the home-page glow only.
- Facts: commands, endpoints and privileges were checked against the official Proxmox VE 9 docs and API schema (`https://pve.proxmox.com/pve-docs/api-viewer/apidoc.js`). Verify new ones the same way instead of writing from memory.

## Git

- Commit messages must not include a `Co-Authored-By: Claude` trailer.
- A push to `main` deploys the site. Don't push without the owner's go-ahead.

## Astro and Starlight documentation

- Astro: https://docs.astro.build ([content collections](https://docs.astro.build/en/guides/content-collections/), [routing](https://docs.astro.build/en/guides/routing/), [styling](https://docs.astro.build/en/guides/styling/))
- Starlight: https://starlight.astro.build ([authoring content](https://starlight.astro.build/guides/authoring-content/), [sidebar](https://starlight.astro.build/guides/sidebar/), [components](https://starlight.astro.build/components/using-components/))
