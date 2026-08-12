import { spawn } from "node:child_process";

function signalProcessTree({
  child,
  signal,
  timeoutMs,
  platform = process.platform,
  spawnProcess = spawn,
}) {
  if (!child.pid) return Promise.resolve();
  if (platform !== "win32") {
    try {
      process.kill(-child.pid, signal);
    } catch {
      child.kill(signal);
    }
    return Promise.resolve();
  }

  const args = ["/pid", String(child.pid), "/t"];
  if (signal === "SIGKILL") args.push("/f");
  const killer = spawnProcess("taskkill", args, {
    stdio: "ignore",
    windowsHide: true,
  });
  return new Promise((resolvePromise, rejectPromise) => {
    let settled = false;
    let timer;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      killer.removeListener("error", onError);
      killer.removeListener("close", onClose);
      if (error) rejectPromise(error);
      else resolvePromise();
    };
    const onError = (error) => finish(error);
    const onClose = (code) =>
      code === 0
        ? finish()
        : finish(new TypeError(`taskkill failed (${code ?? "unknown"}).`));
    timer = setTimeout(() => {
      killer.kill();
      finish(new TypeError("Process tree termination timed out."));
    }, timeoutMs);
    killer.once("error", onError);
    killer.once("close", onClose);
  });
}

function bounded(operation, timeoutMs) {
  return new Promise((resolvePromise, rejectPromise) => {
    const timer = setTimeout(
      () => rejectPromise(new TypeError("Process tree termination timed out.")),
      timeoutMs,
    );
    operation.then(
      () => {
        clearTimeout(timer);
        resolvePromise();
      },
      (error) => {
        clearTimeout(timer);
        rejectPromise(error);
      },
    );
  });
}

export function createTerminationCoordinator({
  child,
  timeoutMs,
  onReady,
  terminateTree = signalProcessTree,
}) {
  let closed = false;
  let error;
  let forced = false;
  let forcedCheck;
  let pending = 0;

  const finishWhenReady = () => {
    if (pending > 0) return;
    if (closed) {
      onReady(error);
      return;
    }
    if (forced && !forcedCheck) {
      forcedCheck = setTimeout(() => {
        forcedCheck = undefined;
        if (!closed) {
          onReady(error ?? new TypeError("Process tree did not terminate."));
        }
      }, timeoutMs);
    }
  };
  const terminate = (signal) => {
    pending += 1;
    bounded(
      Promise.resolve().then(() => terminateTree({ child, signal, timeoutMs })),
      timeoutMs,
    )
      .catch((failure) => {
        error ??= failure;
        child.kill(signal);
      })
      .finally(() => {
        pending -= 1;
        finishWhenReady();
      });
  };

  return {
    cleanup() {
      clearTimeout(forcedCheck);
    },
    close() {
      closed = true;
      finishWhenReady();
    },
    force() {
      forced = true;
      terminate("SIGKILL");
    },
    start() {
      terminate("SIGTERM");
    },
  };
}
