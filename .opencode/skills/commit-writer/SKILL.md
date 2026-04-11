---
name: commit-writer
description: Analyzes uncommitted changes, suggests semantic commit messages from most refined to most concise, then commits and pushes after user selection.
---

# Git Commit Helper Skill

## Purpose

Help the user create a high-quality semantic commit based on the current uncommitted changes.

When triggered, this skill must:

1. inspect the current uncommitted changes
2. generate an enumerated list of commit title suggestions
3. ask the user to choose one option by number
4. stage the files
5. commit with the selected message
6. push the current branch

---

## Behavior

### 1. Inspect changes

Read the current working tree and analyze:

- modified files
- new files
- deleted files
- renamed files
- untracked files

Use the actual diff/content to understand the change.
Do not guess beyond the observed changes.

Recommended commands:
git status --short
git diff
git diff --cached
git ls-files --others --exclude-standard

---

### 2. Generate commit suggestions

Generate an enumerated list of commit title suggestions ordered:

1. most refined and descriptive
2. shorter but still high-signal
3. balanced
4. concise
5. most concise

Return between 4 and 7 options.

All commit options must:

- represent the full scope of the current uncommitted changes
- be accurate
- be written in English
- be lowercase
- follow semantic commit conventions
- avoid vague wording
- avoid scope in parentheses unless the repository clearly uses that convention

---

### 3. Semantic prefix rules

- feat: new functionality
- docs: documentation
- test: tests
- chore: maintenance/setup
- fix: bug fix only
- refactor: code restructure without behavior change
- style: formatting only

---

### 4. Output format

## Commits

1. <most refined option>
2. <second option>
3. <third option>
4. <fourth option>

Type the number of the option you want to use.

---

### 5. After user selection

- git add .
- git commit -m "<selected message>"
- git push

---

## Safety rules

- Never commit before user selection
- Never push before commit succeeds
- If no changes, inform user
- If commit fails, report error
- If push fails, report error

---

## Style

- concise
- objective
- no emojis
- title only

---

## Example

## Commits

1. feat: add initial frontend specs for crm
2. feat: add crm frontend specs
3. feat: create frontend specs
4. feat: add specs

Type the number of the option you want to use.
