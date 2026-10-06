---
title: "4.3 Permission Matrix"
description: "which privilege each common API call needs, and on which path. Taken from the official PVE 9 API schema. For how permissions work, see 3.8 Users, Roles & Permissions."
sidebar:
  order: 3
  badge:
    text: Dev
    variant: note
---

:::note[In a nutshell]
which privilege each common API call needs, and on which path. Taken from the official PVE 9 API schema. For how permissions work, see [3.8 Users, Roles & Permissions](../../user-guide/users-roles-permissions/).
:::

`{vmid}`, `{storage}` and so on are the real IDs. "Any of" means one of the listed privileges is enough.

## VMs

| Action | Endpoint | Privilege | On path |
|---|---|---|---|
| Create | `POST /nodes/{node}/qemu` | `VM.Allocate`<br>+ `Datastore.AllocateSpace` for each disk<br>+ `SDN.Use` for each bridge/VLAN | `/vms/{vmid}` or `/pool/{pool}`<br>`/storage/{storage}`<br>`/sdn/zones/{zone}/{vnet}` |
| Clone | `POST …/clone` | `VM.Clone`<br>+ `VM.Allocate`<br>+ `Datastore.AllocateSpace`, `SDN.Use` | source `/vms/{vmid}`<br>`/vms/{newid}` or `/pool/{pool}`<br>storage, VNet |
| Read config / status | `GET …/config`, `…/status/current` | `VM.Audit` | `/vms/{vmid}` |
| Change config | `PUT\|POST …/config` | Any of `VM.Config.Disk`, `.CDROM`, `.CPU`, `.Memory`, `.Network`, `.HWType`, `.Options`, `.Cloudinit` (matching what you change) | `/vms/{vmid}` |
| Grow a disk | `PUT …/resize` | `VM.Config.Disk` | `/vms/{vmid}` |
| Move a disk | `POST …/move_disk` | `VM.Config.Disk` + `Datastore.AllocateSpace` | VM + target storage |
| Start / stop / reboot… | `POST …/status/*` | `VM.PowerMgmt` | `/vms/{vmid}` |
| Migrate | `POST …/migrate` | `VM.Migrate` | `/vms/{vmid}` |
| Snapshot | `POST …/snapshot` | `VM.Snapshot` | `/vms/{vmid}` |
| Roll back | `POST …/snapshot/{name}/rollback` | Any of `VM.Snapshot`, `VM.Snapshot.Rollback` | `/vms/{vmid}` |
| Console | `POST …/vncproxy`, `…/termproxy` | `VM.Console` | `/vms/{vmid}` |
| Guest agent IPs | `GET …/agent/network-get-interfaces` | PVE 9: any of `VM.GuestAgent.Audit`, `VM.GuestAgent.Unrestricted`<br>PVE 8: `VM.Monitor` | `/vms/{vmid}` |
| Delete | `DELETE /nodes/{node}/qemu/{vmid}` | `VM.Allocate` | `/vms/{vmid}` |

## Containers

The same as VMs (`/nodes/{node}/lxc/…`), plus: creating a **privileged** container needs `Sys.Modify` on `/`.

## Backups and storage

| Action | Endpoint | Privilege | On path |
|---|---|---|---|
| Back up | `POST /nodes/{node}/vzdump` | `VM.Backup` + `Datastore.AllocateSpace` | each VM + backup storage |
| Back up with pruning | (same, with `prune-backups`) | + `Datastore.Allocate` | backup storage |
| Restore over an existing VM | `POST /nodes/{node}/qemu` (`archive=`) | `VM.Backup` (VM must exist) | `/vms/{vmid}` |
| List storage content | `GET …/storage/{storage}/content` | Any of `Datastore.Audit`, `Datastore.AllocateSpace` | `/storage/{storage}` |

## Cluster, HA, network, firewall

| Action | Endpoint | Privilege | On path |
|---|---|---|---|
| List everything | `GET /cluster/resources` | Any user. Results are filtered to what you can see. | n/a |
| Suggest a VMID | `GET /cluster/nextid` | Any user | n/a |
| Add an HA resource / rule | `POST /cluster/ha/resources`, `…/rules` | `Sys.Console` | `/` |
| Create a VNet | `POST /cluster/sdn/vnets` | `SDN.Allocate` | `/sdn/zones/{zone}` |
| Apply SDN | `PUT /cluster/sdn` | `SDN.Allocate` | `/sdn` |
| Read VM firewall rules | `GET …/qemu/{vmid}/firewall/rules` | `VM.Audit` | `/vms/{vmid}` |
| Change VM firewall rules | `POST …/qemu/{vmid}/firewall/rules` | `VM.Config.Network` | `/vms/{vmid}` |
| Ceph status | `GET /cluster/ceph/status` | Any of `Sys.Audit`, `Datastore.Audit` | `/` |
| Node system log | `GET /nodes/{node}/journal` | `Sys.Syslog` | `/nodes/{node}` |

## Tasks and access

| Action | Endpoint | Privilege |
|---|---|---|
| Check your own task | `GET …/tasks/{upid}/status` | None (you own it) |
| Check someone else's task | (same) | `Sys.Audit` on `/nodes/{node}` |
| Grant permissions | `PUT /access/acl` | `Permissions.Modify` on the path being granted |
| Create your own API token | `POST /access/users/{userid}/token/{tokenid}` | None for yourself. `User.Modify` for others. |
| See your own permissions | `GET /access/permissions` | None. Someone else's needs `Sys.Audit` on `/access`. |

:::note
**Version changes:** PVE 9 removed `VM.Monitor` and added `VM.GuestAgent.*` and `VM.Replicate`. PVE 9.2 also requires `Sys.Console` to add a VM to HA while creating or restoring it, and `VM.Config.Cloudinit` to read a VM's cloud-init password.
:::
