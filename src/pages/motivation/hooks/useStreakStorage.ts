import { useState, useCallback } from "react";

export interface StreakData {
  streak: number;
  steps: number;
  collapsed: boolean;
  history: ("up" | "skip")[];
}

const DEFAULT: StreakData = { streak: 0, steps: 0, collapsed: false, history: [] };

export function useStreakStorage(key: string) {
  const storageKey = `motivation_${key}`;

  const [data, setData] = useState<StreakData>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
    } catch {
      return { ...DEFAULT };
    }
  });

  const persist = useCallback(
    (next: StreakData) => {
      setData(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  const showUp = useCallback(() => {
    const next: StreakData = {
      streak: data.streak + 1,
      steps: data.steps + 1,
      collapsed: false,
      history: [...data.history, "up"],
    };
    persist(next);
  }, [data, persist]);

  const skip = useCallback(() => {
    const skips = data.history.filter((h) => h === "skip").length + 1;
    const collapsed = skips >= 5;
    const next: StreakData = {
      streak: 0,
      steps: Math.max(0, data.steps - 1),
      collapsed,
      history: [...data.history, "skip"],
    };
    persist(next);
  }, [data, persist]);

  const reset = useCallback(() => {
    persist({ ...DEFAULT });
  }, [persist]);

  return { data, showUp, skip, reset };
}
