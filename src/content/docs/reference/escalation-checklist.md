---
title: "4.11 Escalation Checklist"
description: "collect these before you escalate. It saves a lot of back-and-forth."
sidebar:
  order: 11
  badge:
    text: Ops
    variant: success
---

:::note[In a nutshell]
collect these before you escalate. It saves a lot of back-and-forth.
:::

- **What and when:** what is affected, when it started, and what changed recently.
- **Task details:** the failed task's UPID and its log (double-click the task → copy).
- **Cluster state:** the output of `pvecm status`, `ha-manager status` and `ceph -s`.
- **System report:** `pvereport > /tmp/pvereport-$(hostname).txt` on the affected node (also under Node → Subscription → System Report).
- **What you've tried**, with the exact commands.

:::caution
Remove passwords, tokens and keys before attaching logs or reports to a ticket.
:::
