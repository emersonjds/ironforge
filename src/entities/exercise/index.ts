export { ExerciseSchema } from "./schema";
export type { Exercise } from "./schema";
export { EXERCISE_CATALOG, getExercise, getExercisesByMuscle, findSwapCandidates } from "./catalog";
export { fetchExercises } from "./api";
export { useExercises } from "./hooks/use-exercises";
export { useExercise } from "./hooks/use-exercise";
export { parseInstructions } from "./lib/parse-instructions";
export type { InstructionBlocks } from "./lib/parse-instructions";
export { ExerciseInstructions } from "./ui/exercise-instructions";
