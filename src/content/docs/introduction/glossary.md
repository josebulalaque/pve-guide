---
title: "1.4 Glossary"
sidebar:
  order: 4
---

:::note
A–Z of the terms used in this guide. Use Ctrl+F / Cmd+F, or the search box, to find one.
:::

| Term | Meaning |
|---|---|
| **ACME** | Automatic certificates (e.g. Let's Encrypt), renewed by Proxmox |
| **API token** | A long-lived credential an app uses instead of a password. It can have fewer rights than its user. |
| **Ballooning** | The host taking back unused memory from a VM |
| **Bond** | Two or more network ports acting as one, for redundancy |
| **Bridge** | A virtual network switch on a node (e.g. `vmbr0`) |
| **Ceph** | Shared storage built from all the nodes' disks. It keeps several copies of data. |
| **Clone** | A copy of a VM. A *full* clone is independent. A *linked* clone is faster to create but depends on its template. |
| **Cloud-init** | Sets up a new VM on first boot (hostname, users, SSH keys, network) |
| **Cluster** | Nodes joined and managed as one |
| **Container (CT / LXC)** | A lightweight Linux system that shares the host's kernel |
| **Corosync** | Keeps cluster nodes in touch and tracks quorum |
| **Datacenter** | The web UI's name for the whole cluster |
| **Datastore** | Where a PBS server keeps backups |
| **Fencing** | A node that lost quorum rebooting itself, so HA can safely restart its VMs elsewhere |
| **Guest** | A VM or container |
| **HA** | High Availability: restarts VMs on another node if their node fails |
| **Host** | The physical server (in Proxmox, a node) |
| **Hyper-converged** | VMs and storage running on the same servers |
| **Hypervisor** | Software that runs VMs and shares the hardware between them |
| **IPMI / iDRAC / iLO** | The server's out-of-band management console |
| **KVM** | The hypervisor built into the Linux kernel |
| **Live migration** | Moving a running VM to another node without downtime |
| **Lock** | A marker showing a task is working on a VM (backup, migrate, clone…) |
| **Maintenance mode** | A node state that moves HA VMs away before maintenance |
| **MON / MGR / OSD** | Ceph services: cluster map / monitoring / one per disk |
| **Node** | One physical server running Proxmox VE |
| **noout** | A Ceph flag that pauses re-copying data during planned maintenance |
| **noVNC** | The default in-browser console for a VM's screen |
| **Overcommit** | Handing out more virtual resources than physically exist |
| **PBS** | Proxmox Backup Server: stores deduplicated, incremental backups |
| **pmxcfs** | The shared cluster filesystem at `/etc/pve` |
| **Pool** | A group of VMs and storages, used to organise them and grant permissions. Not the same as a Ceph pool. |
| **Privilege / Role** | A privilege allows one action (e.g. `VM.PowerMgmt`). A role is a set of privileges (e.g. `PVEVMAdmin`). |
| **Prune / GC** | PBS clean-up: prune removes old backups, and garbage collection frees their space |
| **QDevice** | An external tie-breaker vote for small clusters |
| **QEMU** | Builds each VM's virtual hardware, working with KVM |
| **QEMU Guest Agent** | A helper inside a VM that reports its IP addresses and allows clean shutdowns |
| **Quorum** | More than half the nodes in contact. Without it, config is read-only. |
| **RBD** | How Ceph stores a VM disk |
| **Realm** | Where a login is checked: `pam`, `pve`, LDAP, AD or OpenID. Users are written `name@realm`. |
| **SDN** | Software-Defined Networking: cluster-wide virtual networks |
| **Snapshot** | A point-in-time state of a VM you can roll back to. It is not a backup. |
| **SPICE** | An alternative VM console that is smoother but needs `virt-viewer` installed |
| **Storage** | Anywhere Proxmox keeps disks, ISOs, templates or backups |
| **Task** | A background job (start, clone, backup…) with a UPID and a log |
| **Template** | A read-only master VM used for cloning |
| **Thin provisioning** | Disks that use space only as data is written |
| **Ticket** | A temporary login (valid for 2 hours). Writes made with it also need a CSRF token. |
| **UPID** | A task's ID, used to check its progress and result |
| **vCPU** | A virtual CPU core |
| **VirtIO** | Fast virtual devices. Built into Linux; Windows needs drivers. |
| **VM** | A virtual machine: a full virtual computer with its own OS |
| **VMID** | A VM's or container's number, unique cluster-wide (starts at 100) |
| **vzdump** | Proxmox's built-in backup tool |
| **Watchdog** | A timer that reboots a node that stops responding. It's how fencing works. |
| **Web UI** | The browser interface at `https://<node>:8006`, available on every node |
| **xterm.js** | The in-browser text terminal for containers, node shells and VM serial consoles |
| **Zone / VNet / Subnet** | SDN parts: the network type / a virtual network / an IP range |
