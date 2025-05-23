import * as SQLite from "expo-sqlite";
import type {
  Situation,
  Problem,
  Task,
  Action,
  Result,
  RoutineActionDefinition, // Part of Task type
} from "../types"; // Adjust path

const DATABASE_NAME = "StarPlanner.db";

// --- Database Instance ---
// Use the modern asynchronous API to open the database.
// This returns a promise that resolves to the database object.
let _dbInstance: SQLite.SQLiteDatabase | null = null;

const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (_dbInstance !== null) {
    return _dbInstance;
  }
  // The new API directly returns the db instance from openDatabaseAsync
  _dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return _dbInstance;
};

// --- Database Initialization and Schema Setup ---
/**
 * Initializes the database, creating tables if they don't exist.
 * Uses PRAGMA foreign_keys=ON and PRAGMA journal_mode=WAL.
 */
const initDB = async (): Promise<void> => {
  const db = await getDatabase();
  // Use execAsync for batch DDL and PRAGMA statements
  // Note: execAsync does not support parameterized queries.
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS situation (
      id TEXT PRIMARY KEY NOT NULL,
      description TEXT,
      lastModified TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      isResolved INTEGER NOT NULL DEFAULT 0, -- 0 for false, 1 for true
      resolutionDate TEXT,
      finalOutcome TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      problemId TEXT NOT NULL,
      name TEXT NOT NULL,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      completionDate TEXT,
      createdAt TEXT NOT NULL,
      routineActions TEXT, -- Store as JSON string: RoutineActionDefinition[]
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

// --- Helper Type for Raw Rows (booleans as numbers) ---
// This helps with type safety when fetching and before converting to app types
interface ProblemRow extends Omit<Problem, "isResolved" | "taskIds"> {
  isResolved: number; // 0 or 1
  // taskIds is not stored directly in this table
}
interface TaskRow
  extends Omit<Task, "isCompleted" | "routineActions" | "actionIds"> {
  isCompleted: number; // 0 or 1
  routineActions: string; // JSON string
  // actionIds are derived
}
interface ActionRow extends Omit<Action, "isRoutineLog"> {
  isRoutineLog: number; // 0 or 1
}

// --- CRUD Service Functions ---

// SITUATION
export const getSituationFromDB = async (): Promise<Situation | null> => {
  const db = await getDatabase();
  // Assuming 'current-situation' is the ID for the single situation
  const row = await db.getFirstAsync<Situation>( // Assuming Situation type matches row structure here
    "SELECT * FROM situation WHERE id = ? LIMIT 1;",
    ["current-situation"]
  );
  // If problemIds are stored as JSON string in situation table (not recommended):
  // return row ? { ...row, problemIds: row.problemIds ? JSON.parse(row.problemIds) : [] } : null;
  // For now, assume problemIds are dynamic and handled by appStore based on actual problems.
  return row ? { ...row, problemIds: [] } : null;
};

export const updateSituationInDB = async (
  situation: Situation
): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  // Using INSERT OR REPLACE to handle both creation and update (upsert)
  return db.runAsync(
    "INSERT OR REPLACE INTO situation (id, description, lastModified) VALUES (?, ?, ?);",
    [situation.id, situation.description || null, situation.lastModified]
  );
};

// PROBLEMS
export const getProblemsFromDB = async (): Promise<Problem[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProblemRow>(
    "SELECT * FROM problems ORDER BY createdAt DESC;"
  );
  return rows.map((row) => ({
    ...row,
    isResolved: !!row.isResolved,
    taskIds: [], // taskIds should be populated by querying tasks table or managed in app state
  }));
};

export const addProblemToDB = async (
  problem: Problem
): Promise<SQLite.SQLiteRunResult> => {
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

export const updateProblemInDB = async (
  problem: Problem
): Promise<SQLite.SQLiteRunResult> => {
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

export const deleteProblemFromDB = async (
  problemId: string
): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  // ON DELETE CASCADE in schema should handle deleting related tasks, actions, and results.
  // If not, you'd use db.withTransactionAsync here to delete from multiple tables.
  return db.runAsync("DELETE FROM problems WHERE id = ?;", [problemId]);
};

// TASKS
export const getTasksFromDB = async (): Promise<Task[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TaskRow>(
    "SELECT * FROM tasks ORDER BY createdAt DESC;"
  );
  return rows.map((row) => ({
    ...row,
    isCompleted: !!row.isCompleted,
    routineActions: row.routineActions ? JSON.parse(row.routineActions) : [],
    actionIds: [], // actionIds are derived by querying actions table
  }));
};
// Get tasks for a specific problem
export const getTasksForProblemFromDB = async (
  problemId: string
): Promise<Task[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TaskRow>(
    "SELECT * FROM tasks WHERE problemId = ? ORDER BY createdAt ASC;",
    [problemId]
  );
  return rows.map((row) => ({
    ...row,
    isCompleted: !!row.isCompleted,
    routineActions: row.routineActions ? JSON.parse(row.routineActions) : [],
    actionIds: [],
  }));
};

export const addTaskToDB = async (
  task: Task
): Promise<SQLite.SQLiteRunResult> => {
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

export const updateTaskInDB = async (
  task: Task
): Promise<SQLite.SQLiteRunResult> => {
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

export const deleteTaskFromDB = async (
  taskId: string
): Promise<SQLite.SQLiteRunResult> => {
  const db = await getDatabase();
  // ON DELETE CASCADE should handle deleting actions linked to this task
  return db.runAsync("DELETE FROM tasks WHERE id = ?;", [taskId]);
};

// ACTIONS
export const getActionsFromDB = async (): Promise<Action[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ActionRow>(
    "SELECT * FROM actions ORDER BY timestamp DESC;"
  );
  return rows.map((row) => ({
    ...row,
    isRoutineLog: !!row.isRoutineLog,
  }));
};
// Get actions for a specific task
export const getActionsForTaskFromDB = async (
  taskId: string
): Promise<Action[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ActionRow>(
    "SELECT * FROM actions WHERE taskId = ? ORDER BY timestamp ASC;",
    [taskId]
  );
  return rows.map((row) => ({
    ...row,
    isRoutineLog: !!row.isRoutineLog,
  }));
};

export const addActionToDB = async (
  action: Action
): Promise<SQLite.SQLiteRunResult> => {
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

// RESULTS
export const getResultsFromDB = async (): Promise<Result[]> => {
  const db = await getDatabase();
  // The generic type <Result> assumes the row structure matches the Result type.
  return db.getAllAsync<Result>(
    "SELECT * FROM results ORDER BY dateAchieved DESC;"
  );
};

export const addResultToDB = async (
  result: Result
): Promise<SQLite.SQLiteRunResult> => {
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

// Export the initDB function and your CRUD functions
export { initDB };
// Other exports are already handled by `export const ...`
