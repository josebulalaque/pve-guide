// Generates every diagram in the guide as SVG into src/assets/diagrams/.
// Run: npm run diagrams   (then check the pages that use a changed diagram)
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'src', 'assets', 'diagrams');
fs.mkdirSync(OUT, { recursive: true });

const FONT = 'Liberation Sans, Arial, Helvetica, sans-serif';
const C = {
  hw:    { f: '#F3F4F6', s: '#6B7280' },
  os:    { f: '#DBEAFE', s: '#2563EB' },
  hv:    { f: '#EDE9FE', s: '#7C3AED' },
  pve:   { f: '#FFEDD5', s: '#EA580C' },
  app:   { f: '#DCFCE7', s: '#16A34A' },
  vm:    { f: '#E0F2FE', s: '#0284C7' },
  ct:    { f: '#FEF3C7', s: '#D97706' },
  bad:   { f: '#FEE2E2', s: '#DC2626' },
  frame: { f: '#FAFAFA', s: '#9CA3AF' },
  white: { f: '#FFFFFF', s: '#9CA3AF' },
};
const INK = '#1F2937', MUTED = '#4B5563';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function text(x, y, s, o = {}) {
  const { size = 14, bold = false, anchor = 'middle', fill = INK, italic = false, halo = false } = o;
  const h = halo ? ` stroke="#FFFFFF" stroke-width="5" paint-order="stroke" stroke-linejoin="round"` : '';
  // Diagrams are drawn ~860px wide but shown at ~630px, so small labels get one size step
  // bigger to stay readable on the page.
  const px = size <= 11 ? size + 2 : size === 12 ? 13 : size;
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${px}" font-weight="${bold ? 700 : 400}"${italic ? ' font-style="italic"' : ''} text-anchor="${anchor}" fill="${fill}"${h}>${esc(s)}</text>`;
}

// Box with centred lines of text. First line bold unless o.plain.
function box(x, y, w, h, c, lines = [], o = {}) {
  const { size = 14, rx = 8, dash = false, plain = false, sub = 12 } = o;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c.f}" stroke="${c.s}" stroke-width="1.6"${dash ? ' stroke-dasharray="6 4"' : ''}/>`;
  if (typeof lines === 'string') lines = [lines];
  const lh = size + 5;
  const total = lines.length ? size + (lines.length - 1) * lh : 0;
  let ty = y + h / 2 - total / 2 + size * 0.8;
  lines.forEach((l, i) => {
    s += text(x + w / 2, ty, l, { size: i === 0 ? size : sub, bold: i === 0 && !plain, fill: i === 0 ? INK : MUTED });
    ty += i === 0 ? lh : sub + 5;
  });
  return s;
}

