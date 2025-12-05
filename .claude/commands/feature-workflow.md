---
description: "Add, update, or remove features with senior agent consultation and quality gates"
allowed-tools: ["Task", "Read", "Write", "Edit", "MultiEdit", "Grep", "Glob", "TodoWrite"]
---

# Feature Workflow - Feature Development Pipeline

Execute focused feature development workflow with senior agent consultation and quality gates.

## Context

- Feature request: $ARGUMENTS
- Supports: Add new feature, Update existing feature, Remove feature
- Includes senior agent consultation for architecture decisions

## Model Recommendations

For best results, use these models at each phase:

| Phase | Recommended Model | Reason |
|-------|-------------------|--------|
| Planning & Analysis | Default (Opus 4.5) | Better reasoning for architecture |
| Senior Consultation | Default (Opus 4.5) | Expert-level decisions |
| Implementation | Sonnet 4.5 | Fast, good for coding |
| Review & Validation | Default (Opus 4.5) | Catches subtle issues |

You can switch models with: /model [model-name]

## Your Role

You are the Feature Orchestrator managing a focused development pipeline. You coordinate quality-gated implementation with senior agent consultation for architectural decisions.

## CRITICAL: Project Context Loading

Before ANY work begins, you MUST read and understand:

1. **Project Configuration**: Read CLAUDE.md in project root
2. **Existing Documentation**: Read all files in docs/ folder
3. **Project Status**: Check docs/{date}/tasks/ for completed and pending work
4. **Current Codebase**: Scan src/ to understand existing patterns
5. **Type Definitions**: Read src/types/ to understand data models

This ensures continuity across sessions and prevents duplicate or conflicting work.

## Sub-Agent Chain Process

Execute the following chain:

```
First read CLAUDE.md and docs/ folder to understand project context, then use the spec-analyst sub agent to analyze the feature request and determine if it is add/update/remove for [$ARGUMENTS], then use the senior-frontend-architect sub agent (for frontend changes) or senior-backend-architect sub agent (for backend changes) to provide architectural guidance, then use the spec-planner sub agent to create task breakdown considering existing codebase, then use the spec-developer sub agent to implement following existing patterns, then use the spec-reviewer sub agent to review code quality and integration, then if review score ≥90% use the spec-tester sub agent to add tests, otherwise use the spec-developer sub agent again to address feedback and repeat from review step.
```

## Workflow Logic

### Feature Types

- **ADD**: New functionality that doesn't exist
- **UPDATE**: Modify existing functionality
- **REMOVE**: Delete functionality (with cleanup)

### Quality Gate Mechanism

- **Review Score ≥90%**: Proceed to spec-tester sub agent
- **Review Score <90%**: Loop back to spec-developer with feedback
- **Maximum 3 iterations**: Prevent infinite loops

### Senior Agent Routing

- **Frontend changes** (components, hooks, UI, styles): Consult senior-frontend-architect
- **Backend changes** (API, database, auth, services): Consult senior-backend-architect
- **Both frontend and backend**: Consult both senior agents
- **Design/UX questions**: Consult ui-ux-master

---

## Execute Workflow

**Feature Request**: $ARGUMENTS

Starting feature development workflow...

### 📖 Phase 0: Project Context Loading (REQUIRED)

Before any analysis, READ the following:

**Must Read**:
- [ ] CLAUDE.md - Project configuration and conventions
- [ ] docs/ folder - All existing documentation
- [ ] src/types/ - Data models and interfaces
- [ ] package.json - Dependencies and scripts

**Scan for Patterns**:
- [ ] src/components/ - Component structure and patterns
- [ ] src/hooks/ - Custom hook patterns
- [ ] src/lib/ - Utility patterns
- [ ] src/app/api/ - API route patterns (if applicable)

**Check Status**:
- [ ] docs/{latest-date}/tasks/ - What's completed and pending
- [ ] Look for TODO comments in codebase
- [ ] Check for any WIP (work in progress) files

**Document Current State**:
```
Project: [name from CLAUDE.md]
Last Updated: [date]
Completed Features: [list]
Pending Features: [list]
Current Session Focus: [feature request]
```

### 🔍 Phase 1: Feature Analysis

First use the **spec-analyst** sub agent to:

- Determine feature type: ADD / UPDATE / REMOVE
- Analyze impact on existing code
- Identify affected files and components
- Check for dependencies and breaking changes
- Review related documentation

**Output Format**:
```
## Feature Analysis Report

### Feature Type
[ ] ADD - New functionality
[ ] UPDATE - Modify existing: [what exists currently]
[ ] REMOVE - Delete: [what will be removed]

### Scope
- Files to create: [list]
- Files to modify: [list]
- Files to delete: [list]

### Dependencies
- Depends on: [existing code/features]
- Depended by: [code that uses this]

### Breaking Changes
- [ ] None expected
- [ ] Breaking: [description and migration needed]

### Related Documentation
- Existing docs: [references]
- Docs to update: [list]
```

### 🧠 Phase 2: Senior Agent Consultation

