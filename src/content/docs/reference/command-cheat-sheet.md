---
title: "4.4 Command Cheat Sheet"
description: "the commands you'll use most, by area. Run them as root on a node. qm and pct only see VMs on the node you're on."
sidebar:
  order: 4
  badge:
    text: Ops
    variant: success
---

:::note[In a nutshell]
the commands you'll use most, by area. Run them as root on a node. `qm` and `pct` only see VMs on the node you're on.
:::

<table><tbody>
<tr><th>Area</th><th>Command</th><th>Does</th></tr>
<tr><td rowspan="3"><strong>Cluster</strong></td><td><code>pvecm status</code></td><td>Quorum, votes, members</td></tr>
<tr><td><code>pvecm nodes</code></td><td>List the nodes</td></tr>
<tr><td><code>ha-manager status</code></td><td>HA state of every resource</td></tr>
<tr><td rowspan="5"><strong>VMs</strong></td><td><code>qm list</code></td><td>VMs on this node</td></tr>
<tr><td><code>qm status 101</code> / <code>qm config 101</code></td><td>State / settings</td></tr>
<tr><td><code>qm start|shutdown|stop|reboot 101</code></td><td>Power</td></tr>
<tr><td><code>qm unlock 101</code></td><td>Clear a stale lock</td></tr>
<tr><td><code>qm migrate 101 node2 --online</code></td><td>Live migrate</td></tr>
<tr><td rowspan="2"><strong>Containers</strong></td><td><code>pct list</code></td><td>Containers on this node</td></tr>
<tr><td><code>pct enter 200</code></td><td>Shell inside a container</td></tr>
<tr><td rowspan="2"><strong>Storage</strong></td><td><code>pvesm status</code></td><td>Every storage and its usage</td></tr>
<tr><td><code>pvesm list ceph-pool</code></td><td>What's on a storage</td></tr>
<tr><td rowspan="4"><strong>Ceph</strong></td><td><code>ceph -s</code> / <code>ceph health detail</code></td><td>Health</td></tr>
<tr><td><code>ceph osd tree</code></td><td>Disks per node, up or down</td></tr>
<tr><td><code>ceph df</code> / <code>ceph osd df tree</code></td><td>Space</td></tr>
<tr><td><code>ceph osd set|unset noout</code></td><td>Maintenance flag</td></tr>
<tr><td rowspan="2"><strong>Backups</strong></td><td><code>vzdump 101 --storage pbs</code></td><td>Back up now</td></tr>
<tr><td><code>qmrestore &lt;backup&gt; 101</code></td><td>Restore a VM</td></tr>
<tr><td rowspan="2"><strong>Users</strong></td><td><code>pveum user list</code></td><td>All users</td></tr>
<tr><td><code>pveum user tfa unlock jane@pve</code></td><td>Unlock 2FA</td></tr>
<tr><td rowspan="4"><strong>Node</strong></td><td><code>pveversion -v</code></td><td>Installed versions</td></tr>
<tr><td><code>pvenode task list --errors 1</code></td><td>Failed tasks on this node</td></tr>
<tr><td><code>pvenode cert info</code></td><td>Certificates and expiry</td></tr>
<tr><td><code>pvereport</code></td><td>Full system report for support</td></tr>
<tr><td rowspan="2"><strong>Network</strong></td><td><code>ip -br a</code> / <code>ifreload -a</code></td><td>Interfaces / apply config</td></tr>
<tr><td><code>pve-firewall status|stop|start</code></td><td>Firewall</td></tr>
</tbody></table>
