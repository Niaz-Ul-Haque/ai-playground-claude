export type UserIntent =
  | 'show_todays_tasks'      // "What do I have today?"
  | 'show_task_status'       // "What's the status on client A?"
  | 'show_pending_reviews'   // "What needs my approval?"
  | 'approve_task'           // "Approve that" / "Looks good"
  | 'reject_task'            // "Don't send that" / "Cancel"
  | 'show_client_info'       // "Tell me about John Smith"
  | 'complete_task'          // "Mark the Johnson call as done"
  | 'general_question';      // Anything else

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
