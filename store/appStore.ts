import { create } from "zustand";
import type {
  Action,
  Problem,
  Result,
  RoutineActionDefinition,
  Situation,
  Task,
} from "../types"; // Assuming your types are in ../types

import {
  addActionToDB,
  addProblemToDB,
  addResultToDB,
  addTaskToDB,
  deleteProblemFromDB,
  deleteTaskFromDB,
  getActionsFromDB,
  getProblemsFromDB,
  getResultsFromDB,
  getSituationFromDB,
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

  hydrateFromDB: () => Promise<void>;

  // --- Situation Actions ---
  setSituationDescription: (description: string) => Promise<void>;
  // addProblemToSituation is effectively replaced by addProblem,
  // as problems implicitly belong to the single situation.
  addProblem: (problemName: string) => Promise<Problem | null>; // Simplified: takes name, returns new Problem

  // --- Problem Actions ---
  updateProblem: (problemId: string, updates: Partial<Omit<Problem, 'id' | 'createdAt' | 'taskIds'>>) => Promise<void>;
  deleteProblem: (problemId: string) => Promise<void>;
  addTaskToProblem: (problemId: string, taskName: string) => Promise<Task | null>; // Simplified

  // --- Task Actions ---
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'problemId' | 'actionIds' | 'routineActions'>>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addRoutineActionToTaskDefinition: (taskId: string, routineActionDefName: string) => Promise<void>; // Renamed & simplified
  logRoutineActionExecution: (taskId: string, routineActionDefId: string) => Promise<void>; // Renamed for clarity

  // --- Action Actions ---
  logSpecificAction: (taskId: string, actionDetails: Partial<Omit<Action, 'id' | 'taskId' | 'timestamp'>>) => Promise<void>; // Simplified

  // --- Result Actions ---
  addResult: (result: Omit<Result, 'id' | 'createdAt'>) => Promise<void>;
}

const generateId = (): string =>
  global.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);

const arrayToRecord = <T extends { id: string }>(arr: T[]): Record<string, T> =>
  arr.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, T>);

