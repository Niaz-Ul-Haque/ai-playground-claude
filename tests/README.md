# Ciri Test Suite

Comprehensive test suite for the Ciri financial advisor assistant application.

## Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── setup.ts                      # Global test setup
├── test-utils.tsx                # Shared utilities & factories
├── unit/                         # Unit tests
│   ├── utils/                    # Utility function tests
│   ├── ai/                       # AI parsing logic tests
│   └── mock-data/                # Mock data layer tests
├── components/                   # Component tests
│   ├── cards/                    # Card component tests
│   └── chat/                     # Chat component tests
└── integration/                  # Integration tests
    └── chat-flow.test.tsx        # End-to-end chat flows
```

## Test Categories

### Unit Tests (179 tests)
Test individual functions and modules in isolation.

**Coverage:**
- ✅ Format utilities (currency, dates, initials)
- ✅ Task utilities (status, filtering, validation)
- ✅ AI intent parsing (classification, entities)
- ✅ AI content parsing (card markers)
- ✅ Mock data operations (CRUD, filters)

### Component Tests (54 tests)
Test React components with user interactions.

**Coverage:**
- ✅ Task cards (display, actions, states)
- ✅ Client cards (information, formatting)
- ✅ Review cards (approve/reject, expand)
- ✅ Chat input (typing, sending, validation)
- ✅ Message items (rendering, cards, styling)

### Integration Tests (11 tests)
Test component interactions and workflows.

**Coverage:**
- ✅ Message sending flow
- ✅ Message display flow
- ✅ Input validation
- ✅ Card rendering in messages
- ✅ Multi-message conversations

## Writing Tests

### Basic Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../test-utils';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Using Test Utilities

```typescript
import { createMockTask, createMockClient } from '../test-utils';

// Create mock task
const task = createMockTask({
  title: 'Custom Title',
  status: 'completed',
});

// Create mock client
const client = createMockClient({
  name: 'John Doe',
  portfolioValue: 1000000,
});
```

### Testing User Interactions

```typescript
import { userEvent } from '../test-utils';

it('should handle click', async () => {
  const user = userEvent.setup();
  renderWithProviders(<MyComponent />);

  await user.click(screen.getByRole('button'));
  expect(mockHandler).toHaveBeenCalled();
});
```

### Mocking Context

```typescript
import { vi } from 'vitest';
import * as ChatContext from '@/context/chat-context';

beforeEach(() => {
  vi.spyOn(ChatContext, 'useChatContext').mockReturnValue({
    handleCompleteTask: vi.fn(),
  } as any);
});
```

## Test Conventions

### File Naming
- Test files: `*.test.ts` or `*.test.tsx`
- Mirror source file structure
- Place in appropriate category folder

### Test Naming
- Use descriptive `it()` statements
- Start with "should..."
- Be specific about behavior

```typescript
// Good
it('should display error message when email is invalid', () => {});

// Bad
it('works', () => {});
```

### Test Organization
```typescript
describe('ComponentName', () => {
  describe('feature group', () => {
    it('should do specific thing', () => {});
    it('should handle edge case', () => {});
  });

  describe('another feature', () => {
    it('should do something else', () => {});
  });
});
```

## Debugging Tests

### Run Single Test File
```bash
npm test -- task-card.test.tsx
```

### Run Single Test
```bash
npm test -- -t "should render title"
```

### Run with UI (Recommended)
```bash
npm run test:ui
```
Opens a browser interface for interactive debugging.

### Using console.log
Tests run in jsdom, so `console.log()` works normally:
```typescript
it('debug test', () => {
  const result = myFunction();
  console.log('Result:', result);
  expect(result).toBe(expected);
});
```

## Coverage Reports

Generate coverage with:
```bash
npm run test:coverage
```

Opens HTML report showing:
- Line coverage
- Branch coverage
- Function coverage
- Uncovered lines

**Target:** 80%+ coverage across the board

## Common Patterns

### Testing Async Operations
```typescript
it('should load data', async () => {
  renderWithProviders(<MyComponent />);

  // Wait for element to appear
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Testing Error States
```typescript
it('should display error', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation();

  renderWithProviders(<MyComponent />);

  expect(screen.getByText('Error occurred')).toBeInTheDocument();
  consoleError.mockRestore();
});
```

### Testing Timers
```typescript
import { vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-12-04T12:00:00.000Z'));
});

it('should format date correctly', () => {
  expect(formatDate(new Date())).toBe('Today 12:00 PM');
});
```

## Troubleshooting

### Tests Timing Out
Increase timeout or use fake timers:
```typescript
it('long test', async () => {
  // ... test code
}, 10000); // 10 second timeout
```

### Mock Not Working
Ensure mocks are set up before component renders:
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // Set up mocks here
});
```

### Can't Find Element
Use `screen.debug()` to see rendered output:
```typescript
it('debug render', () => {
  renderWithProviders(<MyComponent />);
  screen.debug(); // Prints HTML to console
});
```

## Best Practices

1. **Arrange-Act-Assert** pattern
   ```typescript
   it('should work', () => {
     // Arrange
     const props = { value: 123 };

     // Act
     render(<Component {...props} />);

     // Assert
     expect(screen.getByText('123')).toBeInTheDocument();
   });
   ```

2. **Test behavior, not implementation**
   - Test what users see and do
   - Don't test internal state directly
   - Use accessible queries (getByRole, getByLabelText)

3. **Keep tests focused**
   - One assertion per test (when possible)
   - Test one thing at a time
   - Use descriptive test names

4. **Use test utilities**
   - Don't repeat setup code
   - Use factories for test data
   - Share common assertions

5. **Clean up after tests**
   ```typescript
   afterEach(() => {
     vi.clearAllMocks();
     cleanup(); // Already done by setup.ts
   });
   ```

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure all tests pass
3. Maintain 80%+ coverage
4. Update this README if needed

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event](https://testing-library.com/docs/user-event/intro)

---

**Last Updated:** December 4, 2025
**Total Tests:** 244
**Pass Rate:** 93%
