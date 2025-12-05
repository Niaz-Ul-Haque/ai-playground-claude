---
description: "Handle multiple updates, fixes, and changes in a single coordinated session"
allowed-tools: ["Task", "Read", "Write", "Edit", "MultiEdit", "Grep", "Glob", "TodoWrite"]
---

# Patch Workflow - Multi-Issue Resolution Pipeline

Execute coordinated resolution of multiple updates, bug fixes, and changes in a single session.

## Context

- Issues to address: $ARGUMENTS
- Supports: Multiple bugs, features, and updates in one session
- Prioritizes by severity and dependency

## Model Recommendations

| Phase | Recommended Model | Reason |
|-------|-------------------|--------|
| Triage & Analysis | Default (Opus 4.5) | Better at understanding relationships |
| Bug Diagnosis | Default (Opus 4.5) | Root cause analysis |
| Implementation | Sonnet 4.5 | Fast for code changes |
| Verification | Default (Opus 4.5) | Catches regressions |

You can switch models with: /model [model-name]

## Your Role

You are the Patch Orchestrator managing resolution of multiple issues in a coordinated manner. You triage, prioritize, and ensure fixes don't conflict with each other.

## CRITICAL: Project Context Loading

Before ANY work begins, you MUST read and understand:

1. **Project Configuration**: Read CLAUDE.md in project root
2. **Existing Documentation**: Read all files in docs/ folder
3. **Current Codebase**: Understand affected files and patterns
4. **Type Definitions**: Read src/types/ for data models
5. **Related Components**: Understand dependencies between issues

## Sub-Agent Chain Process

Execute the following chain:

```
First read CLAUDE.md and docs/ folder to understand project context, then use the spec-analyst sub agent to triage and categorize all issues in [$ARGUMENTS], then for each BUG use the spec-analyst sub agent to diagnose root cause, then for each FEATURE use the spec-planner sub agent to plan implementation, then use the spec-developer sub agent to implement all fixes in dependency order, then use the spec-reviewer sub agent to verify all fixes work together without regression, then if all issues resolved and review score >=90% use the spec-tester sub agent to add tests for bug fixes, otherwise use the spec-developer sub agent to address feedback and repeat from review step.
```

## Workflow Logic

### Issue Categories

- **BUG-CRITICAL**: App crashes, data loss, security → Fix first
- **BUG-HIGH**: Feature broken, bad UX → Fix second
- **BUG-MEDIUM**: Minor issues, edge cases → Fix third
- **UPDATE**: Modify existing feature → After bugs
- **ADD**: New functionality → After updates
- **REMOVE**: Delete functionality → Last

### Dependency Resolution

Before implementing, determine:
1. Which issues affect the same files?
2. Which fixes depend on other fixes?
3. What order prevents conflicts?

### Quality Gate

- **All issues resolved + Score >=90%**: Complete
- **Issues remaining or Score <90%**: Continue fixing
- **Maximum 3 iterations per issue**: Report blockers

---

## Execute Workflow

**Issues to Address**: $ARGUMENTS

Starting multi-issue patch workflow...

### 📖 Phase 0: Project Context Loading (REQUIRED)

Before any analysis, READ:

- [ ] CLAUDE.md - Project configuration
- [ ] docs/ folder - Existing documentation
- [ ] src/types/ - Data models
- [ ] Affected files mentioned in issues

### 🔍 Phase 1: Issue Triage

First use the **spec-analyst** sub agent to:

- Parse all issues from the request
- Categorize each issue (BUG/UPDATE/ADD/REMOVE)
- Assign priority (CRITICAL/HIGH/MEDIUM/LOW)
- Identify affected files for each issue
- Determine dependencies between issues

**Output Format**:
```
## Issue Triage Report

### Issues Identified
| ID | Type | Priority | Summary | Files Affected |
|----|------|----------|---------|----------------|
| 1 | BUG | CRITICAL | [summary] | [files] |
| 2 | BUG | HIGH | [summary] | [files] |
| 3 | UPDATE | MEDIUM | [summary] | [files] |
| 4 | ADD | MEDIUM | [summary] | [files] |

### Dependencies
- Issue 2 depends on Issue 1 (same file)
- Issue 3 and 4 are independent

### Recommended Order
1. [Issue ID] - [reason]
2. [Issue ID] - [reason]
3. [Issue ID] - [reason]

### File Conflict Analysis
| File | Issues Affecting | Risk |
|------|------------------|------|
| [file] | 1, 2 | High - coordinate changes |
```

### 🔬 Phase 2: Bug Diagnosis

