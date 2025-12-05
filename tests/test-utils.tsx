import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ChatProvider } from '@/context/chat-context';
import type { Task } from '@/types/task';
import type { Client } from '@/types/client';

// Mock chat provider with controlled state
interface MockChatProviderProps {
  children: React.ReactNode;
  initialTasks?: Task[];
  initialClients?: Client[];
}

export function MockChatProvider({ children, initialTasks = [], initialClients = [] }: MockChatProviderProps) {
  return <ChatProvider>{children}</ChatProvider>;
}

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => <MockChatProvider>{children}</MockChatProvider>,
    ...options,
  });
}

// Test data factories
export function createMockTask(overrides?: Partial<Task>): Task {
  return {
    id: '1',
    title: 'Test Task',
    description: 'Test task description',
    status: 'pending',
    dueDate: new Date().toISOString(),
    priority: 'medium',
    tags: ['test'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockClient(overrides?: Partial<Client>): Client {
  return {
    id: '1',
    name: 'Test Client',
    email: 'test@example.com',
    phone: '(416) 555-0100',
    riskProfile: 'moderate',
    portfolioValue: 500000,
    accountType: 'TFSA & RRSP',
    birthDate: '1980-01-01T00:00:00.000Z',
    address: '123 Test Street',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M5H 2N2',
    notes: 'Test client notes',
    lastContact: new Date().toISOString(),
    tags: ['test'],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