function arrow(x1, y1, x2, y2, o = {}) {
  const { color = MUTED, dash = false, both = false, width = 1.8 } = o;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"${dash ? ' stroke-dasharray="6 4"' : ''} marker-end="url(#ah)"${both ? ' marker-start="url(#ahs)"' : ''}/>`;
}

// Dark mode: every colour in the palette has a dark-theme counterpart. The diagrams use
// presentation attributes (fill="#…"), which CSS overrides, so one stylesheet re-themes them
// all. It follows the reader's colour scheme (prefers-color-scheme), like the site's "Auto" mode.
const DARK_FILL = {
  '#F3F4F6': '#262a33', '#DBEAFE': '#172554', '#EDE9FE': '#2e1065', '#FFEDD5': '#431407',
  '#DCFCE7': '#052e16', '#E0F2FE': '#082f49', '#FEF3C7': '#422006', '#FEE2E2': '#450a0a',
  '#FAFAFA': '#1b1d24', '#F9FAFB': '#23262f',
};
const DARK_LINE = {   // outline colours; also used as text colours
  '#6B7280': '#9ca3af', '#2563EB': '#60a5fa', '#7C3AED': '#a78bfa', '#EA580C': '#fb923c',
  '#16A34A': '#4ade80', '#0284C7': '#38bdf8', '#D97706': '#fbbf24', '#DC2626': '#f87171',
  '#9CA3AF': '#6b7280', '#E5E7EB': '#374151', '#D1D5DB': '#4b5563',
};
const DARK_CSS = [
  ...Object.entries(DARK_FILL).map(([l, d]) => `[fill="${l}"]{fill:${d}}`),
  ...Object.entries(DARK_LINE).map(([l, d]) => `[stroke="${l}"]{stroke:${d}}`),
  ...Object.entries(DARK_LINE).filter(([l]) => !['#9CA3AF', '#E5E7EB', '#D1D5DB'].includes(l))
    .map(([l, d]) => `:not(circle)[fill="${l}"]{fill:${d}}`),
  `text[fill="${INK}"]{fill:#e5e7eb}`, `[fill="${MUTED}"]{fill:#9ca3af}`,
  'rect[fill="#FFFFFF"]{fill:#23262f}', 'text[stroke="#FFFFFF"]{stroke:#17181c}',
].join('');

function svg(name, w, h, body) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<style>@media (prefers-color-scheme: dark){${DARK_CSS}}</style>
<defs>
<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${MUTED}"/></marker>
<marker id="ahs" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${MUTED}"/></marker>
</defs>
${body}
</svg>`;
  fs.writeFileSync(path.join(OUT, name + '.svg'), s);
  console.log('wrote', name);
}

// ---------- 1.1 one server, many VMs ----------
{
  let b = '';
  const vms = [['VM 1', 'Web app', 'Ubuntu'], ['VM 2', 'Database', 'Debian'], ['VM 3', 'File server', 'Windows'], ['VM 4', 'Test box', 'Rocky Linux']];
  vms.forEach(([n, app, os], i) => {
    const x = 30 + i * 190;
    b += box(x, 20, 170, 150, C.vm, []);
    b += text(x + 85, 44, n, { bold: true });
    b += box(x + 15, 58, 140, 42, C.app, [app], { size: 13 });
    b += box(x + 15, 112, 140, 42, C.os, [os], { size: 13, plain: true });
  });
  b += box(30, 190, 740, 60, C.hv, ['Hypervisor', 'shares out CPU, memory, disk and network · keeps every VM separate']);
  b += box(30, 270, 740, 110, C.hw, []);
  b += text(400, 296, 'One physical server (the "host")', { bold: true });
  ['CPU cores', 'Memory (RAM)', 'Disks', 'Network'].forEach((l, i) => { b += box(60 + i * 175, 312, 155, 48, C.white, [l], { size: 13, plain: true }); });
  svg('11-one-server-many-vms', 800, 400, b);
}

// ---------- 1.1 type 1 vs type 2 ----------
{
  let b = '';
  b += text(210, 32, 'Type 1 — "bare metal"', { bold: true, size: 17 });
  b += text(210, 54, 'Proxmox VE, VMware ESXi, Hyper-V, XCP-ng', { size: 13, fill: MUTED });
  b += box(40, 155, 165, 80, C.vm, ['VM', 'guest OS + apps']);
  b += box(215, 155, 165, 80, C.vm, ['VM', 'guest OS + apps']);
  b += box(40, 245, 340, 45, C.hv, ['Hypervisor']);
  b += box(40, 300, 340, 45, C.hw, ['Physical server']);
  b += text(210, 368, 'Runs directly on the hardware: fast, built for servers', { size: 13, fill: MUTED, italic: true });

  b += text(630, 32, 'Type 2 — "hosted"', { bold: true, size: 17 });
  b += text(630, 54, 'VirtualBox, VMware Workstation, Parallels', { size: 13, fill: MUTED });
  b += box(460, 100, 165, 80, C.vm, ['VM', 'guest OS + apps']);
  b += box(635, 100, 165, 80, C.vm, ['VM', 'guest OS + apps']);
  b += box(460, 190, 340, 45, C.hv, ['Hypervisor app']);
  b += box(460, 245, 340, 45, C.os, ['Desktop OS (Windows / macOS / Linux)']);
  b += box(460, 300, 340, 45, C.hw, ['Laptop / desktop']);
  b += text(630, 368, 'Runs as an app on a normal OS: easy, but slower', { size: 13, fill: MUTED, italic: true });
  b += `<line x1="420" y1="20" x2="420" y2="350" stroke="#E5E7EB" stroke-width="2"/>`;
  svg('11-type1-vs-type2', 840, 385, b);
}

// ---------- 1.1 VMs vs containers ----------
{
  let b = '';
  b += text(210, 32, 'Virtual machines (KVM)', { bold: true, size: 17 });
  b += text(210, 54, 'each VM brings its own operating system', { size: 13, fill: MUTED });
  [40, 215].forEach(x => {
    b += box(x, 80, 165, 165, C.vm, []);
    b += text(x + 82, 102, 'VM', { bold: true });
    b += box(x + 12, 114, 141, 40, C.app, ['App'], { size: 13 });
    b += box(x + 12, 162, 141, 70, C.os, ['Guest OS', 'with its own kernel'], { size: 13 });
  });
  b += box(40, 255, 340, 45, C.hv, ['Host Linux kernel + KVM']);
  b += box(40, 310, 340, 45, C.hw, ['Physical server']);

  b += text(630, 32, 'Containers (LXC)', { bold: true, size: 17 });
  b += text(630, 54, 'containers share the host\'s kernel', { size: 13, fill: MUTED });
  [460, 575, 690].forEach(x => {
    b += box(x, 150, 110, 95, C.ct, []);
    b += text(x + 55, 172, 'Container', { bold: true, size: 13 });
    b += box(x + 10, 184, 90, 26, C.app, ['App'], { size: 12 });
    b += text(x + 55, 230, 'Linux files only', { size: 11, fill: MUTED });
  });
  b += box(460, 255, 340, 45, C.os, ['Shared host Linux kernel']);
  b += box(460, 310, 340, 45, C.hw, ['Physical server']);
  b += text(210, 380, 'Stronger isolation · any OS · more overhead', { size: 13, fill: MUTED, italic: true });
  b += text(630, 380, 'Lighter and faster · Linux only · less isolation', { size: 13, fill: MUTED, italic: true });
  b += `<line x1="420" y1="20" x2="420" y2="360" stroke="#E5E7EB" stroke-width="2"/>`;
  svg('11-vms-vs-containers', 840, 400, b);
}

// ---------- 1.1 Proxmox stack ----------
{
  let b = '';
  b += box(30, 20, 760, 55, C.app, ['Custom app', 'talks to Proxmox through the REST API']);
  b += arrow(410, 75, 410, 97);
  b += box(30, 100, 760, 95, C.pve, []);
  b += text(410, 124, 'Proxmox VE management layer', { bold: true });
  const chips = ['Web UI', 'REST API', 'Clustering & HA', 'Ceph', 'SDN', 'Firewall', 'Backups / PBS'];
  const cw = 98, gap = 9, start = 30 + (760 - (chips.length * cw + (chips.length - 1) * gap)) / 2;
  chips.forEach((l, i) => { b += box(start + i * (cw + gap), 140, cw, 38, C.white, [l], { size: 12, plain: true }); });
  b += box(30, 210, 372, 55, C.vm, ['QEMU', 'builds each VM\'s virtual hardware']);
  b += box(418, 210, 372, 55, C.ct, ['LXC', 'creates and isolates containers']);
  b += box(30, 280, 760, 95, C.os, []);
  b += text(410, 302, 'Linux kernel (Debian)', { bold: true });
  b += box(50, 316, 352, 45, C.hv, ['KVM', 'runs VM code directly on the CPU'], { size: 13, sub: 11 });
  b += box(438, 316, 332, 45, C.white, ['Namespaces & cgroups', 'keep containers apart'], { size: 13, sub: 11 });
  b += box(30, 390, 760, 50, C.hw, ['Physical server', 'CPU (VT-x / AMD-V) · RAM · disks · network cards']);
  svg('11-proxmox-stack', 820, 460, b);
}

// ---------- 1.2 responsibilities ----------
{
  let b = '';
  b += box(30, 20, 290, 250, C.app, []);
  b += text(175, 50, 'Custom app', { bold: true, size: 17 });
  ['Decides what to create, when, for whom', 'Calls the Proxmox API', 'Waits for tasks to finish', 'Keeps its own records', 'Handles Proxmox errors'].forEach((l, i) => {
    b += box(48, 68 + i * 39, 254, 31, C.white, [l], { size: 13, plain: true, rx: 6 });
  });
  b += arrow(330, 115, 500, 115);
  b += text(415, 103, 'API requests', { size: 13, fill: MUTED });
  b += arrow(500, 175, 330, 175);
  b += text(415, 163, 'results + task IDs', { size: 13, fill: MUTED });
  b += box(510, 20, 290, 250, C.pve, []);
  b += text(655, 50, 'Proxmox', { bold: true, size: 17 });
  ['Runs VMs and containers', 'Stores disks (Ceph)', 'Provides networks (SDN)', 'Backs up (PBS)', 'Keeps the cluster healthy', 'Checks permissions'].forEach((l, i) => {
    b += box(528, 64 + i * 34, 254, 28, C.white, [l], { size: 13, plain: true, rx: 6 });
  });
  svg('12-responsibilities', 830, 290, b);
}

// ---------- 1.3 cluster overview ----------
{
  let b = '';
  b += box(150, 15, 230, 50, C.app, ['Custom app', 'uses the REST API'], { sub: 11 });
  b += box(480, 15, 230, 50, C.white, ['People in a browser', 'use the web UI + console'], { sub: 11 });
  b += arrow(265, 65, 265, 108) + arrow(595, 65, 595, 108);
  b += text(430, 92, 'HTTPS port 8006', { size: 13, fill: MUTED });
  b += box(30, 112, 800, 305, C.frame, [], { dash: true });
  b += text(48, 136, 'Proxmox cluster', { bold: true, anchor: 'start', fill: MUTED });
  [['Node 1', ['VM 101', 'VM 102', 'CT 200']], ['Node 2', ['VM 103', 'VM 104']], ['Node 3', ['VM 105', 'CT 201', 'VM 106']]].forEach(([n, gs], i) => {
    const x = 60 + i * 255;
    b += box(x, 148, 230, 110, C.white, []);
    b += text(x + 115, 172, n, { bold: true });
    b += text(x + 115, 190, 'web UI + API', { size: 11, fill: MUTED });
    gs.forEach((g, j) => { b += box(x + 12 + j * 71, 205, 64, 36, g.startsWith('CT') ? C.ct : C.vm, [g], { size: 12, plain: true, rx: 6 }); });
  });
  b += box(60, 272, 740, 38, C.hv, ['/etc/pve: shared configuration, identical on every node'], { size: 13 });
  b += box(60, 318, 740, 38, C.os, ['Ceph: shared storage built from all the nodes\' disks'], { size: 13 });
  b += box(60, 364, 740, 38, C.vm, ['SDN: virtual networks available on every node'], { size: 13 });
  b += arrow(430, 417, 430, 455);
  b += text(442, 441, 'scheduled backups', { size: 13, fill: MUTED, anchor: 'start' });
  b += box(290, 458, 280, 50, C.pve, ['Proxmox Backup Server', 'separate server']);
  svg('13-cluster-overview', 860, 525, b);
}

// ---------- 1.3 quorum ----------
{
  let b = '';
  const node = (cx, cy, label, c, cross = false) => {
    let s = `<circle cx="${cx}" cy="${cy}" r="27" fill="${c.f}" stroke="${c.s}" stroke-width="2"/>` + (cross ? text(cx + 38, cy + 5, label + ' (off)', { bold: true, anchor: 'start', fill: c.s }) : text(cx, cy + 5, label, { bold: true }));
    if (cross) s += `<line x1="${cx - 14}" y1="${cy - 14}" x2="${cx + 14}" y2="${cy + 14}" stroke="${c.s}" stroke-width="3"/><line x1="${cx + 14}" y1="${cy - 14}" x2="${cx - 14}" y2="${cy + 14}" stroke="${c.s}" stroke-width="3"/>`;
    return s;
  };
  const link = (a, c, ok = true) => `<line x1="${a[0]}" y1="${a[1]}" x2="${c[0]}" y2="${c[1]}" stroke="${ok ? '#9CA3AF' : '#DC2626'}" stroke-width="2.5"${ok ? '' : ' stroke-dasharray="5 5"'}/>`;
  const panels = [
    { t: 'All 3 nodes up', st: [['3 of 3 votes', C.app], ['Quorate: changes allowed', C.app]] },
    { t: 'One node down', st: [['2 of 3 votes', C.app], ['Still quorate: changes allowed', C.app]] },
    { t: 'Network split', st: [['Node 1 alone: 1 of 3 votes', C.bad], ['Node 1 is read-only', C.bad]] },
  ];
  panels.forEach((p, i) => {
    const ox = 20 + i * 295;
    b += `<rect x="${ox}" y="15" width="275" height="290" rx="10" fill="#FAFAFA" stroke="#E5E7EB"/>`;
    b += text(ox + 137, 45, p.t, { bold: true, size: 16 });
    const A = [ox + 137, 95], B = [ox + 70, 185], D = [ox + 205, 185];
    if (i === 0) b += link(A, B) + link(A, D) + link(B, D) + node(...A, 'N1', C.app) + node(...B, 'N2', C.app) + node(...D, 'N3', C.app);
    if (i === 1) b += link(B, D) + node(...A, 'N1', C.bad, true) + node(...B, 'N2', C.app) + node(...D, 'N3', C.app);
    if (i === 2) b += link(A, B, false) + link(A, D, false) + link(B, D) + node(...A, 'N1', C.bad) + node(...B, 'N2', C.app) + node(...D, 'N3', C.app);
    p.st.forEach(([l, c], j) => { b += text(ox + 137, 245 + j * 22, l, { size: 13, bold: j === 1, fill: c.s }); });
    if (i === 2) b += text(ox + 137, 289, 'N2 + N3: 2 of 3, still quorate', { size: 12, fill: C.app.s });
  });
  svg('13-quorum', 905, 320, b);
}

// ---------- 1.3 API request flow ----------
{
  let b = '';
  const L = [[110, 'Custom app', C.app], [340, 'Node A', C.pve, 'pveproxy'], [570, 'Node B', C.pve, 'pveproxy'], [800, 'Node B', C.hv, 'pvedaemon']];
  L.forEach(([x, t, c, s]) => {
    b += box(x - 90, 15, 180, 52, c, s ? [t, s] : [t]);
    b += `<line x1="${x}" y1="67" x2="${x}" y2="470" stroke="#D1D5DB" stroke-width="2" stroke-dasharray="5 5"/>`;
  });
  const msg = (y, x1, x2, label, o = {}) => {
    let s = arrow(x1, y, x2, y, { dash: o.dash });
    const lx = Math.min(x1, x2) + 12;
    s += text(lx, y - 8, label, { size: 13, anchor: 'start', halo: true, bold: o.bold });
    return s;
  };
  const note = (x, y, label, c = C.white) => box(x - 100, y - 17, 200, 34, c, [label], { size: 12, plain: true, rx: 6 });
  b += msg(115, 110, 340, '1. Start VM 105');
  b += note(340, 160, '2. Check token + permissions');
  b += msg(215, 340, 570, '3. Forward: VM 105 is on Node B');
  b += msg(265, 570, 800, '4. Run the action');
  b += note(790, 310, '5. Start a background task', C.hv);
  b += msg(365, 800, 110, '6. Reply straight away with a task ID (UPID)', { dash: true, bold: true });
  b += msg(410, 110, 340, '7. Check task status (repeat)');
  b += msg(455, 340, 110, '8. "stopped" + OK or error', { dash: true });
  svg('13-api-request-flow', 910, 485, b);
}

// ---------- 1.3 SDN ----------
{
  let b = '';
  b += box(260, 15, 340, 55, C.hv, ['Zone: "customers"', 'the network technology, e.g. VLAN or VXLAN']);
  b += arrow(370, 70, 210, 105) + arrow(490, 70, 650, 105);
  b += box(90, 108, 240, 50, C.vm, ['VNet: cust-a', 'a virtual network'], { size: 14 });
  b += box(530, 108, 240, 50, C.vm, ['VNet: cust-b', 'a virtual network'], { size: 14 });
  b += arrow(210, 158, 210, 183) + arrow(650, 158, 650, 183);
  b += box(90, 186, 240, 50, C.os, ['Subnet 10.10.1.0/24', 'gateway 10.10.1.1'], { size: 14 });
  b += box(530, 186, 240, 50, C.os, ['Subnet 10.10.2.0/24', 'gateway 10.10.2.1'], { size: 14 });
  b += arrow(210, 236, 160, 262) + arrow(210, 236, 260, 262) + arrow(650, 236, 650, 262);
  b += box(110, 265, 100, 36, C.white, ['VM 101'], { size: 13, plain: true });
  b += box(220, 265, 100, 36, C.white, ['VM 102'], { size: 13, plain: true });
  b += box(600, 265, 100, 36, C.white, ['VM 201'], { size: 13, plain: true });
  b += box(160, 322, 540, 44, C.ct, ['Changes stay "pending" until you Apply them', 'web UI: SDN → Apply · API: PUT /cluster/sdn'], { size: 13, sub: 12 });
  svg('13-sdn', 860, 380, b);
}

// ---------- 1.3 PBS ----------
{
  let b = '';
  b += box(30, 40, 220, 150, C.white, []);
  b += text(140, 64, 'Proxmox VE node', { bold: true });
  b += box(50, 80, 85, 40, C.vm, ['VM 101'], { size: 12, plain: true });
  b += box(145, 80, 85, 40, C.vm, ['VM 102'], { size: 12, plain: true });
  b += box(50, 132, 180, 40, C.pve, ['Backup job (vzdump)'], { size: 12 });
  b += arrow(255, 100, 420, 100);
  b += text(337, 88, 'incremental backup', { size: 12, fill: MUTED });
  b += arrow(420, 150, 255, 150);
  b += text(337, 168, 'restore', { size: 12, fill: MUTED });
  b += box(425, 20, 405, 200, C.pve, []);
  b += text(627, 44, 'Proxmox Backup Server', { bold: true });
  b += box(445, 58, 365, 92, C.white, []);
  b += text(627, 78, 'Datastore: data stored in chunks', { size: 13, bold: true });
  const pal = ['#BFDBFE', '#FDE68A', '#BBF7D0', '#FBCFE8', '#DDD6FE'];
  for (let i = 0; i < 12; i++) b += `<rect x="${470 + i * 28}" y="92" width="22" height="22" rx="3" fill="${pal[i % 5]}" stroke="#9CA3AF"/>`;
  b += text(627, 136, 'identical chunks are stored once (deduplication)', { size: 12, fill: MUTED });
  [['Verify', 'checks backups'], ['Prune', 'drops old backups'], ['Garbage collect', 'frees the space']].forEach(([t, s], i) => {
    b += box(445 + i * 125, 160, 115, 46, C.white, [t, s], { size: 13, sub: 11 });
  });
  svg('13-pbs', 860, 240, b);
}

// ---------- 1.3 web UI layout ----------
{
  let b = '';
  const call = (x, y, n) => `<circle cx="${x}" cy="${y}" r="13" fill="#EA580C"/>` + text(x, y + 5, n, { bold: true, size: 14, fill: '#FFFFFF' });
  b += `<rect x="10" y="10" width="840" height="410" rx="10" fill="#FFFFFF" stroke="#9CA3AF" stroke-width="1.6"/>`;
  // header
  b += `<rect x="10" y="10" width="840" height="46" rx="10" fill="#F3F4F6"/><rect x="10" y="40" width="840" height="16" fill="#F3F4F6"/>`;
  b += text(28, 39, 'PROXMOX', { bold: true, anchor: 'start', fill: '#EA580C' });
  b += text(112, 39, 'Virtual Environment', { size: 13, anchor: 'start', fill: MUTED });
  b += box(270, 20, 200, 26, C.white, ['Search'], { size: 12, plain: true, rx: 5 });
  b += box(560, 20, 82, 26, C.white, ['Create VM'], { size: 12, plain: true, rx: 5 });
  b += box(650, 20, 82, 26, C.white, ['Create CT'], { size: 12, plain: true, rx: 5 });
  b += box(740, 20, 96, 26, C.white, ['user@pam'], { size: 12, plain: true, rx: 5 });
  // tree
  b += `<rect x="20" y="66" width="230" height="260" rx="6" fill="#FAFAFA" stroke="#E5E7EB"/>`;
  b += box(30, 74, 210, 24, C.white, ['Server View'], { size: 12, plain: true, rx: 4 });
  const tree = [[0, 'Datacenter', 1], [1, 'node1', 1], [2, '100 (web01)', 0, C.vm], [2, '101 (db01)', 0, C.vm], [2, '200 (tools)', 0, C.ct], [2, 'ceph-pool', 0], [2, 'local', 0], [1, 'node2', 1], [2, '102 (web02)', 0, C.vm], [1, 'node3', 1]];
  b += `<rect x="52" y="149" width="190" height="20" rx="3" fill="#FFEDD5"/>`;
  tree.forEach(([d, l, bold, c], i) => {
    const y = 122 + i * 20, x = 36 + d * 18;
    if (c) b += `<rect x="${x}" y="${y - 11}" width="10" height="10" rx="2" fill="${c.f}" stroke="${c.s}"/>`;
    b += text(x + (c ? 16 : 0), y, l, { size: 12, anchor: 'start', bold: !!bold });
  });
  // content
  b += `<rect x="260" y="66" width="580" height="260" rx="6" fill="#FFFFFF" stroke="#E5E7EB"/>`;
  b += text(275, 88, 'Virtual Machine 100 (web01) on node node1', { bold: true, size: 13, anchor: 'start' });
  ['Summary', 'Console', 'Hardware', 'Cloud-Init', 'Options', 'Task History', 'Backup', 'Snapshots', 'Firewall', 'Permissions'].forEach((t, i) => {
    const y = 100 + i * 22;
    b += `<rect x="270" y="${y}" width="120" height="20" rx="3" fill="${i === 1 ? '#FFEDD5' : '#F9FAFB'}" stroke="#E5E7EB"/>`;
    b += text(280, y + 14, t, { size: 12, anchor: 'start', bold: i === 1 });
  });
  b += `<rect x="400" y="100" width="425" height="214" rx="4" fill="#111827"/>`;
  b += text(415, 125, 'Ubuntu 24.04 LTS web01 tty1', { size: 12, anchor: 'start', fill: '#D1D5DB' });
  b += text(415, 145, 'web01 login: _', { size: 12, anchor: 'start', fill: '#D1D5DB' });
  b += text(612, 300, 'console (noVNC) in the page', { size: 11, fill: '#9CA3AF' });
  // tasks
  b += `<rect x="20" y="336" width="820" height="76" rx="6" fill="#FAFAFA" stroke="#E5E7EB"/>`;
  b += text(32, 354, 'Tasks', { bold: true, size: 12, anchor: 'start' });
  b += text(82, 354, 'Cluster log', { size: 12, anchor: 'start', fill: MUTED });
  [['node1', 'VM 100 - Start', 'OK', C.app.s], ['node2', 'VM 102 - Backup', 'running…', C.os.s]].forEach(([n, t, st, col], i) => {
    const y = 376 + i * 20;
    b += text(32, y, n, { size: 12, anchor: 'start', fill: MUTED });
    b += text(110, y, t, { size: 12, anchor: 'start' });
    b += text(320, y, st, { size: 12, anchor: 'start', fill: col, bold: true });
  });
  b += call(515, 33, '1') + call(30, 62, '2') + call(845, 70, '3') + call(845, 340, '4');
  svg('13-web-ui', 860, 430, b);
}

// ---------- 1.3 console flow ----------
{
  let b = '';
  b += box(20, 95, 170, 70, C.white, ['Your browser', 'Console tab in web UI'], { sub: 11 });
  b += arrow(190, 130, 290, 130);
  b += text(240, 118, 'WebSocket', { size: 12, fill: MUTED });
  b += box(295, 85, 200, 90, C.pve, ['pveproxy', 'port 8006, any node', 'forwards to the right node'], { sub: 11 });
  b += arrow(495, 115, 585, 45) + arrow(495, 130, 585, 130) + arrow(495, 145, 585, 215);
  b += box(590, 15, 250, 62, C.vm, ['VM screen', 'noVNC (default) or SPICE'], { sub: 12 });
  b += box(590, 100, 250, 62, C.ct, ['Container terminal', 'xterm.js'], { sub: 12 });
  b += box(590, 185, 250, 62, C.hw, ['Node shell', 'xterm.js'], { sub: 12 });
  svg('13-console', 860, 262, b);
}

// ======================= 3. User Guide =======================
const lbl = (x, y, s, o = {}) => text(x, y, s, { size: 12, fill: MUTED, halo: true, ...o });

// ---------- 3.1 VM lifecycle ----------
{
  let b = '';
  b += box(30, 130, 150, 60, C.app, ['Create / Clone']);
  b += box(270, 20, 150, 50, C.bad, ['Deleted']);
  b += box(270, 130, 150, 60, C.hw, ['Stopped']);
  b += box(510, 130, 150, 60, C.vm, ['Running']);
  b += box(720, 130, 120, 60, C.ct, ['Paused', 'suspended'], { sub: 11 });
  b += box(270, 260, 150, 55, C.pve, ['Template', 'read-only master'], { sub: 11 });
  b += arrow(180, 160, 268, 160);
  b += arrow(420, 148, 508, 148) + lbl(464, 140, 'start');
  b += arrow(510, 174, 422, 174) + lbl(466, 208, 'shutdown / stop');
  b += arrow(660, 148, 718, 148) + lbl(689, 140, 'suspend');
  b += arrow(720, 174, 662, 174) + lbl(691, 208, 'resume');
  b += arrow(345, 130, 345, 72) + lbl(352, 106, 'delete', { anchor: 'start' });
  b += arrow(345, 190, 345, 258) + lbl(352, 228, 'convert (one-way)', { anchor: 'start' });
  b += arrow(270, 288, 120, 192) + lbl(188, 232, 'clone', { anchor: 'end' });
  b += lbl(585, 236, 'reboot / reset: stays running');
  svg('31-vm-lifecycle', 860, 330, b);
}

// ---------- 3.2 unprivileged containers ----------
{
  let b = '';
  b += box(30, 20, 300, 210, C.ct, []);
  b += text(180, 46, 'Inside the container', { bold: true });
  b += box(530, 20, 300, 210, C.hw, []);
  b += text(680, 46, 'On the host', { bold: true });
  [['root', 'UID 0', 'UID 100000'], ['www-data', 'UID 33', 'UID 100033'], ['app user', 'UID 1000', 'UID 101000']].forEach(([n, a, h], i) => {
    const y = 66 + i * 52;
    b += box(50, y, 260, 40, C.white, [`${n}  (${a})`], { size: 13 });
    b += box(550, y, 260, 40, C.white, [`${h}: no special rights`], { size: 13, plain: true });
    b += arrow(312, y + 20, 548, y + 20) + lbl(430, y + 14, 'mapped to');
  });
  b += text(430, 260, 'Unprivileged (the default): root inside the container is a nobody on the host.', { size: 13 });
  b += text(430, 282, 'If someone breaks out of the container, they have no power on the node.', { size: 13, fill: MUTED });
  svg('32-unprivileged', 860, 300, b);
}

// ---------- 3.3 templates and clones ----------
{
  let b = '';
  b += box(30, 110, 210, 80, C.pve, ['Template 9000', 'read-only master disk'], { sub: 12 });
  b += box(450, 20, 380, 100, C.vm, ['Full clone: VM 101', 'an independent copy of every disk', 'slower to create · template can be deleted'], { sub: 12 });
  b += box(450, 180, 380, 100, C.vm, ['Linked clone: VM 102', 'shares the template\'s disk, stores only its changes', 'fast and small · template must be kept'], { sub: 12 });
  b += arrow(240, 135, 448, 70) + lbl(340, 92, 'copy all data');
  b += arrow(240, 165, 448, 215) + lbl(340, 175, 'clone');
  b += arrow(448, 255, 240, 180, { dash: true }) + lbl(330, 250, 'reads unchanged data');
  svg('33-templates-clones', 860, 300, b);
}

// ---------- 3.3 cloud-init ----------
{
  let b = '';
  b += box(20, 30, 230, 190, C.pve, []);
  b += text(135, 56, 'Proxmox Cloud-Init tab', { bold: true });
  ['User + password', 'SSH public key', 'IP address / DHCP', 'DNS servers'].forEach((l, i) => { b += box(40, 72 + i * 36, 190, 28, C.white, [l], { size: 12, plain: true, rx: 5 }); });
  b += arrow(250, 125, 333, 125) + lbl(291, 115, 'builds');
  b += box(337, 85, 150, 80, C.hw, ['Cloud-init drive', 'a small virtual CD'], { sub: 12 });
  b += arrow(487, 125, 566, 125) + lbl(527, 115, 'read at boot');
  b += box(570, 30, 270, 190, C.vm, []);
  b += text(705, 56, 'VM on first boot', { bold: true });
  ['Sets the hostname', 'Creates the user', 'Installs the SSH key', 'Configures the network'].forEach((l, i) => { b += box(590, 72 + i * 36, 230, 28, C.white, [l], { size: 12, plain: true, rx: 5 }); });
  b += text(430, 250, 'The OS inside the template must have cloud-init installed. Most "cloud images" do.', { size: 13, fill: MUTED, italic: true });
  svg('33-cloud-init', 860, 270, b);
}

// ---------- 3.4 storage: local vs shared ----------
{
  let b = '';
  [0, 1, 2].forEach(i => {
    const x = 40 + i * 270;
    b += box(x, 20, 240, 130, C.white, []);
    b += text(x + 120, 44, `Node ${i + 1}`, { bold: true });
    b += box(x + 15, 58, 100, 36, C.vm, ['VM 10' + (i + 1)], { size: 12, plain: true, rx: 6 });
    b += box(x + 15, 102, 210, 36, C.hw, ['Local: LVM-thin / ZFS / dir'], { size: 12, plain: true, rx: 6 });
    b += arrow(x + 120, 150, x + 120, 192);
  });
  b += box(40, 195, 780, 55, C.os, ['Shared storage: Ceph RBD, CephFS, NFS, iSCSI', 'every node sees the same disks']);
  b += box(40, 270, 380, 50, C.white, ['Local', 'fast · VM is tied to its node'], { size: 13, sub: 12 });
  b += box(440, 270, 380, 50, C.white, ['Shared', 'needed for quick live migration and HA'], { size: 13, sub: 12 });
  svg('34-storage', 860, 335, b);
}

// ---------- 3.5 Ceph data placement ----------
{
  let b = '';
  b += box(20, 120, 150, 70, C.vm, ['VM disk', 'an RBD image'], { sub: 12 });
  b += arrow(170, 155, 215, 155);
  b += box(220, 110, 160, 90, C.white, []);
  b += text(300, 132, 'split into objects', { bold: true, size: 13 });
  const pal = ['#BFDBFE', '#FDE68A', '#BBF7D0', '#FBCFE8'];
  pal.forEach((p, i) => { b += `<rect x="${238 + i * 32}" y="148" width="24" height="24" rx="3" fill="${p}" stroke="#9CA3AF"/>`; });
  b += text(300, 192, '4 MB each', { size: 11, fill: MUTED });
  b += arrow(380, 155, 425, 155);
  b += box(430, 115, 150, 80, C.hv, ['CRUSH map', 'picks 3 OSDs on', '3 different nodes'], { size: 13, sub: 11 });
  [0, 1, 2].forEach(i => {
    const y = 20 + i * 100;
    b += arrow(580, 155, 668, y + 40);
    b += box(672, y, 168, 80, C.white, []);
    b += text(756, y + 22, `Node ${i + 1} · copy ${i + 1}`, { bold: true, size: 13 });
    [0, 1, 2].forEach(j => {
      const x = 686 + j * 50;
      b += `<rect x="${x}" y="${y + 34}" width="42" height="34" rx="4" fill="${C.hw.f}" stroke="${C.hw.s}"/>`;
      b += text(x + 21, y + 56, 'OSD', { size: 10, fill: MUTED });
    });
    b += `<rect x="${686 + i * 50 + 9}" y="${y + 38}" width="24" height="24" rx="3" fill="${pal[0]}" stroke="#2563EB" stroke-width="2"/>`;
  });
  b += text(330, 262, 'size = 3: three copies on three nodes', { size: 13, bold: true });
  b += text(330, 284, 'min_size = 2: disks keep working while 2 copies are reachable', { size: 13, fill: MUTED });
  svg('35-ceph-placement', 860, 320, b);
}

// ---------- 3.5 Ceph health ----------
{
  let b = '';
  [[C.app, 'HEALTH_OK', 'All good.', 'Nothing to do.'],
   [C.ct, 'HEALTH_WARN', 'Needs attention: an OSD down,', 'recovering, or nearly full. VMs keep running.'],
   [C.bad, 'HEALTH_ERR', 'Serious: data may be unreachable', 'and VM disks can freeze. Act now.']].forEach(([c, t, a, d], i) => {
    b += box(20 + i * 280, 20, 260, 110, c, [t, a, d], { size: 16, sub: 12 });
  });
  svg('35-ceph-health', 860, 150, b);
}

// ---------- 3.6 node networking ----------
{
  let b = '';
  b += box(20, 10, 820, 300, C.frame, [], { dash: true });
  b += text(38, 34, 'Proxmox node', { bold: true, anchor: 'start', fill: MUTED });
  [['VM 101', 'VLAN tag 10'], ['VM 102', 'VLAN tag 20'], ['VM 103', 'VLAN tag 10']].forEach(([n, t], i) => {
    b += box(150 + i * 200, 45, 160, 50, C.vm, [n, t], { size: 13, sub: 12 });
    b += arrow(230 + i * 200, 95, 230 + i * 200, 128);
  });
  b += box(110, 130, 640, 50, C.hv, ['vmbr0: Linux bridge (VLAN-aware)', 'a virtual switch: VMs plug in here'], { sub: 12 });
  b += arrow(430, 180, 430, 205);
  b += box(230, 207, 400, 42, C.os, ['bond0: two ports bonded for redundancy'], { size: 13 });
  b += arrow(330, 249, 330, 262) + arrow(530, 249, 530, 262);
  b += box(260, 264, 140, 34, C.hw, ['eno1 (port)'], { size: 12, plain: true });
  b += box(460, 264, 140, 34, C.hw, ['eno2 (port)'], { size: 12, plain: true });
  b += arrow(430, 310, 430, 338);
  b += box(230, 340, 400, 42, C.white, ['Physical switch: trunk carrying VLANs 10 and 20'], { size: 13 });
  svg('36-network', 860, 395, b);
}

// ---------- 3.7 firewall ----------
{
  let b = '';
  b += text(20, 30, 'Traffic to a node (web UI, SSH)', { bold: true, anchor: 'start' });
  b += box(20, 45, 150, 50, C.white, ['Network'], { size: 13 });
  b += arrow(170, 70, 228, 70);
  b += box(232, 45, 180, 50, C.pve, ['Datacenter rules', 'apply to every node'], { size: 13, sub: 11 });
  b += arrow(412, 70, 468, 70);
  b += box(472, 45, 160, 50, C.pve, ['Node rules', 'this node only'], { size: 13, sub: 11 });
  b += arrow(632, 70, 688, 70);
  b += box(692, 45, 150, 50, C.hw, ['Node', 'ports 8006, 22'], { size: 13, sub: 11 });

  b += text(20, 140, 'Traffic to a VM or container', { bold: true, anchor: 'start' });
  b += box(20, 155, 150, 50, C.white, ['Network'], { size: 13 });
  b += arrow(170, 180, 228, 180);
  b += box(232, 155, 400, 50, C.vm, ['VM / CT rules (can include security groups)', 'only if the NIC has firewall=1'], { size: 13, sub: 11 });
  b += arrow(632, 180, 688, 180);
  b += box(692, 155, 150, 50, C.vm, ['VM'], { size: 13 });

  b += box(20, 235, 822, 50, C.ct, ['Master switch: Datacenter → Firewall → Options → Enable', 'when it is off, no rules apply anywhere · default policy: block incoming, allow outgoing'], { size: 13, sub: 12 });
  svg('37-firewall', 860, 300, b);
}

// ---------- 3.8 permissions ----------
{
  let b = '';
  b += box(20, 20, 180, 62, C.app, ['Who', 'user, group or API token'], { sub: 11 });
  b += text(222, 58, '+', { bold: true, size: 24 });
  b += box(245, 20, 180, 62, C.hv, ['Role', 'a set of privileges'], { sub: 11 });
  b += text(447, 58, '+', { bold: true, size: 24 });
  b += box(470, 20, 180, 62, C.os, ['Path', 'where it applies'], { sub: 11 });
  b += text(672, 58, '=', { bold: true, size: 24 });
  b += box(695, 20, 145, 62, C.pve, ['Permission', '(an ACL entry)'], { sub: 11 });
  b += box(390, 120, 80, 36, C.white, ['/'], { size: 14 });
  const kids = [['/nodes/node1', 40], ['/storage/ceph-pool', 240], ['/pool/customers', 440], ['/sdn/zones/…', 640]];
  kids.forEach(([t, x]) => { b += arrow(430, 156, x + 90, 196); b += box(x, 198, 180, 36, C.white, [t], { size: 13, plain: true }); });
  b += arrow(530, 234, 480, 268) + arrow(530, 234, 600, 268);
  b += box(420, 270, 110, 34, C.vm, ['VM 101'], { size: 12, plain: true });
  b += box(545, 270, 110, 34, C.vm, ['VM 102'], { size: 12, plain: true });
  b += lbl(430, 335, 'Propagate = the permission also applies to everything below its path', { size: 13 });
  svg('38-permissions', 860, 350, b);
}

// ---------- 3.9 snapshot vs backup ----------
{
  let b = '';
  b += text(210, 30, 'Snapshot', { bold: true, size: 17 });
  b += box(30, 45, 360, 150, C.os, []);
  b += text(210, 68, 'Same storage as the VM disk', { size: 12, fill: MUTED });
  ['snap1', 'snap2', 'now'].forEach((t, i) => {
    b += box(55 + i * 115, 95, 90, 40, i === 2 ? C.vm : C.white, [t], { size: 13, plain: i !== 2 });
    if (i < 2) b += arrow(145 + i * 115, 115, 168 + i * 115, 115);
  });
  b += text(210, 170, 'roll back in seconds', { size: 12, fill: MUTED });
  b += text(210, 222, 'Quick undo before a risky change.', { size: 13 });
  b += text(210, 242, 'Lost if the storage is lost. Not a backup.', { size: 13, bold: true, fill: C.bad.s });

  b += text(645, 30, 'Backup', { bold: true, size: 17 });
  b += box(460, 70, 150, 80, C.vm, ['VM disk', 'on Ceph'], { sub: 12 });
  b += arrow(610, 110, 678, 110) + lbl(644, 100, 'copy');
  b += box(682, 55, 160, 110, C.pve, ['Proxmox', 'Backup Server', 'separate hardware'], { size: 14, sub: 12 });
  b += text(645, 222, 'A separate copy, kept for days or months.', { size: 13 });
  b += text(645, 242, 'Survives losing the VM, the disk or the cluster.', { size: 13, bold: true, fill: C.app.s });
  svg('39-snapshot-vs-backup', 860, 262, b);
}

// ---------- 3.10 live migration ----------
{
  let b = '';
  b += box(30, 20, 220, 110, C.white, []);
  b += text(140, 44, 'Node 1', { bold: true });
  b += box(60, 60, 160, 50, C.vm, ['VM 101', 'running'], { sub: 11 });
  b += box(610, 20, 220, 110, C.white, []);
  b += text(720, 44, 'Node 2', { bold: true });
  b += box(640, 60, 160, 50, C.vm, ['VM 101', 'running'], { sub: 11, dash: true });
  [['1. Copy memory while the VM keeps running', 50], ['2. Pause for a moment and copy the last changes', 80], ['3. Resume on Node 2', 110]].forEach(([t, y], i) => {
    b += text(430, y, t, { size: 13, bold: i === 1 });
  });
  b += arrow(255, 120, 605, 120);
  b += box(30, 170, 800, 50, C.os, ['Shared storage (Ceph): the disk stays where it is, only memory moves'], { size: 13 });
  b += arrow(140, 130, 140, 168, { dash: true }) + arrow(720, 130, 720, 168, { dash: true });
  b += text(430, 248, 'On local storage, the disk has to be copied too, which is much slower.', { size: 13, fill: MUTED, italic: true });
  svg('310-live-migration', 860, 265, b);
}

// ---------- 3.10 HA failover ----------
{
  let b = '';
  const steps = [[C.bad, '1. Node 2 fails', 'power, hardware or network'], [C.ct, '2. Node 2 fences itself', 'its watchdog forces a reboot'], [C.hv, '3. The cluster waits', 'until fencing is certain'], [C.app, '4. HA restarts the VMs', 'on Node 1 and Node 3']];
  steps.forEach(([c, t, s], i) => {
    const x = 20 + i * 210;
    b += box(x, 25, 190, 80, c, [t, s], { size: 14, sub: 12 });
    if (i < 3) b += arrow(x + 190, 65, x + 208, 65);
  });
  b += text(430, 140, 'The VMs are restarted, not live-moved: expect a few minutes of downtime.', { size: 13, bold: true });
  b += text(430, 162, 'Needs: quorum on the surviving nodes, shared storage, and the VMs added as HA resources.', { size: 13, fill: MUTED });
  svg('310-ha-failover', 860, 180, b);
}

// ---------- 3.11 monitoring ----------
{
  let b = '';
  b += text(120, 26, 'Proxmox records…', { bold: true });
  [['Task log', 'every action and its result'], ['System log (journal)', 'service messages per node'], ['Usage graphs (RRD)', 'CPU, RAM, disk, network'], ['Ceph health', 'storage status']].forEach(([t, s], i) => {
    b += box(20, 40 + i * 62, 200, 52, C.pve, [t, s], { size: 13, sub: 11 });
  });
  b += arrow(222, 150, 318, 150);
  b += box(322, 110, 200, 80, C.white, ['Proxmox VE', 'shows it in the web UI', 'and through the API'], { sub: 11 });
  b += text(740, 26, '…and can send it on', { bold: true });
  b += arrow(522, 130, 628, 72) + arrow(522, 170, 628, 228);
  b += box(632, 40, 210, 70, C.os, ['Metric server', 'InfluxDB or Graphite,', 'then dashboards (e.g. Grafana)'], { size: 13, sub: 11 });
  b += box(632, 190, 210, 70, C.ct, ['Notifications', 'email, Gotify or webhook', 'e.g. backup failed'], { size: 13, sub: 11 });
  svg('311-monitoring', 860, 295, b);
}

// ======================= 4. Technical Reference =======================

// ---------- 4.1 anatomy of an API path ----------
{
  let b = '';
  const parts = [['https://node1:8006', C.hw, 'any node'], ['/api2/json', C.white, 'API + format'], ['/nodes/node1', C.pve, 'node that owns the VM'], ['/qemu/101', C.vm, 'VM (or /lxc/ for CT)'], ['/status/start', C.app, 'the action']];
  const widths = [170, 120, 150, 120, 140];
  let x = 20;
  parts.forEach(([t, c, s], i) => {
    const w = widths[i];
    b += box(x, 30, w, 44, c, [t], { size: 13, rx: 4 });
    b += `<line x1="${x + 6}" y1="88" x2="${x + w - 6}" y2="88" stroke="${c.s}" stroke-width="3"/>`;
    b += text(x + w / 2, 108, s, { size: 12, fill: MUTED });
    x += w + 8;
  });
  b += box(20, 135, 400, 64, C.white, ['POST = do it', 'returns a task ID (UPID), because starting is slow'], { size: 14, sub: 12 });
  b += box(440, 135, 400, 64, C.white, ['GET …/status/current = read it', 'returns the VM status straight away'], { size: 14, sub: 12 });
  svg('41-api-path', 860, 215, b);
}

// ---------- 4.2 task polling loop ----------
{
  let b = '';
  b += box(20, 60, 170, 70, C.app, ['1. Call the API', 'e.g. POST …/clone'], { sub: 12 });
  b += arrow(190, 95, 238, 95) + lbl(214, 85, 'UPID');
  b += box(242, 60, 190, 70, C.white, ['2. GET …/tasks/{upid}', '/status'], { sub: 12 });
  b += arrow(432, 95, 488, 95);
  b += box(492, 55, 150, 80, C.hv, ['status?'], { size: 15 });
  b += arrow(567, 55, 567, 25, {}) + `<path d="M567,25 L337,25 L337,58" fill="none" stroke="${MUTED}" stroke-width="1.8" marker-end="url(#ah)"/>`;
  b += lbl(452, 18, 'running: wait 1–2 s, then ask again');
  b += box(700, 30, 145, 56, C.app, ['exitstatus = OK', 'success'], { size: 13, sub: 11 });
  b += box(700, 108, 145, 60, C.bad, ['anything else', 'failed: read …/log'], { size: 13, sub: 11 });
  b += arrow(642, 80, 697, 58) + lbl(662, 52, 'stopped');
  b += arrow(642, 112, 697, 138);
  b += text(430, 200, 'A reply to the first call only means "the task started". Only exitstatus tells you the result.', { size: 13, bold: true });
  b += text(430, 222, 'Always set an overall timeout, and never resend the original action just because polling failed.', { size: 13, fill: MUTED });
  svg('42-task-polling', 860, 240, b);
}

// ---------- 4.4 /etc/pve tree ----------
{
  let b = '';
  const rows = [
    [0, '/etc/pve/', 'shared across the cluster (pmxcfs)', C.hv],
    [1, 'datacenter.cfg', 'cluster-wide options', C.white],
    [1, 'storage.cfg', 'all storage definitions', C.white],
    [1, 'user.cfg', 'users, groups, roles, ACLs', C.white],
    [1, 'corosync.conf', 'cluster membership', C.white],
    [1, 'jobs.cfg', 'backup jobs', C.white],
    [1, 'ha/', 'HA resources, rules (PVE 9) or groups (PVE 8)', C.white],
    [1, 'sdn/', 'zones, vnets, subnets, fabrics…', C.white],
    [1, 'firewall/', 'cluster.fw, <vmid>.fw', C.white],
    [1, 'priv/', 'secrets: keys and token hashes (never share)', C.bad],
    [1, 'nodes/<node>/', 'one folder per node', C.pve],
    [2, 'qemu-server/<vmid>.conf', 'VM settings', C.vm],
    [2, 'lxc/<vmid>.conf', 'container settings', C.ct],
    [2, 'host.fw', 'node firewall rules', C.white],
  ];
  rows.forEach(([d, n, s, c], i) => {
    const y = 18 + i * 32, x = 30 + d * 40;
    if (d > 0) b += `<line x1="${x - 22}" y1="${y + 13}" x2="${x}" y2="${y + 13}" stroke="#9CA3AF" stroke-width="1.5"/>`;
    b += box(x, y, 250 - d * 20, 26, c, [n], { size: 12, rx: 4 });
    b += text(320 + 10, y + 18, s, { size: 12, anchor: 'start', fill: MUTED });
  });
  const mid = i => 18 + i * 32 + 13;
  b += `<line x1="48" y1="44" x2="48" y2="${mid(10)}" stroke="#9CA3AF" stroke-width="1.5"/>`;
  b += `<line x1="88" y1="${18 + 10 * 32 + 26}" x2="88" y2="${mid(13)}" stroke="#9CA3AF" stroke-width="1.5"/>`;
  b += box(600, 360, 240, 76, C.ct, ['Moving a VM to another node', '= moving its .conf file to that', 'node\'s folder. Proxmox does this.'], { size: 13, sub: 12 });
  svg('44-etc-pve', 860, 470, b);
}

// ---------- 4.5 VMID race ----------
{
  let b = '';
  const L = [[130, 'Request A', C.app], [430, 'Proxmox', C.pve], [730, 'Request B', C.app]];
  L.forEach(([x, t, c]) => {
    b += box(x - 85, 15, 170, 44, c, [t]);
    b += `<line x1="${x}" y1="59" x2="${x}" y2="330" stroke="#D1D5DB" stroke-width="2" stroke-dasharray="5 5"/>`;
  });
  const m = (y, x1, x2, s, o = {}) => arrow(x1, y, x2, y, o) + lbl((x1 + x2) / 2, y - 8, s, { size: 13, fill: o.fill || INK });
  b += m(95, 130, 428, 'GET /cluster/nextid');
  b += m(125, 730, 432, 'GET /cluster/nextid');
  b += m(160, 430, 132, '"105"', { dash: true });
  b += m(190, 430, 728, '"105"', { dash: true });
  b += m(230, 130, 428, 'create VM 105');
  b += m(262, 730, 432, 'create VM 105');
  b += box(340, 280, 180, 40, C.app, ['A: OK'], { size: 13 });
  b += box(540, 280, 260, 40, C.bad, ['B: "VM 105 already exists"'], { size: 13 });
  b += text(430, 358, 'nextid only suggests a free number. It doesn\'t reserve it.', { size: 13, bold: true });
  svg('45-vmid-race', 860, 375, b);
}

// ---------- 4.7 rolling upgrade ----------
{
  let b = '';
  const steps = ['Latest 8.4', 'Ceph → Squid', 'pve8to9 --full', 'Migrate VMs off', 'Upgrade + reboot', 'Back in service'];
  b += text(20, 26, 'One node at a time:', { bold: true, anchor: 'start' });
  steps.forEach((s, i) => {
    const x = 20 + i * 140;
    b += box(x, 40, 124, 50, i === 4 ? C.pve : C.white, [s], { size: 13, plain: i !== 4 });
    if (i < steps.length - 1) b += arrow(x + 124, 65, x + 138, 65);
  });
  b += lbl(330, 108, 'Ceph must be on Squid on every node before any node moves to PVE 9');
  [['Node 1', ['9', '9', '9']], ['Node 2', ['8', '9', '9']], ['Node 3', ['8', '8', '9']]].forEach(([n, vs], r) => {
    const y = 140 + r * 46;
    b += text(80, y + 25, n, { bold: true, anchor: 'end' });
    vs.forEach((v, c) => { b += box(100 + c * 190, y, 170, 36, v === '9' ? C.app : C.hw, [`PVE ${v}`], { size: 13, plain: v !== '9' }); });
  });
  ['Step 1', 'Step 2', 'Step 3: done'].forEach((t, c) => { b += text(185 + c * 190, 300, t, { size: 12, fill: MUTED }); });
  b += box(690, 140, 150, 128, C.ct, ['When all nodes', 'run 9:', 'HA groups become', 'HA rules', 'automatically'], { size: 13, sub: 12 });
  b += text(400, 330, 'Mixed clusters work during the upgrade. Migrating 8 → 9 always works, but 9 → 8 is not supported.', { size: 13, fill: MUTED });
  svg('47-rolling-upgrade', 860, 345, b);
}

// ---------- 4.8 troubleshooting flow ----------
{
  let b = '';
  b += box(330, 10, 200, 44, C.bad, ['API call failed'], { size: 14 });
  const br = [
    [20, '401', 'Bad or expired login', 'token typo, ticket > 2 h old'],
    [230, '403', 'Missing privilege', 'error names path + privilege'],
    [440, '500 / 595 / 596', 'Proxmox or node problem', 'quorum, lock, node unreachable'],
    [650, 'Task error', 'Started, then failed', 'read the task log'],
  ];
  br.forEach(([x, code, t, s]) => {
    b += arrow(430, 54, x + 97, 92);
    b += box(x, 95, 195, 34, C.white, [code], { size: 14 });
    b += box(x, 140, 195, 64, C.os, [t, s], { size: 13, sub: 11 });
  });
  b += text(430, 232, 'Then check: task log → node system log (pvedaemon, pveproxy) → cluster and Ceph health', { size: 13, bold: true });
  svg('48-troubleshooting', 860, 250, b);
}

// ======================= Sysadmin guide (sa-*) =======================

// ---------- daily health check ----------
{
  let b = '';
  const checks = [['Cluster', 'quorate, all nodes up'], ['Ceph', 'HEALTH_OK'], ['Storage', 'below 80%'], ['Backups', 'last night OK'], ['HA', 'all started'], ['Tasks', 'no new errors']];
  checks.forEach(([t, s], i) => {
    const x = 20 + i * 140;
    b += box(x, 30, 124, 64, C.white, [t, s], { size: 14, sub: 11 });
    if (i < checks.length - 1) b += arrow(x + 124, 62, x + 138, 62);
  });
  checks.forEach((_, i) => { b += `<line x1="${82 + i * 140}" y1="94" x2="${82 + i * 140}" y2="112" stroke="${MUTED}" stroke-width="1.8"/>`; });
  b += `<line x1="82" y1="112" x2="782" y2="112" stroke="${MUTED}" stroke-width="1.8"/>`;
  b += arrow(230, 112, 230, 140) + arrow(630, 112, 630, 140);
  b += box(90, 143, 280, 52, C.app, ['All green', 'done: about 5 minutes'], { sub: 12 });
  b += box(490, 143, 280, 52, C.bad, ['Anything red or amber', 'open the matching runbook'], { sub: 12 });
  svg('sa-health-check', 860, 210, b);
}

// ---------- node maintenance ----------
{
  let b = '';
  const steps = [[C.hv, '1. Maintenance mode', 'HA VMs move away'], [C.os, '2. Ceph noout', 'no re-copying'], [C.vm, '3. Migrate the rest', 'non-HA VMs'], [C.pve, '4. Patch + reboot', 'apt dist-upgrade'], [C.white, '5. Verify', 'node, Ceph, VMs'], [C.app, '6. Undo 2 and 1', 'then next node']];
  steps.forEach(([c, t, s], i) => {
    const x = 20 + (i % 3) * 280, y = 20 + Math.floor(i / 3) * 100;
    b += box(x, y, 250, 64, c, [t, s], { size: 14, sub: 12 });
    if (i % 3 < 2) b += arrow(x + 250, y + 32, x + 278, y + 32);
  });
  b += `<path d="M770,84 L770,102 L145,102 L145,118" fill="none" stroke="${MUTED}" stroke-width="1.8" marker-end="url(#ah)"/>`;
  b += text(430, 222, 'One node at a time. Wait for HEALTH_OK before starting the next one.', { size: 13, bold: true });
  svg('sa-node-maintenance', 860, 240, b);
}

// ---------- OSD replacement ----------
{
  let b = '';
  const steps = [['1. Find it', 'ceph osd tree'], ['2. Out', 'ceph osd out <id>'], ['3. Wait', 'until rebalanced'], ['4. Stop + destroy', 'pveceph osd destroy'], ['5. Swap the disk', 'same type and size'], ['6. Create', 'pveceph osd create']];
  steps.forEach(([t, s], i) => {
    const x = 20 + i * 140;
    b += box(x, 30, 124, 70, i === 4 ? C.hw : C.os, [t, s], { size: 13, sub: 11 });
    if (i < steps.length - 1) b += arrow(x + 124, 65, x + 138, 65);
  });
  b += text(430, 134, 'Ceph rebalances on its own after step 6, until health returns to HEALTH_OK.', { size: 13, fill: MUTED });
  svg('sa-osd-replace', 860, 150, b);
}

// ---------- incident triage ----------
{
  let b = '';
  b += box(300, 10, 260, 46, C.bad, ['Something is wrong']);
  b += text(430, 82, 'How much is affected?', { bold: true, size: 14 });
  const br = [
    [20, 'One VM', C.vm, ['Task log of the VM', 'Console: is the OS up?', 'NIC, firewall, disk']],
    [300, 'One node', C.pve, ['Node reachable? (IPMI)', 'pveproxy / pvestatd', 'Quorum, HA fencing']],
    [580, 'Many / all', C.hv, ['pvecm status (quorum)', 'ceph -s (storage)', 'Network between nodes']],
  ];
  br.forEach(([x, t, c, items]) => {
    b += arrow(430, 90, x + 130, 118);
    b += box(x, 120, 260, 40, c, [t], { size: 15 });
    items.forEach((it, i) => { b += box(x + 15, 170 + i * 36, 230, 30, C.white, [it], { size: 12, plain: true, rx: 5 }); });
  });
  b += text(430, 302, 'Customer-facing outage, or data at risk? Escalate straight away while you investigate.', { size: 13, bold: true, fill: C.bad.s });
  svg('sa-triage', 860, 320, b);
}

// ---------- services map (infra 4.4 / 1.3) ----------
{
  let b = '';
  b += box(20, 15, 820, 40, C.white, ['Users and apps: browser or API, HTTPS port 8006'], { size: 13 });
  b += arrow(430, 55, 430, 78);
  b += box(20, 80, 260, 60, C.pve, ['pveproxy', 'web UI + API, forwards to other nodes'], { size: 14, sub: 11 });
  b += box(300, 80, 260, 60, C.pve, ['pvedaemon', 'carries out privileged actions'], { size: 14, sub: 11 });
  b += box(580, 80, 260, 60, C.pve, ['pvestatd', 'status and usage graphs'], { size: 14, sub: 11 });
  b += arrow(280, 110, 298, 110);
  b += box(20, 160, 260, 60, C.hv, ['pve-cluster (pmxcfs)', '/etc/pve shared config'], { size: 14, sub: 11 });
  b += box(300, 160, 260, 60, C.hv, ['corosync', 'cluster membership + quorum'], { size: 14, sub: 11 });
  b += box(580, 160, 260, 60, C.bad, ['pve-ha-crm / pve-ha-lrm', '+ watchdog-mux: never kill'], { size: 14, sub: 11 });
  b += arrow(150, 140, 150, 158) + arrow(430, 140, 150, 158, { dash: true });
  b += arrow(280, 190, 298, 190) + arrow(580, 190, 562, 190);
  b += box(20, 240, 195, 50, C.white, ['pve-firewall', 'firewall rules'], { size: 13, sub: 11 });
  b += box(228, 240, 195, 50, C.white, ['pvescheduler', 'backup + replication jobs'], { size: 13, sub: 11 });
  b += box(436, 240, 195, 50, C.white, ['spiceproxy', 'SPICE console, port 3128'], { size: 13, sub: 11 });
  b += box(644, 240, 196, 50, C.os, ['ceph-mon / mgr / osd', 'Ceph, per node'], { size: 13, sub: 11 });
  b += text(430, 318, 'Red = restarting or killing it can reboot the node. Check 4.4 before restarting anything.', { size: 13, bold: true, fill: C.bad.s });
  svg('sa-services', 860, 335, b);
}

// ---------- CLI tool map (infra 2.3) ----------
{
  let b = '';
  b += box(330, 15, 200, 46, C.hw, ['Node shell (root)'], { size: 14 });
  const tools = [
    [20, 'qm', 'VMs', C.vm], [160, 'pct', 'containers', C.ct], [300, 'pvesm', 'storage', C.os],
    [440, 'pvecm', 'cluster, quorum', C.hv], [580, 'ha-manager', 'HA', C.hv], [720, 'ceph / pveceph', 'Ceph', C.os],
  ];
  tools.forEach(([x, t, s, c]) => {
    b += arrow(430, 61, x + 60, 96);
    b += box(x, 100, 120, 56, c, [t, s], { size: 14, sub: 11 });
  });
  b += box(20, 180, 400, 56, C.pve, ['pvesh', 'any API path from the shell, e.g. pvesh get /cluster/resources'], { size: 14, sub: 11 });
  b += box(440, 180, 400, 56, C.white, ['pveum · pvenode · vzdump · pveversion', 'users · node tasks + certs · backups · versions'], { size: 13, sub: 11 });
  b += text(430, 262, 'Every tool has built-in help: qm help, pct help start, man qm', { size: 13, fill: MUTED });
  svg('sa-cli-tools', 860, 280, b);
}