For each BUG issue, use the **spec-analyst** sub agent to:

- Identify exact location of bug
- Determine root cause
- Check for related bugs in similar code
- Define fix approach

**Per-Bug Output**:
```
## Bug Diagnosis: [Issue ID]

### Summary
[brief description]

### Location
- File: [path]
- Function/Component: [name]
- Line(s): [numbers]

### Root Cause
[explanation]

### Related Code
[other places with same pattern]

### Fix Approach
[how to fix]
```

### 📋 Phase 3: Feature Planning

For each UPDATE/ADD issue, use the **spec-planner** sub agent to:

- Identify files to modify/create
- Plan changes in detail
- Ensure consistency with existing code
- Define acceptance criteria

**Per-Feature Output**:
```
## Feature Plan: [Issue ID]

### Summary
[brief description]

### Changes Required
| File | Action | Change Description |
|------|--------|-------------------|
| [file] | modify | [what to change] |
| [file] | create | [what to create] |

### Acceptance Criteria
- [ ] [criterion 1]
- [ ] [criterion 2]
```

### 💻 Phase 4: Implementation

Use the **spec-developer** sub agent to implement ALL fixes in dependency order:

**Implementation Order** (determined in Phase 1):
1. CRITICAL bugs first
2. HIGH bugs second
3. Dependencies resolved before dependents
4. UPDATEs after bugs
5. ADDs last

**For Each Issue**:
```
// ============================================
// Issue [ID]: [Type] - [Summary]
// ============================================
// Root Cause/Requirement: [brief]
// Fix/Implementation: [what was done]
// Files Modified: [list]
// ============================================
```

**Implementation Rules**:
- [ ] Fix bugs with minimal changes
- [ ] Follow existing patterns for features
- [ ] Add defensive coding to prevent similar bugs
- [ ] Test each fix before moving to next
- [ ] Don't introduce new patterns
- [ ] Add comments explaining non-obvious fixes

### 🔍 Phase 5: Integrated Review

Use the **spec-reviewer** sub agent to verify ALL fixes together:

**Per-Issue Verification**:
| Issue ID | Type | Fixed | Works | No Regression |
|----------|------|-------|-------|---------------|
| 1 | BUG | [yes/no] | [yes/no] | [yes/no] |
| 2 | BUG | [yes/no] | [yes/no] | [yes/no] |
| 3 | UPDATE | [yes/no] | [yes/no] | [yes/no] |
| 4 | ADD | [yes/no] | [yes/no] | [yes/no] |

**Integration Check**:
- [ ] All issues resolved
- [ ] Fixes work together
- [ ] No new bugs introduced
- [ ] No conflicts between changes
- [ ] App builds without errors
- [ ] Existing functionality intact

**Overall Score**: [0-100]%

### 🔄 Quality Gate Decision

**All issues resolved + Score >=90%**: Proceed to testing
**Issues remaining or Score <90%**: Return to Phase 4 with specific feedback

### 🧪 Phase 6: Testing (Final)

Use the **spec-tester** sub agent to:

**For Each Bug Fixed**:
- Add regression test that would have caught the bug
- Test edge cases related to the bug

**For Each Feature Added/Updated**:
- Add/update tests for new behavior
- Verify existing tests still pass

### 📝 Phase 7: Documentation

After all fixes verified:

- [ ] Update relevant documentation
- [ ] Add comments for non-obvious fixes
- [ ] Create patch summary in docs/{date}/patches/

**Patch Summary Document**:
Save to `docs/{YYYY_MM_DD}/patches/patch-summary.md`

```
## Patch Summary

### Date
[YYYY-MM-DD]

### Issues Resolved
| ID | Type | Priority | Summary | Resolution |
|----|------|----------|---------|------------|
| 1 | BUG | CRITICAL | [summary] | [how fixed] |

### Files Modified
- [file 1]: [changes]
- [file 2]: [changes]

### Tests Added
- [test 1]
- [test 2]

### Notes
[any important notes for future]
```

---

## Output Summary

```
Patch Session Complete

Issues Resolved: [count]/[total]

| ID | Type | Status | Resolution |
|----|------|--------|------------|
| 1 | BUG | Fixed | [brief] |
| 2 | BUG | Fixed | [brief] |
| 3 | UPDATE | Done | [brief] |
| 4 | ADD | Done | [brief] |

Files Modified: [list]
Tests Added: [count]
Review Score: [score]%
Iterations: [count]

Remaining Issues (if any):
- [issue and reason]
```

**Begin execution now by first reading CLAUDE.md and project documentation.**
```