Based on feature type, consult the appropriate senior agent:

**For Frontend Changes** - Use **senior-frontend-architect** sub agent:
- Review component architecture approach
- Suggest patterns consistent with existing code
- Identify reusable components/hooks
- Performance considerations
- Accessibility requirements

**For Backend Changes** - Use **senior-backend-architect** sub agent:
- Review API design approach
- Database schema considerations
- Security implications
- Performance and scalability
- Error handling patterns

**For Design/UX Changes** - Use **ui-ux-master** sub agent:
- UI component design guidance
- User experience flow
- Responsive design approach
- Accessibility compliance
- Design system consistency

**Senior Agent Output**:
```
## Senior Architecture Guidance

### Recommended Approach
[detailed approach]

### Patterns to Follow
- [pattern 1 with example from codebase]
- [pattern 2 with example from codebase]

### Patterns to Avoid
- [anti-pattern and why]

### Components to Reuse
- [existing component]: [how to use]

### New Components Needed
- [component]: [purpose and design]

### Potential Pitfalls
- [pitfall and how to avoid]
```

### 📋 Phase 3: Task Planning

Then use the **spec-planner** sub agent to:

- Create detailed task breakdown
- Order tasks by dependency
- Estimate complexity for each task
- Identify files to create/modify/delete
- Define acceptance criteria per task

**Output**: Save to `docs/{YYYY_MM_DD}/tasks/feature-{name}-tasks.md`

**Task Format**:
```
## Feature: [name]
## Type: ADD / UPDATE / REMOVE
## Date: [YYYY-MM-DD]
## Status: In Progress

### Tasks

#### Task 1: [name]
- Type: [create/modify/delete]
- Files: [list]
- Dependencies: [task numbers]
- Acceptance Criteria:
  - [ ] [criterion 1]
  - [ ] [criterion 2]
- Status: [ ] Pending / [x] Complete

#### Task 2: [name]
...
```

### 💻 Phase 4: Implementation

Then use the **spec-developer** sub agent to:

**For ADD features**:
- Create new files following existing patterns
- Extend existing types (don't duplicate)
- Integrate with existing components
- Add to exports/barrel files

**For UPDATE features**:
- Modify existing code carefully
- Maintain backward compatibility if possible
- Update related components
- Update type definitions

**For REMOVE features**:
- Remove feature code
- Clean up imports and exports
- Remove or update dependent code
- Remove related tests
- Update documentation

**Implementation Rules**:
- [ ] Match existing code style exactly
- [ ] Reuse existing utilities and hooks
- [ ] Follow patterns from senior agent guidance
- [ ] Add inline documentation
- [ ] No console.logs in final code
- [ ] Update task status after each task completion

### 🔍 Phase 5: Code Review

Then use the **spec-reviewer** sub agent to evaluate:

| Criteria | Weight | Description |
|----------|--------|-------------|
| Integration | 25% | Fits cleanly with existing code |
| Consistency | 25% | Follows established patterns |
| Senior Guidance | 20% | Follows senior agent recommendations |
| Quality | 15% | Clean, maintainable code |
| Types | 15% | Proper TypeScript usage |

**Provide review score (0-100%)**

**Review Checklist**:
- [ ] Follows patterns in CLAUDE.md
- [ ] Matches existing code style
- [ ] Implements senior agent recommendations
- [ ] Types are correct and complete
- [ ] No duplicate code
- [ ] Error handling in place
- [ ] Accessibility maintained (for UI)

### 🔄 Quality Gate Decision

**If review score ≥90%**: Proceed to testing phase
**If review score <90%**: Return to spec-developer with specific feedback

Feedback must include:
- Exact files and line numbers
- What needs to change
- Reference to correct pattern in codebase
- Reference to senior agent guidance if applicable

### 🧪 Phase 6: Testing (Final)

Finally use the **spec-tester** sub agent to:

**For ADD features**:
- Add unit tests for new functions/components
- Add integration tests for feature flow
- Test edge cases and error conditions

**For UPDATE features**:
- Update existing tests if behavior changed
- Add tests for new behavior
- Ensure no regression in existing tests

**For REMOVE features**:
- Remove tests for deleted code
- Update tests that referenced deleted code
- Verify remaining tests pass

### 📝 Phase 7: Documentation Update

After implementation, update:

- [ ] docs/{date}/tasks/ - Mark tasks as complete
- [ ] README.md - If feature affects usage
- [ ] CLAUDE.md - If architecture changed
- [ ] API documentation - If endpoints changed
- [ ] Type definitions - Add JSDoc comments

---

## Output Summary

```
Feature: [name]
Type: ADD / UPDATE / REMOVE
Status: Complete

Files Created: [list]
Files Modified: [list]
Files Deleted: [list]
Tests Added/Updated: [count]

Senior Agent Consulted: [which one(s)]
Review Score: [final score]%
Iterations: [count]

Documentation Updated:
- [doc 1]
- [doc 2]

Next Steps (if any):
- [follow-up item]
```

**Begin execution now by first reading CLAUDE.md and project documentation.**
```
