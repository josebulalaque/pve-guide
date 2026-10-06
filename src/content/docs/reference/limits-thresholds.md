---
title: "4.8 Limits, Thresholds & Performance"
description: "Proxmox has few hard limits. Real-world limits come from the network, the storage and how hard the API is pushed. These are the numbers to keep in your head when deciding whether something is fine, risky or an emergency."
sidebar:
  order: 8
---

:::note[In a nutshell]
Proxmox has few hard limits. Real-world limits come from the network, the storage and how hard the API is pushed. These are the numbers to keep in your head when deciding whether something is fine, risky or an emergency.
:::

## Storage and Ceph

| Threshold | Value | Meaning |
|---|---|---|
| Comfortable storage usage | Below 80% | Leaves room for growth and for Ceph to recover |
| Ceph `nearfull` | 85% (default) | Warning: act now |
| Ceph `backfillfull` | 90% (default) | Ceph stops moving data onto that disk |
| Ceph `full` | 95% (default) | Writes blocked and VMs freeze |
| Ceph copies | size 3, min_size 2 (typical) | One copy can be lost safely. Below 2, I/O stops. |
| Usable Ceph space | ≈ raw ÷ 3 | With 3 copies |

## Cluster

| Item | Value |
|---|---|
| Quorum | More than half the votes: 2 of 3, 3 of 5, 4 of 7 |
| Nodes per cluster | No fixed limit. Clusters of 50+ nodes run in production on high-end hardware. |
| Corosync latency | Under 5 ms between all nodes (LAN performance) |
| Corosync links | Up to 8 per node. Use at least 2 for redundancy. |
| HA minimum | 3 nodes (or 2 plus a QDevice), and shared storage |
| HA recovery time | A few minutes (fencing, then restart) |

## VMs and the node

| Item | Value |
|---|---|
| VMID range | 100 – 999,999,999. `nextid` picks from 100 to 1,000,000 by default (changeable via `next-id` in `datacenter.cfg`). |
| Disks per VM | SCSI 0–30, VirtIO 0–15, SATA 0–5, IDE 0–3 |
| Disk resize | Grow only, never shrink |
| Free space on `/` for upgrades | At least 5 GB, ideally 10 GB+ |
| Login ticket / web session | 2 hours. The web UI renews it while you're active. |

## Network

- **Cluster traffic (corosync)** needs **latency under 5 ms** between all nodes, but little bandwidth. A dedicated 1 Gbit link is enough. Higher latency makes the cluster unstable.
- **Ceph** needs **bandwidth**: a dedicated 10/25 Gbit (or faster) network.
- **Migration** traffic can use its own network (`datacenter.cfg` → migration network) so it doesn't slow down everything else.

## API throughput (for custom apps)

- `pveproxy` and `pvedaemon` each run **3 worker processes** by default. On PVE 9, automation-heavy setups that see slow replies or timeouts can raise this with `MAX_WORKERS` in `/etc/default/pveproxy` (and `/etc/default/pvedaemon`).
- **Spread the load:** any node can answer. Don't send every request to one node.
- **Poll gently:** every 1–2 seconds per task is plenty.
- **Use `GET /cluster/resources`** instead of one call per VM when you need everything.

## Concurrency

| Situation | What happens |
|---|---|
| Two actions on the **same VM** | The second waits on the VM lock, then times out. Queue them in the custom app. |
| Many actions on **different VMs** | Runs in parallel, limited by API workers and storage speed |
| Many **clones from one template** | Fine with linked clones on Ceph. Full clones load the storage heavily. |
| Writes to **cluster config** | Serialised by a cluster-wide lock. Bursts of config changes queue up. |

## Storage performance tips

- Use VirtIO SCSI single with `iothread=1` and `discard=on` on disks.
- Linked clones are fast to create. Heavy writes inside them are no faster than on a full clone.
- Ceph slows down while **recovering**. Avoid big batch jobs while health isn't `HEALTH_OK`.
