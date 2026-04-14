"use client";

import { useState } from "react";
import { AppState } from "./types";
import ActivityScreen from "./components/screens/ActivityScreen";
import ParametersScreen from "./components/screens/ParametersScreen";
import ResultScreen from "./components/screens/ResultScreen";

const INITIAL_STATE: AppState = {
  screen: "activity",
  activity: null,
  startType: null,
  address: "",
  startCoord: null,
  startLabel: "",
  mainParam: "",
  customParam: "",
  tags: [],
  wishes: "",
  routeResult: null,
  destinationName: "",
  pois: [],
  routeError: null,
};

export default function Home() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const updateState = (updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleReset = () => setState(INITIAL_STATE);

  return (
    <main>
      {state.screen === "activity" && (
        <ActivityScreen onNext={updateState} />
      )}
      {state.screen === "parameters" && (
        <ParametersScreen
          state={state}
          onNext={updateState}
          onBack={() => updateState({ screen: "activity" })}
        />
      )}
      {state.screen === "result" && state.routeResult && (
        <ResultScreen state={state} onReset={handleReset} />
      )}
    </main>
  );
}
