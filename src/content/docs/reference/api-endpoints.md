---
title: "4.1 API Endpoint Reference"
description: "the most-used Proxmox API endpoints in one place. Every path starts with https://<node>:8006/api2/json. For every parameter of every endpoint, see the official API viewer(https://pve.proxmox.com/pve-docs/api-viewer/)."
sidebar:
  order: 1
  badge:
    text: Dev
    variant: note
---

:::note[In a nutshell]
the most-used Proxmox API endpoints in one place. Every path starts with `https://<node>:8006/api2/json`. For every parameter of every endpoint, see the official [API viewer](https://pve.proxmox.com/pve-docs/api-viewer/).
:::

## Reading a path

![The parts of a Proxmox API URL](../../../assets/diagrams/41-api-path.svg)

**Async?** "Yes" means the call returns a UPID. Wait for it as shown in [4.2 Async Tasks & UPIDs](../tasks-upids/). Below, `{vm}` = `/nodes/{node}/qemu/{vmid}`. Use `lxc` instead of `qemu` for containers.

## Cluster and nodes

| Method | Path | Does | Async? |
|---|---|---|---|
| GET | `/version` | Proxmox version (a good connection test) | No |
| GET | `/cluster/status` | Nodes, quorum | No |
| GET | `/cluster/resources` | Status and usage of every VM, node and storage (filter with `?type=vm`) | No |
| GET | `/cluster/nextid` | Suggests a free VMID (doesn't reserve it) | No |
| GET | `/nodes` | List nodes, with CPU and memory | No |

## VMs

| Method | Path | Does | Async? |
|---|---|---|---|
| POST | `/nodes/{node}/qemu` | Create a VM, or restore one (`archive=`) | Yes |
| POST | `{vm}/clone` | Clone (`newid`, `name`, `full`, `target`, `storage`, `pool`) | Yes |
| GET | `{vm}/config` | Read the settings | No |
| PUT / POST | `{vm}/config` | Change settings. **PUT waits for the change; POST returns a UPID.** | PUT no / POST yes |
| GET | `{vm}/pending` | Changes waiting for a reboot | No |
| PUT | `{vm}/resize` | Grow a disk (`disk`, `size=+10G`) | Yes (PVE 8+) |
| POST | `{vm}/status/start\|shutdown\|stop\|reboot\|reset\|suspend\|resume` | Power actions | Yes |
| GET | `{vm}/status/current` | Running state, uptime, usage | No |
| POST | `{vm}/migrate` | Move to another node (`target`, `online=1`) | Yes |
| POST | `{vm}/move_disk` | Move a disk to another storage | Yes |
| POST / GET / DELETE | `{vm}/snapshot[/{name}]` | Create, list, delete snapshots (`…/rollback` to roll back) | Yes (except GET) |
| GET | `{vm}/agent/network-get-interfaces` | IP addresses from the guest agent | No |
| POST | `{vm}/vncproxy`, `{vm}/termproxy` | Open a console session (see the 9.2 change in [4.9 Upgrading from PVE 8 to 9](../upgrading-8-to-9/)) | No |
| DELETE | `{vm}?purge=1&destroy-unreferenced-disks=1` | Delete the VM | Yes |

## Tasks

| Method | Path | Does |
|---|---|---|
| GET | `/nodes/{node}/tasks/{upid}/status` | Running or stopped, plus `exitstatus` |
| GET | `/nodes/{node}/tasks/{upid}/log` | The task's log lines |
| DELETE | `/nodes/{node}/tasks/{upid}` | Stop a running task |
| GET | `/cluster/tasks` | Recent tasks across the cluster |

## Storage, network, backup, HA, access

| Method | Path | Does |
|---|---|---|
| GET | `/nodes/{node}/storage` | Storages and free space |
| GET | `/nodes/{node}/storage/{storage}/content` | Disks, ISOs, backups on a storage |
| GET / POST | `/cluster/sdn/vnets` | List or create VNets |
| PUT | `/cluster/sdn` | Apply pending SDN changes |
| POST | `/nodes/{node}/vzdump` | Back up now (async) |
| GET / POST | `/cluster/ha/resources` | List or add HA resources (`sid=vm:101`) |
| GET / POST | `/cluster/ha/rules` | HA affinity rules (PVE 9, replacing `/cluster/ha/groups`) |
| GET | `/access/permissions` | Effective permissions of the caller (or `userid=`) |
| POST | `/access/ticket` | Log in with a password, get a ticket |

## Response basics

- A success wraps its result in `{"data": …}`. For async calls, `data` is the UPID string.
- A parameter error returns `400` with an `errors` object naming each bad parameter.
- Booleans are `0` / `1`. Sizes in configs are strings like `32G`.
