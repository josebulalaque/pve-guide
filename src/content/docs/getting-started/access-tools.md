---
title: "2.1 Access & Tools"
description: "people need a web UI login (and SSH for operators). Custom apps need an API token. Everyone benefits from out-of-band console access (IPMI / iDRAC) for when things are badly broken."
sidebar:
  order: 1
---

:::note[In a nutshell]
people need a web UI login (and SSH for operators). Custom apps need an **API token**. Everyone benefits from out-of-band console access (IPMI / iDRAC) for when things are badly broken.
:::

## Ways in

| Access | Used by | For | Notes |
|---|---|---|---|
| **Web UI** `https://<node>:8006` | Everyone | Almost everything day to day | Any node manages the whole cluster. Pick the right **realm** at login. |
| **REST API** `https://<node>:8006/api2/json` | Custom apps, scripts | Automation | Use an API token. See [2.4 API Basics](../api-basics/). |
| **Node → Shell** (in the web UI) | Operators | Quick commands as root | Cuts off if the web UI restarts. Not for upgrades. |
| **SSH** to a node | Operators | Diagnosis, logs, Ceph, scripts | Use `tmux` for long jobs |
| **IPMI / iDRAC / iLO** | Operators | When the node, network or firewall is broken | The only way in when nothing else works |

## Logging in

- **Realm:** `pam` = a Linux account on the node, `pve` = a Proxmox account, LDAP/AD/OpenID = a company directory.
- **Two-factor:** set it up under your user menu → TFA. Keep the recovery keys somewhere safe.
- **root@pam** is the break-glass account. Don't use it for daily work, and never for a custom app.

## API tokens for custom apps

A custom app should use its own user and an **API token**, never a person's login:

1. Create a user for the app, e.g. `appuser@pve` (Datacenter → Permissions → Users).
2. Create a token for it, e.g. `provisioner` (Permissions → API Tokens → Add). Leave **Privilege Separation** ticked.
3. Give the **token** a role on the paths it needs (Permissions → Add → API Token Permission). See [3.8 Users, Roles & Permissions](../../user-guide/users-roles-permissions/).
4. Copy the **secret** straight away. It's shown only once.

The full token ID is `appuser@pve!provisioner`. The app sends it with the secret in every request (see [2.4 API Basics](../api-basics/)).

:::caution
Never share passwords or token secrets in chat, tickets or code repositories. Use a password vault or secrets manager.
:::
