---
title: "4.5 Services Reference"
description: "what each Proxmox service does, and whether it's safe to restart. Running VMs keep running when most of these restart, but not all are harmless."
sidebar:
  order: 5
  badge:
    text: Ops
    variant: success
---

:::note[In a nutshell]
what each Proxmox service does, and whether it's safe to restart. Running VMs keep running when most of these restart, but **not all** are harmless.
:::

![Proxmox services on a node and how they depend on each other](../../../assets/diagrams/sa-services.svg)

| Service | Does | Safe to restart? | Users notice |
|---|---|---|---|
| `pveproxy` | Web UI and API on 8006 | Yes | The web UI drops for a few seconds |
| `pvedaemon` | Carries out privileged actions | Yes | Actions submitted at that moment may fail; retry them |
| `pvestatd` | Status and usage graphs | Yes | Nothing. Fixes the grey question mark. |
| `spiceproxy` | SPICE console proxy (3128) | Yes | Open SPICE consoles disconnect |
| `pvescheduler` | Backup and replication schedules | Yes, when no job is due | Nothing |
| `pve-firewall` | Applies firewall rules | Yes | Rules are re-applied |
| `pve-cluster` | The shared `/etc/pve` (pmxcfs) | **Only when asked to** | `/etc/pve` disappears briefly, and actions fail |
| `corosync` | Cluster membership and quorum | **Ask first** | Can cost quorum and trigger HA fencing |
| `pve-ha-crm`, `pve-ha-lrm` | HA manager (cluster / node) | **Never kill** | Can cause an immediate node reboot |
| `watchdog-mux` | Feeds the hardware watchdog (fencing) | **Never kill** | Can cause an immediate node reboot |
| `ceph-osd@<id>` | One Ceph disk | One at a time | Brief recovery activity |
| `ceph-mon@<node>`, `ceph-mgr@<node>` | Ceph cluster map, monitoring | One at a time, with the others healthy | Nothing if the other monitors are up |

## Checking and restarting

```bash
systemctl status pveproxy pvedaemon pvestatd pve-cluster corosync
systemctl restart pveproxy
```

In the web UI: **Node → System** lists the services with Start, Stop and Restart buttons.
