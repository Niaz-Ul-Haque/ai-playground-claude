// Streaming Chat API - Phase 1 & 5: Core Infrastructure + Safety Patterns
// New streaming endpoint that uses the tool system with confirmation management

import { z } from 'zod';
import { routeIntent, updateContextAfterExecution } from '@/lib/ai/intent-router';
import {
  executePlan,
  handleUndo,
} from '@/lib/ai/tool-executor';
import {
  buildResponse,
  buildDisambiguationResponse,
  buildConfirmationPrompt,
  buildClarificationPrompt,
} from '@/lib/ai/response-builder-v2';
import {
  confirmAction,
  cancelConfirmation,
  type PendingConfirmation,
} from '@/lib/chat/confirmation-manager';
import { logConfirmation } from '@/lib/chat/audit-logger';
import type { IntentRoutingContext, PendingAction } from '@/types/execution-plan';
import type { StreamChunk } from '@/types/chat-session';

// Request schema
const requestSchema = z.object({
  message: z.string().min(1),
  context: z
    .object({
      focusedTaskId: z.string().optional(),
      focusedClientId: z.string().optional(),
      focusedOpportunityId: z.string().optional(),
      lastIntent: z.string().optional(),
      lastTool: z.string().optional(),
      pendingAction: z.any().optional(),
      pendingConfirmation: z.any().optional(), // Phase 5: Confirmation support
    })
    .optional(),
  stream: z.boolean().optional().default(true),
});

// In-memory pending actions store (legacy, kept for backward compatibility)
const pendingActions = new Map<string, PendingAction>();

/**
 * Create a streaming response
 */
