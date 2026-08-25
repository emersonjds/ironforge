import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@lib/storage/keys";

/**
 * ponytail: flag única "já abriu algum sheet de exercício" no lugar da
 * store completa de vídeos assistidos por exerciseId/videoId (spec v1 §4.1).
 * Cobre a mesma regra pedida aqui — a dica de descoberta some depois do
 * primeiro sheet — sem construir infraestrutura que nada mais no app usa.
 */
export function useFirstSheetHint(): { showHint: boolean; dismissHint: () => void } {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEYS.hasOpenedExerciseSheet).then((value) => {
      if (!cancelled) setShowHint(value === null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function dismissHint() {
    setShowHint(false);
    AsyncStorage.setItem(STORAGE_KEYS.hasOpenedExerciseSheet, "1").catch(() => {});
  }

  return { showHint, dismissHint };
}
