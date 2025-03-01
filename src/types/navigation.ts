// types/navigation.ts
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Exercise } from "../../src/contexts/Exercise";

export type RootStackParamList = {
    Home: undefined;
    Today: undefined;
    RoutineList: undefined;
    AllExercises:
        | {
              filterCategory?: "strength" | "mobility" | "endurance";
              filterMuscleGroups?: string[];
              workoutName?: string;
          }
        | undefined;
    AddExercise:
        | {
              exerciseId?: string;
              exerciseData?: Exercise;
              muscleGroup?: string;
              category?: string;
              planIndex?: number;
              onSave?: (updatedExercise: Exercise) => void;
          }
        | undefined;
    ExerciseHistory: { exerciseId: string };
    OneRepMaxFormula: undefined;
    RestTimer: undefined;
    TrainingInterval: undefined;
    DailyStepGoal: undefined;
    DefaultRpe: undefined;
    Welcome: undefined;
    PlanPreview: { category: string };
    AppInfo: undefined;
    ImportWorkouts: undefined;
    RoutineDetail: { routineId: string };
    AddRoutine: { routineId?: string };
    WorkoutDetail: {
        category: string;
        muscleGroups: string[];
        workoutName: string;
    };
    OnboardingWizard: undefined;
};

export type AddExerciseScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "AddExercise"
>;

export type ExerciseHistoryScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "ExerciseHistory"
>;

export type RoutineScreenNavigationProp = StackNavigationProp<RootStackParamList, "RoutineList">;

export type OnboardingWizardNavigationProp = StackNavigationProp<
    RootStackParamList,
    "OnboardingWizard"
>;

export type PlanPreviewScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "PlanPreview"
>;

export type AddExerciseScreenRouteProp = RouteProp<RootStackParamList, "AddExercise">;
export type ExerciseHistoryScreenRouteProp = RouteProp<RootStackParamList, "ExerciseHistory">;
export type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList>;
export type AllExercisesScreenRouteProp = RouteProp<RootStackParamList, "AllExercises">;
