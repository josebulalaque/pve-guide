---
title: "2.2 Web UI Tour"
description: "one screen with four areas. The tree on the left picks what, the tabs on the right show details, and the bottom panel shows what just happened."
sidebar:
  order: 2
---

:::note[In a nutshell]
one screen with four areas. The tree on the left picks *what*, the tabs on the right show *details*, and the bottom panel shows *what just happened*.
:::

![The Proxmox web UI: header, resource tree, content panel and task log](../../../assets/diagrams/13-web-ui.svg)

| # | Area | Use it for |
|---|---|---|
| 1 | **Header** | Search (find a VM by name or ID), Create VM / CT, your user menu |
| 2 | **Resource tree** | Everything in the cluster. Switch between Server, Folder and Pool views. |
| 3 | **Content panel** | Tabs for the selected item: Summary, Console, Hardware, Backup, Snapshots… |
| 4 | **Task log** | Recent tasks and their result. Double-click a task for its full log. |

## What the icons mean

- **Green play icon**: running. **Grey**: stopped. **Padlock**: locked by a task.
- **Node with a red cross**: offline. **Grey question mark**: no status updates (see [4.10 Troubleshooting & Runbooks](../../reference/troubleshooting-runbooks/)).

## Console

![Console connections from the browser to a VM, container or node](../../../assets/diagrams/13-console.svg)

The **Console** tab shows a VM's screen (noVNC), or a terminal on a container or node (xterm.js), without needing SSH.