export const useAppStore = create<AppState>((set, get) => ({
  situation: null,
  problems: {},
  tasks: {},
  actions: {},
  results: {},

  hydrateFromDB: async () => {
    try {
      await initDB();

      const [dbSituation, rawDbProblems, rawDbTasks, rawDbActions, dbResults] =
        await Promise.all([
          getSituationFromDB(),
          getProblemsFromDB(), // Returns Problem[] with taskIds: []
          getTasksFromDB(),    // Returns Task[] with actionIds: []
          getActionsFromDB(),
          getResultsFromDB(),
        ]);

      let currentSituation = dbSituation;
      if (!currentSituation) {
        currentSituation = {
          id: "current-situation", // Fixed ID for the single situation
          lastModified: new Date().toISOString(),
          description: "",
          // No problemIds here, as per type change
        };
        await updateSituationInDB(currentSituation);
      }

      // Convert arrays to records for easier lookup
      const problemsMap: Record<string, Problem> = arrayToRecord(rawDbProblems);
      const tasksMap: Record<string, Task> = arrayToRecord(rawDbTasks);
      const actionsMap: Record<string, Action> = arrayToRecord(rawDbActions);

      // Populate taskIds in problemsMap
      Object.values(tasksMap).forEach(task => {
        if (problemsMap[task.problemId]) {
          problemsMap[task.problemId].taskIds.push(task.id);
        }
      });

      // Populate actionIds in tasksMap
      Object.values(actionsMap).forEach(action => {
        if (tasksMap[action.taskId]) {
          tasksMap[action.taskId].actionIds.push(action.id);
        }
      });

      set({
        situation: currentSituation,
        problems: problemsMap,
        tasks: tasksMap,
        actions: actionsMap,
        results: arrayToRecord(dbResults),
      });
      console.log("STAR Planner: Store hydrated from SQLite.");
    } catch (error) {
      console.error("STAR Planner: Failed to hydrate store from SQLite.", error);
    }
  },

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

  addProblem: async (problemName) => {
    const newProblem: Problem = {
      id: generateId(),
      name: problemName,
      isResolved: false,
      createdAt: new Date().toISOString(),
      taskIds: [], // Initialize with empty taskIds
    };

    try {
      await addProblemToDB(newProblem);
      // No direct modification to situation.problemIds
      // Optionally, update situation's lastModified if desired
      const currentSituation = get().situation;
      if (currentSituation) {
        const updatedSit: Situation = { ...currentSituation, lastModified: new Date().toISOString() };
        await updateSituationInDB(updatedSit);
        set(state => ({
          problems: { ...state.problems, [newProblem.id]: newProblem },
          situation: updatedSit
        }));
      } else {
        set(state => ({
          problems: { ...state.problems, [newProblem.id]: newProblem },
        }));
      }
      return newProblem;
    } catch (error) {
      console.error("Failed to add problem to DB:", error);
      return null;
    }
  },

  updateProblem: async (problemId, updates) => {
    const currentProblem = get().problems[problemId];
    if (!currentProblem) {
      console.error(`Problem ${problemId} not found for update.`);
      return;
    }
    // Ensure taskIds and other managed fields are not overwritten by partial updates
    const updatedProblem: Problem = {
      ...currentProblem,
      ...updates,
      // resolutionDate and finalOutcome can be nullified if updates includes them as undefined
      resolutionDate: 'resolutionDate' in updates ? updates.resolutionDate : currentProblem.resolutionDate,
      finalOutcome: 'finalOutcome' in updates ? updates.finalOutcome : currentProblem.finalOutcome,
    };

    try {
      await updateProblemInDB(updatedProblem); // DB function only updates certain fields
      set(state => ({
        problems: { ...state.problems, [problemId]: updatedProblem },
      }));
    } catch (error) {
      console.error(`Failed to update problem ${problemId} in DB:`, error);
    }
  },

  deleteProblem: async (problemId) => {
    const problemToDelete = get().problems[problemId];
    if (!problemToDelete) {
      console.error(`Problem ${problemId} not found for deletion.`);
      return;
    }

    try {
      await deleteProblemFromDB(problemId); // DB handles cascading deletes for tasks/actions/results

      set(state => {
        const newProblems = { ...state.problems };
        delete newProblems[problemId];

        // Remove associated tasks from store state
        const newTasks = { ...state.tasks };
        const tasksToRemove = Object.values(state.tasks).filter(t => t.problemId === problemId);
        const newActions = { ...state.actions };

        tasksToRemove.forEach(task => {
          // Remove actions associated with each task being removed
          (task.actionIds || []).forEach(actionId => {
            delete newActions[actionId];
          });
          delete newTasks[task.id];
        });

        // Remove associated results from store state
        const newResults = { ...state.results };
        Object.values(state.results).forEach(result => {
          if (result.problemId === problemId) {
            delete newResults[result.id];
          }
        });

        // Optionally update situation's lastModified
        let newSituation = state.situation;
        if (newSituation) {
          newSituation = { ...newSituation, lastModified: new Date().toISOString() };
        }

        return {
          problems: newProblems,
          tasks: newTasks,
          actions: newActions,
          results: newResults,
          situation: newSituation // Reflect lastModified change if any
        };
      });
      console.log(`Problem ${problemId} and related data deleted from store.`);
    } catch (error) {
      console.error(`Failed to delete problem ${problemId} from DB:`, error);
    }
  },

  addTaskToProblem: async (problemId, taskName) => {
    const currentProblem = get().problems[problemId];
    if (!currentProblem) {
      console.error(`Problem ${problemId} not found for addTaskToProblem.`);
      return null;
    }
    const newTask: Task = {
      id: generateId(),
      problemId: problemId,
      name: taskName,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      actionIds: [],
      routineActions: [],
    };

    try {
      await addTaskToDB(newTask);
      const updatedProblem: Problem = {
        ...currentProblem,
        taskIds: [...currentProblem.taskIds, newTask.id],
      };
      // updateProblemInDB does not save taskIds, which is intended.
      // This change to problem.taskIds is in-memory for the store.
      await updateProblemInDB(updatedProblem);


      set(state => ({
        problems: { ...state.problems, [problemId]: updatedProblem },
        tasks: { ...state.tasks, [newTask.id]: newTask },
      }));
      return newTask;
    } catch (error) {
      console.error(`Failed to add task to problem ${problemId} in DB:`, error);
      return null;
    }
  },

  updateTask: async (taskId, updates) => {
    const currentTask = get().tasks[taskId];
    if (!currentTask) {
      console.error(`Task ${taskId} not found for update.`);
      return;
    }
    const updatedTask: Task = {
      ...currentTask, ...updates,
      completionDate: 'completionDate' in updates ? updates.completionDate : currentTask.completionDate,
    };

    try {
      await updateTaskInDB(updatedTask); // DB does not update actionIds, only core fields + routineActions
      set(state => ({
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
      await deleteTaskFromDB(taskId); // DB handles cascading deletes for actions

      set(state => {
        const newTasks = { ...state.tasks };
        delete newTasks[taskId];

        const problem = state.problems[taskToDelete.problemId];
        let newProblems = state.problems;
        if (problem) {
          const updatedProblem = {
            ...problem,
            taskIds: problem.taskIds.filter(id => id !== taskId),
          };
          newProblems = { ...state.problems, [taskToDelete.problemId]: updatedProblem };
          // updateProblemInDB(updatedProblem).catch(console.error); // Persist problem (optional, taskIds not saved by DB func)
        }

        const newActions = { ...state.actions };
        (taskToDelete.actionIds || []).forEach(actionId => delete newActions[actionId]);

        return {
          tasks: newTasks,
          problems: newProblems,
          actions: newActions,
        };
      });
    } catch (error) {
      console.error(`Failed to delete task ${taskId} from DB:`, error);
    }
  },

  addRoutineActionToTaskDefinition: async (taskId, routineActionDefName) => {
    const task = get().tasks[taskId];
    if (!task) {
      console.error(`Task ${taskId} not found for addRoutineActionToTaskDefinition.`);
      return;
    }
    const newRoutineActionDef: RoutineActionDefinition = {
      id: generateId(),
      name: routineActionDefName,
      loggedCount: 0,
    };
    const updatedTask: Task = {
      ...task,
      routineActions: [...task.routineActions, newRoutineActionDef],
    };
    try {
      await updateTaskInDB(updatedTask); // updateTaskInDB saves routineActions as JSON
      set(state => ({
        tasks: { ...state.tasks, [taskId]: updatedTask },
      }));
    } catch (error) {
      console.error(`Failed to add routine action definition to task ${taskId} in DB:`, error);
    }
  },

  logRoutineActionExecution: async (taskId, routineActionDefId) => {
    const state = get();
    const task = state.tasks[taskId];
    if (!task) {
      console.error(`Task with id ${taskId} not found`);
      return;
    }
    const routineActionDef = task.routineActions.find(ra => ra.id === routineActionDefId);
    if (!routineActionDef) {
      console.error(`Routine action definition with id ${routineActionDefId} not found in task ${taskId}`);
      return;
    }

    const newAction: Action = {
      id: generateId(),
      taskId,
      timestamp: new Date().toISOString(),
      isRoutineLog: true,
      routineActionDefId,
      description: `Logged: ${routineActionDef.name}`, // Auto-generate description
    };

    const updatedTask: Task = {
      ...task,
      routineActions: task.routineActions.map(ra =>
        ra.id === routineActionDefId ? { ...ra, loggedCount: ra.loggedCount + 1 } : ra
      ),
      actionIds: [...task.actionIds, newAction.id],
    };

    try {
      await addActionToDB(newAction);
      await updateTaskInDB(updatedTask); // Saves updated routineActions and potentially other task fields (but not actionIds)

      set(currentState => ({ // Use functional update for safety
        tasks: { ...currentState.tasks, [taskId]: updatedTask },
        actions: { ...currentState.actions, [newAction.id]: newAction },
      }));
    } catch (error) {
      console.error(`Failed to log routine action for task ${taskId} in DB:`, error);
    }
  },

  logSpecificAction: async (taskId, actionDetails) => {
    const task = get().tasks[taskId];
    if (!task) {
      console.error(`Task with id ${taskId} not found for specific action`);
      return;
    }
    const newAction: Action = {
      id: generateId(),
      taskId,
      timestamp: new Date().toISOString(),
      isRoutineLog: false,
      ...actionDetails, // Spread other details like description, notes, etc.
    };
    const updatedTask: Task = {
      ...task,
      actionIds: [...task.actionIds, newAction.id],
    };

    try {
      await addActionToDB(newAction);
      // updateTaskInDB doesn't save actionIds, this is an in-store update for actionIds
      // No need to call updateTaskInDB just for actionIds change if no other task fields change.
      // If other task fields *were* to change here, then call it.

      set(state => ({
        tasks: { ...state.tasks, [taskId]: updatedTask },
        actions: { ...state.actions, [newAction.id]: newAction },
      }));
    } catch (error) {
      console.error(`Failed to log specific action for task ${taskId} in DB:`, error);
    }
  },

  addResult: async (resultData) => {
    const newResult: Result = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...resultData,
    };
    try {
      await addResultToDB(newResult);
      set(state => ({
        results: { ...state.results, [newResult.id]: newResult },
      }));
    } catch (error) {
      console.error("Failed to add result to DB:", error);
    }
  },
}));