"use client";

import { createContext, useContext, useReducer } from "react";
import { Report } from "@/types";

type State = { reports: Report[]; loading: boolean; error: string | null };
type Action =
  | { type: "START" }
  | { type: "SUCCESS"; payload: Report[] }
  | { type: "ERROR"; payload: string }
  | { type: "ADD"; payload: Report };

const initialState: State = { reports: [], loading: false, error: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START": return { ...state, loading: true, error: null };
    case "SUCCESS": return { ...state, loading: false, reports: action.payload };
    case "ERROR": return { ...state, loading: false, error: action.payload };
    case "ADD": return { ...state, reports: [action.payload, ...state.reports] };
    default: return state;
  }
}

const ReportsContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <ReportsContext.Provider value={{ state, dispatch }}>{children}</ReportsContext.Provider>;
}

export function useReportsContext() {
  const context = useContext(ReportsContext);
  if (!context) throw new Error("useReportsContext debe usarse dentro de ReportsProvider");
  return context;
}
