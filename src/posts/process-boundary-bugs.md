---
title: "Your Bugs Live at the Process Boundary"
date: "2026-11-04"
description: Seven lessons from wrapping a CLI in your own tool, covering environment leaks, wrong binaries, Windows launchers, timeouts, orphaned processes, and health checks that lie.
tags: ["Node.js", "CLI", "Cross-Platform"]
image: "/blogImages/keyboard.jpg"
slug: process-boundary-bugs
---

## Seven Lessons From Wrapping a CLI

If your tool starts another command-line program, most of your bugs will be at the boundary between the two. That covers a bot, an editor extension, a CI runner or an agent orchestrator. The other program works and your code looks right. The failures come from environment variables, install layouts, platform differences and process lifetimes. Most of them either fail silently or point you at the wrong cause.

The lessons below apply to `git`, `ffmpeg`, `terraform`, `docker`, a language server or any other CLI you might launch. The code samples use Node and a placeholder CLI called `acme`. If your tool runs on more than one OS, or passes user input to a child process, this post is for you.

## 1. Choose Which Environment Variables to Pass

Many tools set marker variables that change how child programs behave: `GIT_DIR`, `VIRTUAL_ENV`, `npm_config_*`, `TERM`, `CI`, and the "you're already running inside me" markers some CLIs use to block nested sessions. If you pass `process.env` through unchanged, the child inherits the context of whatever started your tool.

A classic case: a git hook runs a script, and that script calls `git` in a different repository. The hook environment sets `GIT_DIR`, so the inner `git` call quietly acts on the original repository. An active Python virtualenv leaking into a subprocess that expected the system interpreter is the same bug in another form. Nesting guards cause a louder version: the child refuses to start and claims it's nested inside itself, when it's really an independent run that inherited a marker.

The fix is to copy the environment and remove the variables you know cause problems, with a comment explaining why each one is removed:

```js
function childEnv() {
  const env = { ...process.env };

  // We may be launched from a git hook; the child operates on its own repository.
  delete env.GIT_DIR;
  delete env.GIT_WORK_TREE;

  return env;
}

spawn(cli.command, cli.args, { env: childEnv() });
```

Marker variables exist for good reasons. A nesting guard, for example, stops a CLI from accidentally starting copies of itself in a loop. Before you delete a marker, be able to say why it doesn't apply to your child process.

## 2. Know Which Binary You're Running

"Command not found" is the easy case, because at least it fails loudly. The harder case is finding the wrong copy of the program: an old global install earlier on `PATH`, a version manager's shim, or a half-uninstalled version. Machines with several installs of the same tool are normal.

Picture two installs of the same CLI, an old one and a current one, with the old one first on `PATH`. A config file gets corrupted. The current version recovers from it; the old version hangs at startup. From the outside, all you see is a run that never finishes, and the culprit is a binary you forgot you had.

The fix is to find the binary once at startup, run `--version` on it, and log the full path and version. Also provide an override variable for when the lookup picks the wrong one:

```js
import { execFileSync } from "node:child_process";

function resolveCli() {
  const cli = process.env.MYTOOL_ACME_PATH
    ? { command: process.env.MYTOOL_ACME_PATH, args: [] }
    : findCliOnPath(); // see lesson 3 for what this has to do on Windows

  const version = execFileSync(cli.command, [...cli.args, "--version"], {
    encoding: "utf8",
    timeout: 10_000,
    windowsHide: true,
  }).trim();

  console.log(`Using ${cli.command} (${version})`);
  return cli;
}
```

A habit worth building: when a wrapped CLI misbehaves, run the exact command your tool runs, by hand, with the same environment and working directory. It finds problems faster than reading your own code again.

## 3. On Windows, Unwrap the Launcher

On Windows, npm, pip and other installers put `.cmd` or `.bat` launcher scripts on `PATH`. Node's `spawn()` can't run those without `shell: true`, and with a shell, `cmd.exe` parses your arguments again. Feed user input into that parser and you have a command injection vulnerability.

