import { create } from "zustand";
import type {
  Action,
  Problem,
  Result,
  RoutineActionDefinition,
  Situation,
  Task,
} from "../types"; // Assuming your types are in ../types

// Import your database initialization and CRUD functions
// You will need to create these in your db.ts file for expo-sqlite
import {
  addActionToDB,
  addProblemToDB,
  addResultToDB,
  addTaskToDB,
  deleteProblemFromDB,
  deleteTaskFromDB, // This should handle cascades in SQL or its own logic
  getActionsFromDB, // Example: for description and lastModified
  getProblemsFromDB,
  // deleteActionFromDB, // If needed independently
  getResultsFromDB,
  getSituationFromDB, // This should handle cascades in SQL or its own logic
  getTasksFromDB,
  initDB,
  updateProblemInDB,
  updateSituationInDB,
  updateTaskInDB,
} from "../services/db"; // Adjust path as needed

export interface AppState {
  situation: Situation | null;
  problems: Record<string, Problem>;
  tasks: Record<string, Task>;
  actions: Record<string, Action>;
  results: Record<string, Result>;

  // --- Hydration ---
  hydrateFromDB: () => Promise<void>; // Renamed from hydrateFromStorage

  // --- Situation Actions ---
  setSituationDescription: (description: string) => Promise<void>;
  addProblemToSituation: (problem: Problem) => Promise<void>;

  // --- Problem Actions ---
  // addProblem: (problem: Problem) => Promise<void>; // Covered by addProblemToSituation
  updateProblem: (
    problemId: string,
    updates: Partial<Problem>
  ) => Promise<void>;
  deleteProblem: (problemId: string) => Promise<void>;
  addTaskToProblem: (problemId: string, task: Task) => Promise<void>;

  // --- Task Actions ---
  // addTask: (task: Task) => Promise<void>; // Covered by addTaskToProblem
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addRoutineActionToTask: (
    taskId: string,
    routineActionDef: RoutineActionDefinition
  ) => Promise<void>;
  logRoutineAction: (
    taskId: string,
    routineActionDefId: string
  ) => Promise<void>;

  // --- Action Actions ---
  logSpecificAction: (action: Action) => Promise<void>;

  // --- Result Actions ---
  addResult: (result: Result) => Promise<void>;
}

// Helper for unique IDs (ensure you have a proper implementation for native)
// For Expo native, consider using 'expo-crypto': import * as Crypto from 'expo-crypto';
const generateId = (): string =>
  global.crypto && global.crypto.randomUUID
    ? global.crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11); // Fallback, not truly UUID

// Helper to convert array from DB to record for store
const arrayToRecord = <T extends { id: string }>(arr: T[]): Record<string, T> =>
  arr.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, T>);

