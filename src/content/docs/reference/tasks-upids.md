---
title: "4.2 Async Tasks & UPIDs"
description: "slow actions run as background tasks. The API hands back a UPID straight away, and you ask about that UPID until the task stops. Only then do you know whether it worked."
sidebar:
  order: 2
  badge:
    text: Dev
    variant: note
---

:::note[In a nutshell]
slow actions run as background **tasks**. The API hands back a **UPID** straight away, and you ask about that UPID until the task stops. Only then do you know whether it worked.
:::

![Polling a task until it stops, then checking its exit status](../../../assets/diagrams/42-task-polling.svg)

## What a UPID looks like

```text
UPID:node1:0003A1F2:01B2C3D4:6710ABCD:qmstart:101:appuser@pve!provisioner:
     │     │        │        │        │       │   └ who started it
     │     │        │        │        │       └ the VM/CT ID (or other object)
     │     │        │        │        └ task type (qmstart, qmclone, vzdump, qmigrate…)
     │     │        │        └ start time (hex Unix time)
     │     │        └ process start (hex)
     │     └ process ID (hex)
     └ the node running it: use this node in /nodes/{node}/tasks/…
```

Always take the node name **from the UPID**. It can differ from the node you sent the request to.

## Reading the status

| Field | Values | Meaning |
|---|---|---|
| `status` | `running` / `stopped` | Is it still going? |
| `exitstatus` | `OK` | Success |
|  | `WARNINGS: 2` | Finished, but read the log. Treat it as success, with a check. |
|  | any other text | Failed. The text is the error message. |

`exitstatus` only appears once `status` is `stopped`.

## A safe "wait for task" routine

```python
import time

def wait_for_task(api, upid, timeout=600, interval=2):
    node = upid.split(":")[1]                      # node comes from the UPID
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        st = api.nodes(node).tasks(upid).status.get()
        if st["status"] == "stopped":
            if st.get("exitstatus") == "OK" or st.get("exitstatus", "").startswith("WARNINGS"):
                return st
            log = api.nodes(node).tasks(upid).log.get(limit=50)
            raise RuntimeError(f"{upid} failed: {st.get('exitstatus')}\n" + "\n".join(l["t"] for l in log))
        time.sleep(interval)
    raise TimeoutError(f"{upid} still running after {timeout}s")   # don't assume failure: check later
```

## Rules of thumb

- **Poll every 1–2 seconds.** Faster just adds load on `pveproxy`.
- **Set timeouts per task type:** start (~2 min), clone (depends on disk size), migrate and backup (can take a long time).
- **A timeout isn't a failure.** The task may still finish. Re-check before retrying.
- **Never resend the action because polling failed** (a network blip, a 5xx). The first task is probably still running, and a second one can collide with it (a lock error or duplicate VM).
- **Know which calls are async.** `PUT …/config` is synchronous, while `POST …/config` returns a UPID.

## Useful endpoints

| Path | Does |
|---|---|
| `GET /nodes/{node}/tasks/{upid}/status` | Status and exitstatus |
| `GET /nodes/{node}/tasks/{upid}/log?start=0&limit=500` | Log lines (`n` = line number, `t` = text) |
| `DELETE /nodes/{node}/tasks/{upid}` | Stop a running task |
| `GET /nodes/{node}/tasks?vmid=101&source=active` | Tasks currently running for a VM |
