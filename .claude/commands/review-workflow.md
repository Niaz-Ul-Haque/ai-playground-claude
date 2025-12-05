---
description: "Comprehensive code review with senior agent consultation and actionable fixes"
allowed-tools: ["Task", "Read", "Write", "Edit", "MultiEdit", "Grep", "Glob", "TodoWrite"]
---

# Review Workflow - Code Review and Improvement Pipeline

Execute comprehensive code review with senior agent consultation and automated fixes.

## Context

- Code to review: $ARGUMENTS
- Goal: Identify issues, get expert guidance, implement fixes, verify improvements

## Model Recommendations

For best results, use these models at each phase:

| Phase | Recommended Model | Reason |
|-------|-------------------|--------|
| Initial Review | Default (Opus 4.5) | Catches subtle issues |
| Senior Consultation | Default (Opus 4.5) | Expert-level analysis |
| Fix Implementation | Sonnet 4.5 | Fast for code changes |
| Verification | Default (Opus 4.5) | Thorough validation |

You can switch models with: /model [model-name]

## Your Role

You are the Review Orchestrator managing a comprehensive code review process with senior agent expertise. You coordinate thorough analysis, expert consultation, actionable fixes, and verification.

## CRITICAL: Project Context Loading

Before ANY review, you MUST read and understand:

1. **Project Configuration**: Read CLAUDE.md in project root
2. **Coding Conventions**: Understand project-specific patterns
3. **Existing Documentation**: Read relevant docs in docs/ folder
4. **Type Definitions**: Read src/types/ for data models
5. **Related Code**: Understand how reviewed code fits in the system

This ensures reviews are consistent with project standards.

## Sub-Agent Chain Process

Execute the following chain:

```
First read CLAUDE.md and understand project conventions, then use the spec-reviewer sub agent to perform initial comprehensive review of [$ARGUMENTS], then based on issues found consult senior-frontend-architect sub agent (for frontend code) or senior-backend-architect sub agent (for backend code) for expert recommendations, then use the spec-developer sub agent to implement high-priority fixes following senior guidance, then use the spec-reviewer sub agent again to verify fixes, then if quality score ≥90% mark complete, otherwise continue fix cycle.
```

## Workflow Logic

### Priority Levels

- **Critical**: Security vulnerabilities, data loss risks → Must fix immediately
- **High**: Bugs, performance issues, type errors → Must fix before merge
- **Medium**: Code smells, style issues → Should fix
- **Low**: Suggestions, optimizations → Consider for future

### Senior Agent Routing

- **React/Next.js/Components/Hooks**: Consult senior-frontend-architect
- **API/Database/Auth/Services**: Consult senior-backend-architect
- **UI/Design/Accessibility**: Consult ui-ux-master
- **Mixed concerns**: Consult multiple senior agents

### Quality Gate

- **Score ≥90%**: Review complete
- **Score <90%**: Continue fixing high+ priority issues
- **Maximum 3 iterations**: Report remaining issues

---

## Execute Workflow

**Review Target**: $ARGUMENTS

Starting comprehensive code review workflow...

### 📖 Phase 0: Project Context Loading (REQUIRED)

Before reviewing, READ the following:

**Must Read**:
- [ ] CLAUDE.md - Project conventions and standards
- [ ] docs/ folder - Architecture and design decisions
- [ ] src/types/ - Data models being used

**Understand Context**:
- [ ] What does this code do in the system?
- [ ] What depends on this code?
- [ ] What patterns should this code follow?
- [ ] Are there similar implementations to compare against?

**Document Review Context**:
```
Review Target: [files/folder]
Project: [name from CLAUDE.md]
Code Purpose: [what this code does]
Related Code: [connected components/services]
Applicable Standards: [from CLAUDE.md]
```

### 🔍 Phase 1: Initial Comprehensive Review

First use the **spec-reviewer** sub agent to analyze:

**Security Review**:
- [ ] Input validation and sanitization
- [ ] Authentication/authorization checks
- [ ] Sensitive data exposure (logs, errors, responses)
- [ ] SQL injection / XSS vulnerabilities
- [ ] Dependency vulnerabilities
- [ ] CORS and CSP considerations

**Code Quality Review**:
- [ ] TypeScript strict compliance
- [ ] Proper error handling and recovery
- [ ] Null/undefined safety
- [ ] Code duplication (DRY violations)
- [ ] Function/component size and complexity
- [ ] Naming clarity and consistency
- [ ] Comments and documentation

**Architecture Review**:
- [ ] Separation of concerns
- [ ] Proper abstraction levels
- [ ] Dependency direction (no circular deps)
- [ ] Single responsibility principle
- [ ] Follows patterns from CLAUDE.md

**Performance Review**:
- [ ] Unnecessary re-renders (React)
- [ ] Memory leaks (event listeners, subscriptions)
- [ ] N+1 queries or redundant API calls
- [ ] Bundle size impact
- [ ] Expensive computations without memoization

**Accessibility Review** (for UI code):
- [ ] Semantic HTML usage
- [ ] ARIA labels and roles
- [ ] Keyboard navigation
- [ ] Color contrast
- [ ] Screen reader compatibility