The usual answer is to skip the launcher and run whatever it would have run. For an npm-installed CLI, that often means running the package's JavaScript entry point with Node directly. Then one day the package starts shipping a native executable in place of its JS file. Your lookup finds nothing, falls back to the bare command name, and every run fails with:

```
Error: spawn acme ENOENT
```

The fix is to check several known layouts, skip a launcher whose package is missing, and fail with a clear message when every layout comes up empty:

```js
import fs from "node:fs";
import path from "node:path";

function unwrapNpmLauncher(cmdPath) {
  const pkgDir = path.join(path.dirname(cmdPath), "node_modules", "acme");

  const exe = path.join(pkgDir, "bin", "acme.exe");
  if (fs.existsSync(exe)) return { command: exe, args: [] };

  const js = path.join(pkgDir, "cli.js");
  if (fs.existsSync(js)) return { command: process.execPath, args: [js] };

  return null; // launcher with no package behind it; try the next one on PATH
}

function findCliOnPath() {
  for (const dir of process.env.PATH.split(path.delimiter)) {
    const launcher = path.join(dir, "acme.cmd");
    if (!fs.existsSync(launcher)) continue;
    const cli = unwrapNpmLauncher(launcher);
    if (cli) return cli;
  }
  throw new Error(
    "Could not find a usable acme install. Set MYTOOL_ACME_PATH to the acme executable."
  );
}
```

Install layouts change between versions, so treat them as an implementation detail of the other program. When your lookup fails, have it say so immediately, in words that point at the install.

## 4. Send User Input on Stdin

Command-line arguments have a length limit (on Windows, about 32,000 characters for the entire command line) and are risky to quote correctly. Many CLIs also read their input from stdin, which has neither problem.

Say your tool forwards a user's message, a file's contents or a generated prompt to the child. Passed as an argument, a long input hits the length limit and a tricky one breaks your quoting. Written to stdin, both risks disappear together:

```js
const child = spawn(cli.command, [...cli.args, "--input", "-"], {
  env: childEnv(),
  stdio: ["pipe", "pipe", "pipe"],
  windowsHide: true,
});

child.stdin.end(userInput);
```

The command line now holds only flags you control. Whatever the user typed travels to the child as plain data.

## 5. Time Out on Silence

A fixed time limit is wrong in both directions. It kills slow jobs that are making progress, and it waits too long on jobs that are stuck. For a tool that streams its output, you can see progress: new output means it's still working.

A two-minute cap is a common first attempt. It kills the legitimate ten-minute build, and when a real hang happens, it reports `exited (1):` with an empty reason after the colon, which tells you nothing.

The fix is to reset a timer on every line of output and stop the run after N seconds with no output. Make N configurable, and when the timer fires, report it as a timeout:

```js
import readline from "node:readline";

const idleMs = Number(process.env.MYTOOL_IDLE_TIMEOUT_MS ?? 120_000);
let timedOut = false;
let timer;

function resetIdleTimer() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    timedOut = true;
    killTree(child);
  }, idleMs);
}

resetIdleTimer();
readline.createInterface({ input: child.stdout }).on("line", (line) => {
  resetIdleTimer();
  handleLine(line);
});

child.on("exit", (code) => {
  clearTimeout(timer);
  if (timedOut) {
    reportError(`Timed out after ${idleMs / 1000}s of no output`);
  } else if (code !== 0) {
    reportError(`acme exited (${code}): ${stderrTail() || "no error output"}`);
  }
});
```

Keep the captured stderr bounded (the last few kilobytes is plenty) and include it in the error message. An empty reason after the colon is exactly the kind of failure that wastes an afternoon.

## 6. A CLI You Start Is a Process Tree

Modern CLIs start their own helper processes: language servers, plugin hosts, MCP servers, browsers. Killing the parent leaves those helpers running. After enough runs, your machine fills up with orphans that hold memory, ports and file locks.

You have to kill the whole tree, and how you do that depends on the platform.

- **Windows:** `taskkill /pid <pid> /t /f` kills the process and all of its descendants.
- **POSIX:** start the child in its own process group with `detached: true`, send `SIGTERM` to the whole group, then `SIGKILL` after a short delay if it's still running.

