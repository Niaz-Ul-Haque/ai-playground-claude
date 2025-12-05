import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';
import { parseIntent } from '@/lib/ai/parse-intent';
import { SYSTEM_PROMPT, buildPrompt } from '@/lib/ai/prompts';
import { parseMessageContent } from '@/lib/ai/parse-content';
import { getTasks, updateTask, getClientByName } from '@/lib/mock-data';
import { getTasksForToday, getPendingReviewTasks } from '@/lib/utils/task-utils';
import type { Task } from '@/types/task';
import type { Client } from '@/types/client';
import type { Card } from '@/types/chat';

// Create Google instance with explicit API key
const google = createGoogleGenerativeAI({
  apiKey: 'ASK NIAZ FOR THIS LOL',
});

// Remove edge runtime as it has issues with env variables
// export const runtime = 'edge';

const requestSchema = z.object({
  message: z.string().min(1),
  context: z
    .object({
      focusedTaskId: z.string().optional(),
      focusedClientId: z.string().optional(),
      lastIntent: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context } = requestSchema.parse(body);

    // Parse user intent
    const classification = parseIntent(message, context);
    const { intent, entities } = classification;

    // Get relevant data based on intent
    let tasks = getTasks();
    let focusedTask: Task | undefined;
    let focusedClient: Client | undefined;
    let tasksUpdated = false;

    // Handle specific intents
    switch (intent) {
      case 'show_todays_tasks':
        tasks = getTasksForToday(getTasks());
        break;

      case 'show_pending_reviews':
        tasks = getPendingReviewTasks(getTasks());
        break;

      case 'show_task_status':
        if (entities.clientName) {
          const client = getClientByName(entities.clientName);
          if (client) {
            tasks = getTasks().filter(t => t.clientId === client.id);
            focusedClient = client;
          }
        }
        break;

      case 'show_client_info':
        if (entities.clientName) {
          const client = getClientByName(entities.clientName);
          if (client) {
            focusedClient = client;
            tasks = getTasks().filter(t => t.clientId === client.id);
          }
        }
        break;

      case 'approve_task':
        if (entities.taskId || context?.focusedTaskId) {
          const taskId = entities.taskId || context?.focusedTaskId;
          if (taskId) {
            const task = updateTask(taskId, {
              status: 'completed',
              completedAt: new Date().toISOString(),
            });
            if (task) {
              focusedTask = task;
              tasksUpdated = true;
            }
          }
        }
        break;

      case 'reject_task':
        if (entities.taskId || context?.focusedTaskId) {
          const taskId = entities.taskId || context?.focusedTaskId;
          if (taskId) {
            const task = updateTask(taskId, {
              status: 'pending',
              aiCompleted: false,
              aiCompletionData: undefined,
            });
            if (task) {
              focusedTask = task;
              tasksUpdated = true;
            }
          }
        }
        break;

      case 'complete_task':
        if (entities.taskId || context?.focusedTaskId) {
          const taskId = entities.taskId || context?.focusedTaskId;
          if (taskId) {
            const task = updateTask(taskId, {
              status: 'completed',
              completedAt: new Date().toISOString(),
            });
            if (task) {
              focusedTask = task;
              tasksUpdated = true;
            }
          }
        }
        break;
    }

    // Build prompt with context
    const systemPrompt = SYSTEM_PROMPT;
    const userPrompt = buildPrompt(
      intent,
      {
        tasks: tasks.length > 0 ? tasks : undefined,
        task: focusedTask,
        clients: focusedClient ? [focusedClient] : undefined,
        client: focusedClient,
      },
      context
    );

    // Generate response using Google Gemini
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: `${userPrompt}\n\nUser message: ${message}`,
      temperature: 0.7,
      maxOutputTokens: 6000,
    });

    // Parse content for embedded cards
    const segments = parseMessageContent(text);
    const cards: Card[] = segments
      .filter((s): s is { type: 'card'; card: Card } => s.type === 'card')
      .map(s => s.card);

    // Update context for next message
    const newContext: { focusedTaskId?: string; focusedClientId?: string; lastIntent?: string } = {};
    if (focusedTask) {
      newContext.focusedTaskId = focusedTask.id;
    }
    if (focusedClient) {
      newContext.focusedClientId = focusedClient.id;
    }
    if (intent) {
      newContext.lastIntent = intent;
    }

    return Response.json({
      content: text,
      cards: cards.length > 0 ? cards : undefined,
      context: Object.keys(newContext).length > 0 ? newContext : undefined,
      tasksUpdated,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
