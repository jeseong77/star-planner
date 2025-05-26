// types.ts
import { Ionicons } from "@expo/vector-icons";

// Represents a predefined routine action within a Task
export interface RoutineActionDefinition {
  id: string;
  name: string;
  loggedCount: number;
}

// Represents an individual Action taken by the user for a Task
export interface Action {
  id: string;
  taskId: string; // Foreign key to Task
  // If actions are also directly linked to problems, a problemId field would be needed here.
  timestamp: string; // ISO 8601 date-time string
  description?: string;
  isRoutineLog: boolean;
  routineActionDefId?: string;
  notes?: string;
  immediateResult?: string;
}

// This ActionItem type seems UI-specific and not a core data entity.
// It can remain as is.
export interface ActionItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  doneCount: number;
  iconColor: string;
  backgroundColor: string;
}

// Represents a Task to solve a Problem
export interface Task {
  id: string;
  problemId: string; // Foreign key to Problem
  name: string;
  isCompleted: boolean;
  completionDate?: string; // ISO 8601 date-time string
  createdAt: string; // ISO 8601 date-time string
  actionIds: string[]; // Stays for now: Represents Actions belonging to this Task
  routineActions: RoutineActionDefinition[];
}

// Represents a Problem within the user's Situation
export interface Problem {
  id: string;
  name: string;
  isResolved: boolean;
  resolutionDate?: string; // ISO 8601 date-time string
  finalOutcome?: string;
  taskIds: string[]; // Stays for now: Represents Tasks belonging to this Problem
  createdAt: string; // ISO 8601 date-time string
}

// Represents the user's overall (single) Situation
export interface Situation {
  id: string; // This will be a fixed ID, e.g., "current-situation"
  description?: string;
  // problemIds: string[]; // REMOVED: Problems implicitly belong to the single situation
  lastModified: string; // ISO 8601 date-time string
}

// Represents a logged Result or Achievement
export interface Result {
  id: string;
  problemId: string; // Foreign key to Problem
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