export const useAppStore = create<AppState>((set, get) => ({
  situation: null, // Will be populated by hydrateFromDB
  problems: {},
  tasks: {},
  actions: {},
  results: {},

  // --- Hydration ---
  hydrateFromDB: async () => {
    try {
      await initDB();

      const [dbSituation, dbProblems, dbTasks, dbActions, dbResults] =
        await Promise.all([
          getSituationFromDB(), // This should fetch the single 'current-situation'
          getProblemsFromDB(),
          getTasksFromDB(),
          getActionsFromDB(),
          getResultsFromDB(),
        ]);

      let currentSituation = dbSituation;
      if (!currentSituation) {
        // Create a default situation in DB if it doesn't exist
        currentSituation = {
          id: "current-situation",
          problemIds: [], // Will be populated as problems are added
          lastModified: new Date().toISOString(),
          description: "",
        };
        await updateSituationInDB(currentSituation); // Use an upsert-like function or add then update
      }

      set({
        situation: currentSituation,
        problems: arrayToRecord(dbProblems),
        tasks: arrayToRecord(dbTasks),
        actions: arrayToRecord(dbActions),
        results: arrayToRecord(dbResults),
      });
      console.log("STAR Planner: Store hydrated from SQLite.");
    } catch (error) {
      console.error(
        "STAR Planner: Failed to hydrate store from SQLite.",
        error
      );
    }
  },

  // --- Situation Actions Implementation ---
  setSituationDescription: async (description) => {
    const currentSituation = get().situation;
    if (!currentSituation) {
      console.error("Situation not loaded for setSituationDescription");
      return;
    }
    const updatedSituation: Situation = {
      ...currentSituation,
      description,
      lastModified: new Date().toISOString(),
    };
    try {
      await updateSituationInDB(updatedSituation);
      set({ situation: updatedSituation });
    } catch (error) {
      console.error("Failed to update situation description in DB:", error);
    }
  },

  addProblemToSituation: async (problem) => {
    const currentSituation = get().situation;
    if (!currentSituation) {
      console.error("Situation not loaded for addProblemToSituation");
      return;
    }
    const updatedSituation: Situation = {
      ...currentSituation,
      problemIds: [...currentSituation.problemIds, problem.id],
      lastModified: new Date().toISOString(),
    };
    try {
      // Persist problem first, then the updated situation linking to it
      await addProblemToDB(problem);
      await updateSituationInDB(updatedSituation); // Assumes updateSituationInDB updates problemIds too

      set((state) => ({
        situation: updatedSituation,
        problems: { ...state.problems, [problem.id]: problem },
      }));
    } catch (error) {
      console.error("Failed to add problem to situation in DB:", error);
    }
  },

  // --- Problem Actions Implementation ---
  updateProblem: async (problemId, updates) => {
    const currentProblem = get().problems[problemId];
    if (!currentProblem) {
      console.error(`Problem ${problemId} not found for update.`);
      return;
    }
    const updatedProblem: Problem = { ...currentProblem, ...updates };
    try {
      await updateProblemInDB(updatedProblem);
      set((state) => ({
        problems: { ...state.problems, [problemId]: updatedProblem },
      }));
    } catch (error) {
      console.error(`Failed to update problem ${problemId} in DB:`, error);
    }
  },

  deleteProblem: async (problemId: string) => {
    // Get the state of the problem (especially its taskIds) *before* any store modification
    const problemToDelete = get().problems[problemId];
    if (!problemToDelete) {
      console.error(`Problem ${problemId} not found for deletion.`);
      return;
    }

    try {
      // 1. Attempt to delete the problem and its related data from the SQLite database.
      // It's assumed that `deleteProblemFromDB` triggers `ON DELETE CASCADE` in SQLite,
      // which would automatically delete related tasks, their actions, and related results.
      await deleteProblemFromDB(problemId);

      // 2. If DB deletion is successful, update the Zustand state to mirror these changes.
      set((state) => {
        // Create new copies of state slices to modify
        const newProblems = { ...state.problems };
        const newTasks = { ...state.tasks };
        const newActions = { ...state.actions };
        const newResults = { ...state.results };

        // a. Remove the problem itself
        delete newProblems[problemId];

        // b. Remove tasks associated with the deleted problem.
        //    `problemToDelete.taskIds` (captured before this `set` call) accurately lists these tasks.
        problemToDelete.taskIds.forEach((taskId) => {
          const task = state.tasks[taskId]; // Get the task from the current state snapshot
          if (task) {
            // c. Remove actions associated with each deleted task.
            //    `task.actionIds` (from the current state snapshot) lists these actions.
            task.actionIds.forEach((actionId) => {
              delete newActions[actionId];
            });
            // Now remove the task itself from the newTasks object
            delete newTasks[taskId];
          }
        });

        // d. Remove results directly associated with the deleted problem.
        Object.keys(state.results).forEach((resultId) => {
          if (state.results[resultId].problemId === problemId) {
            delete newResults[resultId];
          }
        });

        // e.Update the situation to remove the problemId
        const newSituation = state.situation
          ? {
              ...state.situation,
              problemIds: state.situation.problemIds.filter(
                (id) => id !== problemId
              ),
              lastModified: new Date().toISOString(),
            }
          : null;

        return {
          problems: newProblems,
          situation: newSituation,
          tasks: newTasks,
          actions: newActions,
          results: newResults,
        };
      });
      console.log(`Problem ${problemId} and related data deleted from store.`);
    } catch (error) {
      console.error(`Failed to delete problem ${problemId} from DB:`, error);
      // Optionally, you might want to add logic here to handle cases where DB deletion fails
      // (e.g., notify the user, attempt a rollback of any optimistic UI changes if you had them).
    }
  },

  addTaskToProblem: async (problemId, task) => {
    const currentProblem = get().problems[problemId];
    if (!currentProblem) {
      console.error(`Problem ${problemId} not found for addTaskToProblem.`);
      return;
    }
    const updatedProblem: Problem = {
      ...currentProblem,
      taskIds: [...currentProblem.taskIds, task.id],
    };
    try {
      await addTaskToDB(task); // Add task to its own table
      await updateProblemInDB(updatedProblem); // Update problem with new taskId

      set((state) => ({
        problems: { ...state.problems, [problemId]: updatedProblem },
        tasks: { ...state.tasks, [task.id]: task },
      }));
    } catch (error) {
      console.error(`Failed to add task to problem ${problemId} in DB:`, error);
    }
  },

  // --- Task Actions Implementation ---
  updateTask: async (taskId, updates) => {
    const currentTask = get().tasks[taskId];
    if (!currentTask) {
      console.error(`Task ${taskId} not found for update.`);
      return;
    }
    const updatedTask: Task = { ...currentTask, ...updates };
    try {
      await updateTaskInDB(updatedTask);
      set((state) => ({
        tasks: { ...state.tasks, [taskId]: updatedTask },
      }));
    } catch (error) {
      console.error(`Failed to update task ${taskId} in DB:`, error);
    }
  },

  deleteTask: async (taskId) => {
    const taskToDelete = get().tasks[taskId];
    if (!taskToDelete) {
      console.error(`Task ${taskId} not found for deletion.`);
      return;
    }
    try {
      // deleteTaskFromDB should handle deleting associated actions in SQLite
      await deleteTaskFromDB(taskId);

      set((state) => {
        const newTasks = { ...state.tasks };
        delete newTasks[taskId];

        const problem = state.problems[taskToDelete.problemId];
        const newProblems = { ...state.problems };
        if (problem) {
          newProblems[taskToDelete.problemId] = {
            ...problem,
            taskIds: problem.taskIds.filter((id) => id !== taskId),
          };
          // Persist change to problem's taskIds in DB if not handled by deleteTaskFromDB's transaction
          updateProblemInDB(newProblems[taskToDelete.problemId]).catch(
            console.error
          );
        }

        const newActions = { ...state.actions };
        taskToDelete.actionIds.forEach(
          (actionId) => delete newActions[actionId]
        );

        return {
          tasks: newTasks,
          problems: newProblems,
          actions: newActions, // actions for this task removed
        };
      });
    } catch (error) {
      console.error(`Failed to delete task ${taskId} from DB:`, error);
    }
  },

  addRoutineActionToTask: async (taskId, routineActionDef) => {
    const task = get().tasks[taskId];
    if (!task) {
      console.error(`Task ${taskId} not found for addRoutineActionToTask.`);
      return;
    }
    const updatedTask: Task = {
      ...task,
      routineActions: [...task.routineActions, routineActionDef],
    };
    try {
      // updateTaskInDB should handle saving the routineActions (e.g., as JSON string)
      await updateTaskInDB(updatedTask);
      set({
        tasks: { ...get().tasks, [taskId]: updatedTask },
      });
    } catch (error) {
      console.error(
        `Failed to add routine action to task ${taskId} in DB:`,
        error
      );
    }
  },

  logRoutineAction: async (taskId, routineActionDefId) => {
    const state = get();
    const task = state.tasks[taskId];
    if (!task) {
      console.error(`Task with id ${taskId} not found`);
      return;
    }
    const routineActionDef = task.routineActions.find(
      (ra) => ra.id === routineActionDefId
    );
    if (!routineActionDef) {
      console.error(
        `Routine action definition with id ${routineActionDefId} not found in task ${taskId}`
      );
      return;
    }

    const newLoggedCount = routineActionDef.loggedCount + 1;
    const newActionId = generateId();
    const newActionLog: Action = {
      id: newActionId,
      taskId,
      timestamp: new Date().toISOString(),
      isRoutineLog: true,
      routineActionDefId,
    };

    const updatedTask: Task = {
      ...task,
      routineActions: task.routineActions.map((ra) =>
        ra.id === routineActionDefId
          ? { ...ra, loggedCount: newLoggedCount }
          : ra
      ),
      actionIds: [...task.actionIds, newActionId],
    };

    try {
      await addActionToDB(newActionLog);
      // updateTaskInDB should handle saving the updated routineActions and actionIds
      await updateTaskInDB(updatedTask);

      set({
        tasks: { ...state.tasks, [taskId]: updatedTask },
        actions: { ...state.actions, [newActionId]: newActionLog },
      });
    } catch (error) {
      console.error(
        `Failed to log routine action for task ${taskId} in DB:`,
        error
      );
    }
  },

  // --- Action Actions Implementation ---
  logSpecificAction: async (action) => {
    const task = get().tasks[action.taskId];
    if (!task) {
      console.error(
        `Task with id ${action.taskId} not found for specific action`
      );
      return;
    }
    const updatedTask: Task = {
      ...task,
      actionIds: [...task.actionIds, action.id],
    };
    try {
      await addActionToDB(action);
      // updateTaskInDB should handle saving the updated actionIds
      await updateTaskInDB(updatedTask);

      set((state) => ({
        tasks: { ...state.tasks, [action.taskId]: updatedTask },
        actions: { ...state.actions, [action.id]: action },
      }));
    } catch (error) {
      console.error(
        `Failed to log specific action for task ${action.taskId} in DB:`,
        error
      );
    }
  },

  // --- Result Actions Implementation ---
  addResult: async (result) => {
    try {
      await addResultToDB(result);
      set((state) => ({
        results: { ...state.results, [result.id]: result },
      }));
    } catch (error) {
      console.error("Failed to add result to DB:", error);
    }
  },
}));

// To use in your App.tsx or main entry point:
// import { useEffect } from 'react';
// import { useAppStore } from './path/to/appStore';
//
// const App = () => {
//   useEffect(() => {
//     const unsubscribe = useAppStore.subscribe(
//       (state) => console.log('State changed:', state), // Optional: log state changes
//       (state) => state // Selector for what part of state to observe, or omit for all
//     );
//     useAppStore.getState().hydrateFromDB(); // Initialize and hydrate
//     return unsubscribe; // Cleanup subscription on unmount
//   }, []);
//
//   // ... rest of your app
// };
