"use client";

import { useState, useEffect } from "react";
import { AppState, ThemeType } from "./types";
import SplashScreen from "./components/screens/SplashScreen";
import Step1Screen from "./components/screens/Step1Screen";
import Step2Screen from "./components/screens/Step2Screen";
import Step3Screen from "./components/screens/Step3Screen";
import Step4Screen from "./components/screens/Step4Screen";
import Step5Screen from "./components/screens/Step5Screen";
import Step6Screen from "./components/screens/Step6Screen";
import ResultScreen from "./components/screens/ResultScreen";

const INITIAL_STATE: AppState = {
  screen: "splash",
  theme: "light",
  activity: null,
  distOrDur: null,
  mainParam: "",
  customParam: "",
  startType: null,
  address: "",
  startCoord: null,
  startLabel: "",
  routeType: null,
  endAddress: "",
  locality: null,
  selectedCategories: [],
  selectedTags: [],
  wishes: "",
  routeResult: null,
  destinationName: "",
  pois: [],
  routeError: null,
  routeMessage: null,
};

export default function Home() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  // Apply theme to <html> element
  useEffect(() => {
    const saved = localStorage.getItem("space-theme") as ThemeType | null;
    if (saved === "dark" || saved === "light") {
      setState((prev) => ({ ...prev, theme: saved }));
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  function updateState(updates: Partial<AppState>) {
    setState((prev) => ({ ...prev, ...updates }));
  }

  function handleReset() {
    setState({ ...INITIAL_STATE, theme: state.theme });
  }

  function toggleTheme() {
    const next: ThemeType = state.theme === "light" ? "dark" : "light";
    setState((prev) => ({ ...prev, theme: next }));
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("space-theme", next);
  }

  const { screen } = state;

  return (
    <main className="h-full">
      {screen === "splash" && (
        <SplashScreen
          onFinish={() => updateState({ screen: "step1" })}
          theme={state.theme}
          onThemeToggle={toggleTheme}
        />
      )}

      {screen === "step1" && (
        <Step1Screen onNext={updateState} />
      )}

      {screen === "step2" && (
        <Step2Screen
          state={state}
          onNext={updateState}
          onBack={() => updateState({ screen: "step1" })}
        />
      )}

      {screen === "step3" && (
        <Step3Screen
          state={state}
          onNext={updateState}
          onBack={() => updateState({ screen: "step2" })}
        />
      )}

      {screen === "step4" && (
        <Step4Screen
          state={state}
          onNext={updateState}
          onBack={() => updateState({ screen: "step3" })}
        />
      )}

      {screen === "step5" && (
        <Step5Screen
          state={state}
          onNext={updateState}
          onBack={() => updateState({ screen: "step4" })}
        />
      )}

      {screen === "loading" && (
        <Step6Screen state={state} onNext={updateState} />
      )}

      {screen === "result" && state.routeResult && (
        <ResultScreen state={state} onReset={handleReset} />
      )}
    </main>
  );
}