function createStreamingResponse(
  generateChunks: (controller: ReadableStreamDefaultController<Uint8Array>) => Promise<void>
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await generateChunks(controller);
      } catch (error) {
        const errorChunk: StreamChunk = {
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Send a stream chunk
 */
function sendChunk(
  controller: ReadableStreamDefaultController<Uint8Array>,
  chunk: StreamChunk
) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
}

// Helper to check if message is a confirmation response
function isConfirmationResponse(message: string): { isConfirm: boolean; isCancel: boolean; actionId?: string } {
  const lowerMessage = message.toLowerCase().trim();

  // Check for explicit confirmation patterns
  const confirmPatterns = [
    /^confirm\s*(action)?\s*([a-z0-9-]+)?$/i,
    /^yes,?\s*(confirm|proceed|do it)?$/i,
    /^go ahead$/i,
    /^proceed$/i,
    /^approved?$/i,
  ];

  // Check for cancellation patterns
  const cancelPatterns = [
    /^cancel\s*(action)?\s*([a-z0-9-]+)?$/i,
    /^no,?\s*(cancel|stop|don't)?$/i,
    /^nevermind$/i,
    /^abort$/i,
    /^stop$/i,
  ];

  for (const pattern of confirmPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      return { isConfirm: true, isCancel: false, actionId: match[2] };
    }
  }

  for (const pattern of cancelPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      return { isConfirm: false, isCancel: true, actionId: match[2] };
    }
  }

  return { isConfirm: false, isCancel: false };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context: rawContext, stream } = requestSchema.parse(body);

    // Build routing context
    const context: IntentRoutingContext = {
      focusedClientId: rawContext?.focusedClientId,
      focusedTaskId: rawContext?.focusedTaskId,
      focusedOpportunityId: rawContext?.focusedOpportunityId,
      lastIntent: rawContext?.lastIntent as IntentRoutingContext['lastIntent'],
      lastTool: rawContext?.lastTool,
      pendingAction: rawContext?.pendingAction as PendingAction | undefined,
    };

    // Phase 5: Check for pending confirmation from new manager
    const pendingConfirmation = rawContext?.pendingConfirmation as PendingConfirmation | undefined;

    // Check for pending action if stored (legacy)
    if (context.pendingAction?.id) {
      const storedAction = pendingActions.get(context.pendingAction.id);
      if (storedAction) {
        context.pendingAction = storedAction;
      }
    }

    // Phase 5: Check if this message is a confirmation/cancellation response
    const confirmResponse = isConfirmationResponse(message);
    if ((confirmResponse.isConfirm || confirmResponse.isCancel) && pendingConfirmation) {
      const confirmationId = confirmResponse.actionId || pendingConfirmation.id;

      if (stream) {
        return createStreamingResponse(async (controller) => {
          if (confirmResponse.isConfirm) {
            // Confirm the action
            sendChunk(controller, { type: 'thinking', status: 'Processing confirmation...' });

            const confirmResult = confirmAction(confirmationId);

            if (confirmResult.shouldExecute && confirmResult.confirmation) {
              // Execute the confirmed action
              sendChunk(controller, { type: 'thinking', status: 'Executing confirmed action...' });

              const plan = confirmResult.confirmation.action.plan;
              const result = await executePlan(plan, {
                focusedClientId: context.focusedClientId,
                focusedTaskId: context.focusedTaskId,
                focusedOpportunityId: context.focusedOpportunityId,
              });

              // Log the confirmation
              logConfirmation(
                confirmationId,
                true,
                plan.entity,
                confirmResult.confirmation.affectedEntity?.id,
                confirmResult.confirmation.affectedEntity?.name
              );

              // Build response
              const response = buildResponse(plan, result);
              sendChunk(controller, { type: 'text', content: response.text });
              if (response.blocks.length > 0) {
                sendChunk(controller, { type: 'blocks', blocks: response.blocks });
              }
              sendChunk(controller, {
                type: 'context',
                context: { ...response.contextUpdates, lastIntent: plan.intent },
              });
            } else {
              sendChunk(controller, {
                type: 'text',
                content: confirmResult.message || 'Could not process confirmation.',
              });
            }
          } else {
            // Cancel the action
            const cancelResult = cancelConfirmation(confirmationId);

            // Log the cancellation
            if (pendingConfirmation.affectedEntity) {
              logConfirmation(
                confirmationId,
                false,
                pendingConfirmation.affectedEntity.type,
                pendingConfirmation.affectedEntity.id,
                pendingConfirmation.affectedEntity.name
              );
            }

            sendChunk(controller, {
              type: 'text',
              content: cancelResult.message || 'Action cancelled. No changes were made.',
            });
          }

          sendChunk(controller, { type: 'done' });
        });
      }
    }

    // Handle streaming response
    if (stream) {
      return createStreamingResponse(async (controller) => {
        // Send thinking status
        sendChunk(controller, { type: 'thinking', status: 'Processing your request...' });

        // Route the intent
        const classificationResult = routeIntent(message, context);
        const { plan, confirmationMessage, needsUserInput, userPrompt } = classificationResult;

        // Handle special cases
        if (plan.intent === 'undo') {
          sendChunk(controller, { type: 'thinking', status: 'Undoing last action...' });
          const undoResult = await handleUndo();
          const response = buildResponse(plan, undoResult);

          // Send text
          sendChunk(controller, { type: 'text', content: response.text });

          // Send blocks if any
          if (response.blocks.length > 0) {
            sendChunk(controller, { type: 'blocks', blocks: response.blocks });
          }

          // Send context
          sendChunk(controller, {
            type: 'context',
            context: {
              ...response.contextUpdates,
              lastIntent: plan.intent,
            },
          });

          sendChunk(controller, { type: 'done' });
          return;
        }

        // Handle multi-match (disambiguation needed)
        if (plan.multiMatch) {
          const response = buildDisambiguationResponse(plan);
          sendChunk(controller, { type: 'text', content: response.text });
          sendChunk(controller, { type: 'blocks', blocks: response.blocks });
          sendChunk(controller, { type: 'done' });
          return;
        }

        // Handle clarification needed
        if (plan.clarificationNeeded || (needsUserInput && userPrompt)) {
          const response = buildClarificationPrompt(plan);
          sendChunk(controller, { type: 'text', content: response.text });
          sendChunk(controller, { type: 'done' });
          return;
        }

        // Handle confirmation required
        if (plan.requiresConfirmation && !plan.arguments._confirmed) {
          // Store pending action
          const pendingAction: PendingAction = {
            id: `pending-${Date.now()}`,
            plan,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
            message: confirmationMessage || `Are you sure you want to ${plan.tool.replace(/_/g, ' ')}?`,
          };
          pendingActions.set(pendingAction.id, pendingAction);

          const response = buildConfirmationPrompt(plan, pendingAction.message);
          sendChunk(controller, { type: 'text', content: response.text });
          sendChunk(controller, { type: 'blocks', blocks: response.blocks });
          sendChunk(controller, {
            type: 'context',
            context: {
              pendingAction,
              lastIntent: plan.intent,
            },
          });
          sendChunk(controller, { type: 'done' });
          return;
        }

        // Execute the tool
        sendChunk(controller, { type: 'thinking', status: `Executing ${plan.tool.replace(/_/g, ' ')}...` });

        const result = await executePlan(plan, {
          focusedClientId: context.focusedClientId,
          focusedTaskId: context.focusedTaskId,
          focusedOpportunityId: context.focusedOpportunityId,
        });

        // Build response
        const response = buildResponse(plan, result);

        // Stream the text content
        sendChunk(controller, { type: 'text', content: response.text });

        // Send blocks
        if (response.blocks.length > 0) {
          sendChunk(controller, { type: 'blocks', blocks: response.blocks });
        }

        // Update context
        const resultData = result.data as { id?: string; name?: string; title?: string } | undefined;
        const updatedContext = updateContextAfterExecution(context, plan, {
          entityId: resultData?.id,
          entityType: plan.entity,
          entityName: resultData?.name || resultData?.title,
        });

        sendChunk(controller, {
          type: 'context',
          context: {
            focusedClientId: updatedContext.focusedClientId,
            focusedTaskId: updatedContext.focusedTaskId,
            focusedOpportunityId: updatedContext.focusedOpportunityId,
            lastIntent: plan.intent,
            tasksUpdated: response.contextUpdates.tasksUpdated,
            clientsUpdated: response.contextUpdates.clientsUpdated,
          },
        });

        sendChunk(controller, { type: 'done' });
      });
    }

    // Non-streaming response (fallback)
    const classificationResult = routeIntent(message, context);
    const { plan, confirmationMessage, needsUserInput, userPrompt } = classificationResult;

    // Handle undo
    if (plan.intent === 'undo') {
      const undoResult = await handleUndo();
      const response = buildResponse(plan, undoResult);
      return Response.json({
        content: response.text,
        blocks: response.blocks,
        cards: response.cards,
        context: response.contextUpdates,
        undoAvailable: response.undoAvailable,
      });
    }

    // Handle special cases
    if (plan.multiMatch) {
      const response = buildDisambiguationResponse(plan);
      return Response.json({
        content: response.text,
        blocks: response.blocks,
        needsSelection: true,
        selectionOptions: plan.multiMatch.matches,
      });
    }

    if (plan.clarificationNeeded || (needsUserInput && userPrompt)) {
      const response = buildClarificationPrompt(plan);
      return Response.json({
        content: response.text,
        needsClarification: true,
        clarification: plan.clarificationNeeded,
      });
    }

    if (plan.requiresConfirmation && !plan.arguments._confirmed) {
      const pendingAction: PendingAction = {
        id: `pending-${Date.now()}`,
        plan,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        message: confirmationMessage || `Are you sure you want to ${plan.tool.replace(/_/g, ' ')}?`,
      };
      pendingActions.set(pendingAction.id, pendingAction);

      const response = buildConfirmationPrompt(plan, pendingAction.message);
      return Response.json({
        content: response.text,
        blocks: response.blocks,
        needsConfirmation: true,
        pendingAction,
      });
    }

    // Execute
    const result = await executePlan(plan);
    const response = buildResponse(plan, result);

    // Update context
    const resultData = result.data as { id?: string; name?: string; title?: string } | undefined;
    const updatedContext = updateContextAfterExecution(context, plan, {
      entityId: resultData?.id,
      entityType: plan.entity,
      entityName: resultData?.name || resultData?.title,
    });

    return Response.json({
      content: response.text,
      blocks: response.blocks,
      cards: response.cards,
      context: {
        focusedClientId: updatedContext.focusedClientId,
        focusedTaskId: updatedContext.focusedTaskId,
        focusedOpportunityId: updatedContext.focusedOpportunityId,
        lastIntent: plan.intent,
        lastTool: plan.tool,
        tasksUpdated: response.contextUpdates.tasksUpdated,
        clientsUpdated: response.contextUpdates.clientsUpdated,
      },
      undoAvailable: response.undoAvailable,
      undoDescription: response.undoDescription,
    });
  } catch (error) {
    console.error('Chat stream API error:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Cleanup expired pending actions periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [id, action] of pendingActions.entries()) {
      if (new Date(action.expiresAt).getTime() < now) {
        pendingActions.delete(id);
      }
    }
  }, 60000); // Every minute
}
