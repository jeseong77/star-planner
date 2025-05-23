// Represents a predefined routine action within a Task
export interface RoutineActionDefinition {
  id: string;
  name: string;
  loggedCount: number;
}

// Represents an individual Action taken by the user for a Task
export interface Action {
  id: string;
  taskId: string;
  timestamp: string; // ISO 8601 date-time string
  description?: string;
  isRoutineLog: boolean;
  routineActionDefId?: string;
  notes?: string;
  immediateResult?: string;
}

// Represents a Task to solve a Problem
export interface Task {
  id: string;
  problemId: string;
  name: string;
  isCompleted: boolean;
  completionDate?: string; // ISO 8601 date-time string
  createdAt: string; // ISO 8601 date-time string
  actionIds: string[];
  routineActions: RoutineActionDefinition[];
}

// Represents a Problem within the user's Situation
export interface Problem {
  id: string;
  name: string;
  isResolved: boolean;
  resolutionDate?: string; // ISO 8601 date-time string
  finalOutcome?: string;
  taskIds: string[];
  createdAt: string; // ISO 8601 date-time string
}

// Represents the user's overall Situation
export interface Situation {
  id: string;
  description?: string;
  problemIds: string[];
  lastModified: string; // ISO 8601 date-time string
}

// Represents a logged Result or Achievement
export interface Result {
  id: string;
  problemId: string;
  description: string;
  dateAchieved: string; // ISO 8601 date-time string
  notes?: string;
  sourceType?:
    | "ACTION"
    | "TASK_COMPLETION"
    | "PROBLEM_MILESTONE"
    | "PROBLEM_RESOLUTION"
    | "MANUAL_LOG";
  sourceId?: string;
  createdAt: string; // ISO 8601 date-time string
}

// You might also want to define the shape of your entire app's state here
// if it's used in multiple places, or keep it co-located with the store definition.
// For now, we'll define AppState within appStore.ts but use these base types.
