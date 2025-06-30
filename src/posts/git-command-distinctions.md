---
title: Understanding Core Git Commands
date: "2025-06-30"
description: Learn the differences between essential Git commands like rebase vs. merge, fetch vs. pull, and reset vs. revert.
tags: ["Git", "Version Control", "SWE"]
image: "/blogImages/git.png"
slug: git-command-distinctions
---

### Git Rebase vs. Git Merge

Both `git rebase` and `git merge` integrate branch changes, but with fundamentally different approaches to commit history.

#### Key Differences & Scenarios

`git merge` integrates changes by creating a new merge commit. This explicitly records the combination of two divergent histories, preserving a complete, non-linear progression. It's non-destructive and ideal when retaining the exact historical context of all branch points is crucial, like combining a completed feature into `main` after `main` has progressed.

In contrast, `git rebase` rewrites commit history. It reapplies a series of commits on top of a different base, creating a linear, cleaner project history. This is often preferred for cleaning up _local, unpushed history_, making your branch appear as if it started from the latest `main` commit without messy merge commits.

#### Visualizing the Impact

Imagine commits as nodes and branches as lines connecting them.

**Initial State (Merge & Rebase):**
`main` has A-B-C. `feature-branch` diverges from C, adding D-E.

```

A -- B -- C (main)

D -- E (feature-branch)

```

**After `git merge`:**
A new merge commit (M) is created on `main`, with two parents (C and E). This shows a clear "Y" or "V" shape where histories converged.

```

A -- B -- C ---- M (main)
           \    /
              D ---- E (feature branch)

```

**After `git rebase`:**
Commits D and E are "cut" and "pasted" as new commits (D', E') on top of `main`'s latest commit. `feature-branch` then points to E', resulting in a linear history.

```

A -- B -- C -- D' -- E' (main, feature-branch)

```

---

### Git Fetch vs. Git Pull

`git fetch` and `git pull` interact with remote repositories, but differ in how they integrate changes locally.

#### Key Differences & Scenarios

`git fetch` is a "download-only" command. It retrieves new data (commits, branches) from a remote and updates your local _remote-tracking branches_ (e.g., `origin/main`). It does **not** alter your local working directory or active branch, allowing you to review remote changes safely before integration. This is perfect for staying informed about team progress without immediate impact on your current task.

Conversely, `git pull` combines `git fetch` with an immediate integration (typically `git merge`) into your current local branch. This automates bringing in remote changes directly. It's suitable when you're confident accepting all remote changes to quickly update your branch before starting new work.

#### Visualizing the Impact

Understanding the "fetch then integrate" nature of `git pull` is key.

**Initial State (Local & Remote Aligned):**

```

Local: A -- B (main) Remote: A -- B (origin/main)

```

**Remote Changes Occur:** Teammate pushes new commit C to remote.

```

Local: A -- B (main) Remote: A -- B -- C (origin/main)

```

**After `git fetch`:** Downloads C, updates `origin/main`. Your local `main` remains untouched.

```

Local: A -- B (main) Remote: A -- B -- C (origin/main) <-- C is now known locally

```

**After `git pull` (from "Remote Changes Occur" state):** Fetches C, then merges C into your local `main`.

```

Local: A -- B -- C (main) Remote: A -- B -- C (origin/main)

```

---

### Git Reset vs. Git Revert

Both `git reset` and `git revert` undo changes, but `git reset` modifies history while `git revert` creates new history.

#### Key Differences & Scenarios

`git reset` directly rewrites history by moving your branch's `HEAD` pointer. This discards subsequent commits, making it powerful and potentially destructive. It's best for undoing local, unpushed changes (e.g., erasing a bug-ridden local commit before pushing). Use `--hard` with extreme caution as it discards uncommitted changes too.

`git revert` creates a _new commit_ that undoes the changes of a previous commit. It does not rewrite history but adds an explicit reversal, preserving a clear audit trail. This is the **safe method for undoing changes on shared branches** that have already been pushed, as it avoids disrupting collaborators' histories.

#### Visualizing the Impact

**Initial State (Reset & Revert):**
`your-branch`: A -- B -- C -- D

```

A -- B -- C -- D (HEAD -> your-branch)

```

**After `git reset --hard B`:**
Your branch's `HEAD` moves to B. Commits C and D are effectively "removed" from history.

```

A -- B (HEAD -> your-branch) [C and D are now unreachable by this branch]

```

**After `git revert C`:**
A new commit (`C_revert`) is created on top of D, reversing C's changes. Both C and D remain, with `C_revert` explicitly showing the undo action.

```

A -- B -- C -- D -- C_revert (HEAD -> your-branch)

```

---

### Conclusion

Mastering these core Git commands provides the flexibility and control necessary for efficient and collaborative development. Choose the right tool for the job to maintain a clean, understandable, and robust project history. Your understanding of these distinctions empowers you to navigate complex Git workflows with confidence.
