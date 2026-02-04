export type UserIntent =
  | 'show_todays_tasks'      // "What do I have today?"
  | 'show_task_status'       // "What's the status on client A?"
  | 'show_pending_reviews'   // "What needs my approval?"
  | 'approve_task'           // "Approve that" / "Looks good"
  | 'reject_task'            // "Don't send that" / "Cancel"
  | 'show_client_info'       // "Tell me about John Smith"
  | 'complete_task'          // "Mark the Johnson call as done"
  | 'general_question'       // Anything else
  // Phase 1: Actionable content intents
  | 'draft_email'            // "Draft an email to John"
  | 'send_email'             // "Send the email" / "Send it"
  | 'show_analytics'         // "Show me my performance" / "How am I doing?"
  | 'run_compliance_check'   // "Check compliance for Sarah"
  | 'generate_report'        // "Generate a report for..."
  // Phase 2: Business intelligence intents
  | 'create_proposal'        // "Create a proposal for John"
  | 'compare_options'        // "Compare term vs whole life"
  | 'show_dashboard'         // "Show my dashboard"
  | 'show_portfolio'         // "Show John's portfolio"
  // Phase 3: Workflow intents
  | 'show_calendar'          // "What's on my calendar?"
  | 'schedule_meeting'       // "Schedule a meeting with..."
  | 'set_reminder'           // "Remind me to..."
  | 'track_progress';        // "What's the status of the application?"

export interface ExtractedEntities {
  taskId?: string;
  taskTitle?: string;
  clientId?: string;
  clientName?: string;
  date?: string;
  action?: string;
}

export interface IntentClassification {
  intent: UserIntent;
  entities: ExtractedEntities;
  confidence: number;
}
