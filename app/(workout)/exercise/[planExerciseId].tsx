import { useLocalSearchParams } from "expo-router";
import {
  ExerciseDetailScreen,
  type ExercisePrescription,
} from "@features/workout/screens/exercise-detail-screen";

export default function ExerciseDetailRoute() {
  const params = useLocalSearchParams<{
    planExerciseId: string;
    exerciseId: string;
    targetSets?: string;
    repRangeMin?: string;
    repRangeMax?: string;
    targetRir?: string;
    coachNote?: string;
  }>();

  const prescription: ExercisePrescription | null = params.targetSets
    ? {
        targetSets: Number(params.targetSets),
        repRangeMin: Number(params.repRangeMin),
        repRangeMax: Number(params.repRangeMax),
        targetRir: Number(params.targetRir),
        coachNote: params.coachNote ?? null,
      }
    : null;

  return (
    <ExerciseDetailScreen
      exerciseId={params.exerciseId}
      planExerciseId={params.planExerciseId}
      prescription={prescription}
    />
  );
}
