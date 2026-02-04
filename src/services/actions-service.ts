/**
 * Actions Service - Handles action execution for actionable content
 */

import { apiPost } from '@/lib/api-client';
import type { EmailComposerCardData } from '@/types/chat';

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: Record<string, unknown>;
}

/**
 * Send an email through the backend
 */
export async function sendEmail(emailData: EmailComposerCardData): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/send-email', {
      to: emailData.to,
      cc: emailData.cc,
      bcc: emailData.bcc,
      subject: emailData.subject,
      body: emailData.body,
      attachments: emailData.attachments,
      related_task_id: emailData.related_task_id,
      related_client_id: emailData.related_client_id,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      message: 'Email sent successfully',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Execute a compliance action (resolve issue, etc.)
 */
export async function resolveComplianceIssue(
  clientId: string,
  issueId: string,
  resolution: string
): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/resolve-compliance', {
      client_id: clientId,
      issue_id: issueId,
      resolution,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to resolve compliance issue',
      };
    }

    return {
      success: true,
      message: 'Compliance issue resolved',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error resolving compliance issue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resolve compliance issue',
    };
  }
}

/**
 * Generate a report
 */
export async function generateReport(
  reportType: string,
  params: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/generate-report', {
      report_type: reportType,
      ...params,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to generate report',
      };
    }

    return {
      success: true,
      message: 'Report generated successfully',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate report',
    };
  }
}

/**
 * Generic action executor
 */
export async function executeAction(
  actionType: string,
  entityType: string,
  entityId: string,
  payload?: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/execute', {
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      payload,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || `Failed to execute ${actionType}`,
      };
    }

    return {
      success: true,
      message: `Action ${actionType} completed successfully`,
      data: response.data?.data,
    };
  } catch (error) {
    console.error(`Error executing action ${actionType}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to execute ${actionType}`,
    };
  }
}

/**
 * Copy content to clipboard (client-side)
 */
export async function copyToClipboard(content: string): Promise<ActionResult> {
  try {
    await navigator.clipboard.writeText(content);
    return {
      success: true,
      message: 'Copied to clipboard',
    };
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return {
      success: false,
      error: 'Failed to copy to clipboard',
    };
  }
}

// =============================================================================
// Phase 2: Business Intelligence Actions
// =============================================================================

/**
 * Send a proposal to a client
 */
export async function sendProposalToClient(
  proposalId: string,
  clientId: string,
  selectedProductId?: string
): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/send-proposal', {
      proposal_id: proposalId,
      client_id: clientId,
      selected_product_id: selectedProductId,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to send proposal',
      };
    }

    return {
      success: true,
      message: 'Proposal sent to client',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error sending proposal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send proposal',
    };
  }
}

/**
 * Download a proposal as PDF
 */
export async function downloadProposalPdf(proposalId: string): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/download-proposal', {
      proposal_id: proposalId,
      format: 'pdf',
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to generate PDF',
      };
    }

    // Handle download URL if returned
    const downloadUrl = response.data?.data?.download_url as string | undefined;
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }

    return {
      success: true,
      message: 'PDF generated',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error downloading proposal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download proposal',
    };
  }
}

/**
 * Rebalance a portfolio
 */
export async function rebalancePortfolio(clientId: string): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/rebalance-portfolio', {
      client_id: clientId,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to rebalance portfolio',
      };
    }

    return {
      success: true,
      message: 'Portfolio rebalance initiated',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error rebalancing portfolio:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to rebalance portfolio',
    };
  }
}

/**
 * Export portfolio report
 */
export async function exportPortfolioReport(
  clientId: string,
  format: 'pdf' | 'csv' | 'xlsx' = 'pdf'
): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/export-portfolio', {
      client_id: clientId,
      format,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to export portfolio',
      };
    }

    // Handle download URL if returned
    const downloadUrl = response.data?.data?.download_url as string | undefined;
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }

    return {
      success: true,
      message: 'Portfolio report exported',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error exporting portfolio:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export portfolio',
    };
  }
}

/**
 * Compare portfolio to benchmark
 */
export async function comparePortfolioToBenchmark(
  clientId: string,
  benchmarkId?: string
): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/compare-benchmark', {
      client_id: clientId,
      benchmark_id: benchmarkId || 'sp500', // Default to S&P 500
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to compare to benchmark',
      };
    }

    return {
      success: true,
      message: 'Benchmark comparison complete',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error comparing to benchmark:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to compare to benchmark',
    };
  }
}