```js
import { spawn } from "node:child_process";

const running = new Set();

function start(command, args, options) {
  const child = spawn(command, args, {
    ...options,
    detached: process.platform !== "win32", // own process group on POSIX
    windowsHide: true,
  });
  running.add(child);
  child.on("exit", () => running.delete(child));
  return child;
}

function killTree(child) {
  if (child.exitCode !== null) return;

  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { windowsHide: true });
    return;
  }

  try {
    process.kill(-child.pid, "SIGTERM"); // negative pid targets the group
  } catch {
    return; // group already gone
  }
  setTimeout(() => {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {}
  }, 3000).unref();
}

process.on("SIGINT", () => {
  for (const child of running) killTree(child);
  process.exit(130);
});
```

The `SIGINT` handler is essential. A child in its own process group stops receiving the terminal's Ctrl+C, so your tool has to pass the signal along itself. Skip that step, and every Ctrl+C leaves children running.

## 7. Check the Success of What You Just Did

A trustworthy health check asks one question: did my action produce the good state? A broader "is everything healthy?" check happily passes on leftover state from a previous run.

Imagine a `start --detach` command that launches a background service and then asks "is a service online?" If the previous instance is still running, the answer is yes, and your tool reports success while the new process has already crashed.

The fix is to watch the specific process you started and fail as soon as it exits. Show the tail of its log when it does:

```js
async function startDetached(logFile) {
  const child = start(cli.command, cli.args, { stdio: ["ignore", logFd, logFd] });

  const outcome = await Promise.race([
    once(child, "exit").then(([code]) => ({ ok: false, code })),
    waitForReadyLine(logFile, child.pid).then(() => ({ ok: true })),
    delay(30_000).then(() => ({ ok: false, code: "no ready signal after 30s" })),
  ]);

  if (!outcome.ok) {
    throw new Error(
      `Service failed to start (${outcome.code}). Last log lines:\n${tail(logFile, 20)}`
    );
  }

  child.unref();
}
```

The ready signal is tied to this process's PID, so only the process you just launched can satisfy the check.

## The Unifying Point

Every failure above is either silent or blamed on the wrong thing: an empty error message, a misleading "started successfully", a confusing "nested session". The fixes that matter most are plain ones. Each makes a failure name its real cause.

Your error messages are part of your boundary with the other program. Design them as carefully as your happy path.

## Checklist: When Your Tool Starts Another CLI

- Choose which environment variables to pass, and document the ones you remove.
- Find the binary once at startup, and log its path and version.
- Provide an override variable for the binary path.
- Unwrap Windows launchers so user input stays out of the shell.
- Send user input on stdin.
- Use an idle timeout, make it configurable, and report it as a timeout.
- Kill the whole process tree, including when your own tool gets Ctrl+C.
- Hide console windows for background children on Windows (`windowsHide: true`).
- Bound the stderr you capture, and include it in error messages.
- Make startup and health checks about the process you just started.
- Test with a fake CLI (`node -e "…"`) so tests are fast and run on every OS.

## References and Further Reading

- **[Node.js child_process Documentation](https://nodejs.org/api/child_process.html)**
  Covers `spawn`, `detached`, `windowsHide`, stdio options, and the security warning about `shell: true`.

- **[Node.js Security Release: BatBadBut (CVE-2024-27980)](https://nodejs.org/en/blog/vulnerability/april-2024-security-releases-2)**
  Why spawning `.bat` and `.cmd` files on Windows now requires `shell: true`, and the argument-injection risk behind the change.

- **[Microsoft: taskkill](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/taskkill)**
  Reference for the `/t` (tree) and `/f` (force) flags used to kill a process and its descendants.

- **[Microsoft: Command Line Limitation](https://learn.microsoft.com/en-us/troubleshoot/windows-client/shell-experience/command-line-string-limitation)**
  Details on Windows command-line length limits.

- **[Git Hooks Documentation](https://git-scm.com/docs/githooks)**
  Explains the environment variables git sets while running hooks, including `GIT_DIR`.