**Output Format**:
```
## Initial Code Review Report

### Summary
- Files Reviewed: [count]
- Total Issues Found: [count]
- Initial Quality Score: [0-100]%

### Critical Issues (Must Fix)
| ID | Location | Issue | Impact | Suggested Fix |
|----|----------|-------|--------|---------------|
| C1 | [file:line] | [desc] | [impact] | [fix] |

### High Priority Issues (Must Fix Before Merge)
| ID | Location | Issue | Impact | Suggested Fix |
|----|----------|-------|--------|---------------|
| H1 | [file:line] | [desc] | [impact] | [fix] |

### Medium Priority Issues (Should Fix)
| ID | Location | Issue | Impact | Suggested Fix |
|----|----------|-------|--------|---------------|
| M1 | [file:line] | [desc] | [impact] | [fix] |

### Low Priority (Suggestions)
| ID | Location | Issue | Suggestion |
|----|----------|-------|------------|
| L1 | [file:line] | [desc] | [suggestion] |

### Positive Observations
- [what's done well]

### Questions for Senior Review
- [architectural questions]
- [pattern questions]
```

### 🧠 Phase 2: Senior Agent Consultation

Based on code type and issues found, consult appropriate senior agent:

**For Frontend Code** - Use **senior-frontend-architect** sub agent:
- Review component architecture issues
- React/Next.js best practices validation
- State management concerns
- Performance optimization strategies
- Accessibility improvements

**For Backend Code** - Use **senior-backend-architect** sub agent:
- API design validation
- Database query optimization
- Security architecture review
- Error handling strategies
- Scalability concerns

**For UI/Design Code** - Use **ui-ux-master** sub agent:
- Design system compliance
- User experience issues
- Responsive design review
- Accessibility deep-dive

**Senior Agent Questions**:
1. Are the Critical/High issues correctly identified?
2. What's the best approach to fix each issue?
3. Are there deeper architectural concerns?
4. What patterns should be followed for fixes?
5. Are there similar issues elsewhere in codebase?

**Senior Agent Output**:
```
## Senior Review Assessment

### Issue Validation
| Issue ID | Senior Assessment | Recommended Approach |
|----------|-------------------|----------------------|
| C1 | [agree/disagree/modify] | [approach] |
| H1 | [agree/disagree/modify] | [approach] |

### Additional Issues Found
| Priority | Location | Issue | Fix |
|----------|----------|-------|-----|
| [level] | [file:line] | [desc] | [fix] |

### Architectural Recommendations
[broader recommendations beyond individual fixes]

### Pattern Guidance
For each fix, follow these patterns:
- [pattern 1 with code example]
- [pattern 2 with code example]

### Related Code to Check
[other files that might have similar issues]
```

### 🔧 Phase 3: Fix Implementation

Then use the **spec-developer** sub agent to:

- Fix all Critical issues (mandatory)
- Fix all High priority issues (mandatory)
- Fix Medium issues following senior guidance
- Document why Low issues were deferred

**Fix Order**:
1. Security issues first
2. Bug fixes second
3. Performance issues third
4. Code quality improvements last

**For Each Fix**:
```
// Issue: [ID] - [description]
// Senior Guidance: [recommendation]
// Before: [what was wrong]
// After: [what was fixed]
```

**Fix Rules**:
- [ ] Follow senior agent recommendations exactly
- [ ] Match existing code patterns from CLAUDE.md
- [ ] Don't introduce new patterns without reason
- [ ] Add comments explaining non-obvious fixes
- [ ] Run existing tests after each fix

### ✅ Phase 4: Verification Review

Then use the **spec-reviewer** sub agent to verify:

**Fix Verification**:
| Issue ID | Fixed | Correct | Side Effects |
|----------|-------|---------|--------------|
| C1 | [yes/no] | [yes/no] | [none/describe] |
| H1 | [yes/no] | [yes/no] | [none/describe] |
| M1 | [yes/no] | [yes/no] | [none/describe] |

**New Issues Check**:
- [ ] No new security issues introduced
- [ ] No new bugs introduced
- [ ] No performance regressions
- [ ] Code style still consistent

**Quality Score Recalculation**:
- Initial Score: [x]%
- After Fixes: [y]%

### 🔄 Quality Gate Decision

**Score ≥90%**: Review complete
**Score <90%**: Identify remaining issues and return to Phase 3

**If returning to Phase 3, provide**:
- Specific issues still not resolved
- Why previous fix was insufficient
- More detailed guidance for fix

### 📝 Phase 5: Documentation (Final)

After all fixes verified:

- [ ] Update inline documentation if logic changed
- [ ] Update JSDoc comments for modified functions
- [ ] Create review summary in docs/{date}/reviews/
- [ ] Note any deferred Low priority issues for future

**Review Summary Document**:
Save to `docs/{YYYY_MM_DD}/reviews/review-{target}-summary.md`

```
## Code Review Summary

### Target
[files/folders reviewed]

### Date
[YYYY-MM-DD]

### Reviewers
- spec-reviewer (initial + verification)
- [senior agent consulted]

### Results
- Initial Score: [x]%
- Final Score: [y]%
- Iterations: [count]

### Issues Resolved
| ID | Priority | Description | Resolution |
|----|----------|-------------|------------|
| C1 | Critical | [desc] | [how fixed] |

### Deferred Issues
| ID | Priority | Reason Deferred |
|----|----------|-----------------|
| L1 | Low | [reason] |

### Recommendations for Future
- [recommendation 1]
- [recommendation 2]

### Related Reviews Needed
- [other code that should be reviewed]
```

---

## Output Summary

```
Review: [target]
Status: Complete

Initial Score: [x]%
Final Score: [y]%
Iterations: [count]

Senior Agent(s) Consulted: [list]

Issues Fixed:
  Critical: [count]
  High: [count]
  Medium: [count]

Issues Deferred (Low):
  - [issue 1]
  - [issue 2]

Files Modified: [list]
Documentation Updated: [list]

Follow-up Recommendations:
  - [recommendation]
```

**Begin execution now by first reading CLAUDE.md and project conventions.**
```