// =============================================================================
// Phase 3: Workflow Actions
// =============================================================================

/**
 * Schedule a calendar event
 */
export async function scheduleEvent(eventData: {
  title: string;
  start: string;
  end?: string;
  type: string;
  client_id?: string;
  description?: string;
  location?: string;
}): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/schedule-event', eventData);

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to schedule event',
      };
    }

    return {
      success: true,
      message: 'Event scheduled successfully',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error scheduling event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to schedule event',
    };
  }
}

/**
 * Upload a document
 */
export async function uploadDocument(
  file: File,
  entityType: 'client' | 'policy' | 'task',
  entityId: string
): Promise<ActionResult> {
  try {
    // In a real implementation, this would use FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId);

    const response = await fetch('/api/actions/upload-document', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.message || 'Failed to upload document',
      };
    }

    return {
      success: true,
      message: 'Document uploaded successfully',
      data: result.data,
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload document',
    };
  }
}

/**
 * Snooze a reminder
 */
export async function snoozeReminder(
  reminderId: string,
  duration: string
): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/snooze-reminder', {
      reminder_id: reminderId,
      duration,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to snooze reminder',
      };
    }

    return {
      success: true,
      message: `Reminder snoozed for ${duration}`,
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error snoozing reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to snooze reminder',
    };
  }
}

/**
 * Complete a reminder
 */
export async function completeReminder(reminderId: string): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/complete-reminder', {
      reminder_id: reminderId,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to complete reminder',
      };
    }

    return {
      success: true,
      message: 'Reminder marked as complete',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error completing reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete reminder',
    };
  }
}

/**
 * Initiate policy renewal
 */
export async function initiateRenewal(policyId: string): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/initiate-renewal', {
      policy_id: policyId,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to initiate renewal',
      };
    }

    return {
      success: true,
      message: 'Renewal process initiated',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error initiating renewal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate renewal',
    };
  }
}

/**
 * Save meeting notes
 */
export async function saveMeetingNotes(
  meetingId: string,
  notes: {
    action_items?: Array<{ id: string; description: string; completed?: boolean; owner?: string; due_date?: string }>;
    notes?: string;
    follow_up_date?: string;
  }
): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/save-meeting-notes', {
      meeting_id: meetingId,
      ...notes,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to save meeting notes',
      };
    }

    return {
      success: true,
      message: 'Meeting notes saved',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error saving meeting notes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save meeting notes',
    };
  }
}

/**
 * Advance a process step
 */
export async function advanceProcessStep(
  processId: string,
  currentStep: number
): Promise<ActionResult> {
  try {
    const response = await apiPost<{ success: boolean; message?: string; data?: Record<string, unknown> }>('/api/actions/advance-step', {
      process_id: processId,
      current_step: currentStep,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to advance step',
      };
    }

    return {
      success: true,
      message: 'Advanced to next step',
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error advancing step:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to advance step',
    };
  }
}

/**
 * Perform bulk task operations
 */
export async function bulkTaskAction(
  action: 'complete' | 'reassign' | 'delete',
  taskIds: string[],
  assignee?: string
): Promise<ActionResult> {
  try {
    const response = await apiPost<{
      success: boolean;
      message?: string;
      data?: {
        processed_count: number;
        results: Array<{ task_id: string; success: boolean; error?: string }>;
      };
    }>('/api/actions/bulk-tasks', {
      action,
      task_ids: taskIds,
      assignee,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to perform bulk task action',
      };
    }

    return {
      success: true,
      message: `Bulk ${action} completed for ${response.data?.data?.processed_count || 0} tasks`,
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error in bulk task action:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform bulk task action',
    };
  }
}

/**
 * Perform bulk renewal operations
 */
export async function bulkRenewalAction(
  action: 'renew' | 'mark_reviewed' | 'flag_for_review',
  policyIds: string[],
  notes?: string
): Promise<ActionResult> {
  try {
    const response = await apiPost<{
      success: boolean;
      message?: string;
      data?: {
        processed_count: number;
        results: Array<{ policy_id: string; success: boolean; error?: string }>;
      };
    }>('/api/actions/bulk-renewal', {
      action,
      policy_ids: policyIds,
      notes,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Failed to perform bulk renewal action',
      };
    }

    return {
      success: true,
      message: `Bulk ${action} completed for ${response.data?.data?.processed_count || 0} policies`,
      data: response.data?.data,
    };
  } catch (error) {
    console.error('Error in bulk renewal action:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform bulk renewal action',
    };
  }
}
