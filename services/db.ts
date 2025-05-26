import * as SQLite from "expo-sqlite";
import type {
  Situation,
  Problem,
  Task,
  Action,
  Result,
  // RoutineActionDefinition is part of Task type and handled via JSON
} from "../types"; // Adjust path

const DATABASE_NAME = "StarPlanner.db";

// --- Database Instance ---
let _dbInstance: SQLite.SQLiteDatabase | null = null;

const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (_dbInstance !== null) {
    return _dbInstance;
  }
  _dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return _dbInstance;
};

// --- Database Initialization and Schema Setup ---
export const initDB = async (): Promise<void> => {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS situation (
      id TEXT PRIMARY KEY NOT NULL,
      description TEXT,
      lastModified TEXT NOT NULL -- Removed problemIds column, fixed comma
    );

    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      isResolved INTEGER NOT NULL DEFAULT 0, -- 0 for false, 1 for true
      resolutionDate TEXT,
      finalOutcome TEXT,
      createdAt TEXT NOT NULL
      -- taskIds is not a column here; managed in app state
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      problemId TEXT NOT NULL,
      name TEXT NOT NULL,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      completionDate TEXT,
      createdAt TEXT NOT NULL,
      routineActions TEXT, -- Store as JSON string: RoutineActionDefinition[]
      -- actionIds is not a column here; managed in app state
      FOREIGN KEY (problemId) REFERENCES problems(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS actions (
      id TEXT PRIMARY KEY NOT NULL,
      taskId TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      description TEXT,
      isRoutineLog INTEGER NOT NULL DEFAULT 0,
      routineActionDefId TEXT,
      notes TEXT,
      immediateResult TEXT,
      FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY NOT NULL,
      problemId TEXT NOT NULL,
      description TEXT NOT NULL,
      dateAchieved TEXT NOT NULL,
      notes TEXT,
      sourceType TEXT,
      sourceId TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (problemId) REFERENCES problems(id) ON DELETE CASCADE
    );
  `);
  console.log("Database initialized successfully (SQLite - Modern API)");
};

// --- Helper Type for Raw Rows ---
// These helpers map closely to what's fetched before conversion to richer app types.

// For Situation, the row directly maps to the simplified Situation type
// No separate SituationRow needed if types.ts Situation has no problemIds

interface ProblemRow extends Omit<Problem, "isResolved" | "taskIds"> {
  isResolved: number;
  // taskIds is intentionally omitted as it's not a direct DB column
}
interface TaskRow
  extends Omit<Task, "isCompleted" | "routineActions" | "actionIds"> {
  isCompleted: number;
  routineActions: string | null; // routineActions stored as JSON string or null
  // actionIds is intentionally omitted
}
interface ActionRow extends Omit<Action, "isRoutineLog"> {
  isRoutineLog: number;
}

// --- CRUD Service Functions ---

// SITUATION
/**
 * Fetches the single Situation object.
 * The Situation type in types.ts no longer has problemIds.
 */
export const getSituationFromDB = async (): Promise<Situation | null> => {
  const db = await getDatabase();
  // The Situation type from types.ts now matches this structure directly
  const row = await db.getFirstAsync<Situation>(
    "SELECT * FROM situation WHERE id = ? LIMIT 1;",
    ["current-situation"]
  );
  // Ensure description is undefined if null, to match optional '?' in type
  return row ? { ...row, description: row.description ?? undefined } : null;
};

/**
 * Updates or creates the single Situation object.
 * The Situation object passed in should not have problemIds, as per the types.ts update.
 */
export const updateSituationInDB = async (
  situation: Situation // This Situation type no longer has problemIds
): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  return db.runAsync(
    "INSERT OR REPLACE INTO situation (id, description, lastModified) VALUES (?, ?, ?);",
    [
      situation.id,
      situation.description || null, // Store null if description is undefined/empty string
      situation.lastModified,
    ]
  );
};

// PROBLEMS
/**
 * Fetches all problems.
 * taskIds will be initialized as an empty array, to be populated by app logic if needed.
 */
export const getProblemsFromDB = async (): Promise<Problem[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProblemRow>("SELECT * FROM problems ORDER BY createdAt DESC;");
  return rows.map(row => ({
    ...row,
    isResolved: !!row.isResolved,
    taskIds: [], // Initialize taskIds as empty; appStore will manage actual task associations
  }));
};

/**
 * Adds a new problem.
 * The Problem object's taskIds field is not saved to this table.
 */
export const addProblemToDB = async (problem: Problem): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  return db.runAsync(
    "INSERT INTO problems (id, name, isResolved, resolutionDate, finalOutcome, createdAt) VALUES (?, ?, ?, ?, ?, ?);",
    [
      problem.id,
      problem.name,
      problem.isResolved ? 1 : 0,
      problem.resolutionDate || null,
      problem.finalOutcome || null,
      problem.createdAt,
    ]
  );
};

/**
 * Updates an existing problem.
 * The Problem object's taskIds field is not updated in this table.
 */
export const updateProblemInDB = async (problem: Problem): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  return db.runAsync(
    "UPDATE problems SET name = ?, isResolved = ?, resolutionDate = ?, finalOutcome = ? WHERE id = ?;",
    [
      problem.name,
      problem.isResolved ? 1 : 0,
      problem.resolutionDate || null,
      problem.finalOutcome || null,
      problem.id,
    ]
  );
};

export const deleteProblemFromDB = async (problemId: string): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  return db.runAsync("DELETE FROM problems WHERE id = ?;", [problemId]);
};

// TASKS
/**
 * Fetches all tasks.
 * actionIds will be initialized as an empty array.
 * routineActions are parsed from JSON.
 */
export const getTasksFromDB = async (): Promise<Task[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TaskRow>("SELECT * FROM tasks ORDER BY createdAt DESC;");
  return rows.map(row => ({
    ...row,
    isCompleted: !!row.isCompleted,
    routineActions: row.routineActions ? JSON.parse(row.routineActions) : [],
    actionIds: [], // Initialize actionIds as empty; appStore will manage actual action associations
  }));
};

/**
 * Fetches tasks for a specific problem.
 * actionIds will be initialized as an empty array.
 */
export const getTasksForProblemFromDB = async (problemId: string): Promise<Task[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TaskRow>(
    "SELECT * FROM tasks WHERE problemId = ? ORDER BY createdAt ASC;",
    [problemId]
  );
  return rows.map(row => ({
    ...row,
    isCompleted: !!row.isCompleted,
    routineActions: row.routineActions ? JSON.parse(row.routineActions) : [],
    actionIds: [],
  }));
};

/**
 * Adds a new task.
 * The Task object's actionIds field is not saved to this table.
 * routineActions are stringified to JSON.
 */
export const addTaskToDB = async (task: Task): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  return db.runAsync(
    "INSERT INTO tasks (id, problemId, name, isCompleted, completionDate, createdAt, routineActions) VALUES (?, ?, ?, ?, ?, ?, ?);",
    [
      task.id,
      task.problemId,
      task.name,
      task.isCompleted ? 1 : 0,
      task.completionDate || null,
      task.createdAt,
      JSON.stringify(task.routineActions || []),
    ]
  );
};

/**
 * Updates an existing task.
 * The Task object's actionIds field is not updated in this table.
 * routineActions are stringified to JSON.
 */
export const updateTaskInDB = async (task: Task): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  return db.runAsync(
    "UPDATE tasks SET name = ?, isCompleted = ?, completionDate = ?, routineActions = ? WHERE id = ?;",
    [
      task.name,
      task.isCompleted ? 1 : 0,
      task.completionDate || null,
      JSON.stringify(task.routineActions || []),
      task.id,
    ]
  );
};

export const deleteTaskFromDB = async (taskId: string): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  return db.runAsync("DELETE FROM tasks WHERE id = ?;", [taskId]);
};

// ACTIONS
/**
 * Fetches all actions.
 */
export const getActionsFromDB = async (): Promise<Action[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ActionRow>("SELECT * FROM actions ORDER BY timestamp DESC;");
  return rows.map(row => ({
    ...row,
    isRoutineLog: !!row.isRoutineLog,
  }));
};

/**
 * Fetches actions for a specific task.
 */
export const getActionsForTaskFromDB = async (taskId: string): Promise<Action[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ActionRow>(
    "SELECT * FROM actions WHERE taskId = ? ORDER BY timestamp ASC;",
    [taskId]
  );
  return rows.map(row => ({
    ...row,
    isRoutineLog: !!row.isRoutineLog,
  }));
};

export const addActionToDB = async (action: Action): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  return db.runAsync(
    "INSERT INTO actions (id, taskId, timestamp, description, isRoutineLog, routineActionDefId, notes, immediateResult) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
    [
      action.id,
      action.taskId,
      action.timestamp,
      action.description || null,
      action.isRoutineLog ? 1 : 0,
      action.routineActionDefId || null,
      action.notes || null,
      action.immediateResult || null,
    ]
  );
};

// RESULTS (Assuming Result type does not contain child ID arrays that need special handling here)
export const getResultsFromDB = async (): Promise<Result[]> => {
  const db = await getDatabase();
  return db.getAllAsync<Result>("SELECT * FROM results ORDER BY dateAchieved DESC;");
};

export const addResultToDB = async (result: Result): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  return db.runAsync(
    "INSERT INTO results (id, problemId, description, dateAchieved, notes, sourceType, sourceId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
    [
      result.id,
      result.problemId,
      result.description,
      result.dateAchieved,
      result.notes || null,
      result.sourceType || null,
      result.sourceId || null,
      result.createdAt,
    ]
  );
};