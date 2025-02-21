// src/data/suggestedPlans.ts

import { Exercise } from "../contexts/Exercise";
import { generateExerciseId } from "../utils/utils";

// src/data/suggestedPlans.ts

export const weeklyVolumePerMuscleGroupPerCategory: {
    [category: string]: { [muscleGroup: string]: number };
} = {
    strength: {
        Arms: 12,
        Back: 20,
        Chest: 20,
        Core: 12,
        Legs: 20,
        Shoulders: 12,
        LowerLegs: 12,
    },
    mobility: {
        Shoulders: 12,
        Hips: 12,
        Legs: 12,
    },
    endurance: {
        Legs: 20,
    },
};

export const recalculateWeeklySets = (
    exercises: (Exercise & { isSelected: boolean })[],
    muscleGroup: string,
    category: string
) => {
    const activeExercises = exercises.filter(
        (e) => e.muscleGroup === muscleGroup && e.category === category && e.isSelected
    );

    const totalPriority = activeExercises.reduce(
        (sum, e) => sum + (e.priority > 0 ? e.priority : 0),
        0
    );

    const totalVolume = weeklyVolumePerMuscleGroupPerCategory[category]?.[muscleGroup] || 12;

    if (totalPriority === 0) {
        return exercises.map((e) => ({
            ...e,
            weeklySets: 0,
        }));
    }

    const updatedExercises = exercises.map((e) => ({
        ...e,
        weeklySets:
            e.isSelected && e.muscleGroup === muscleGroup && e.category === category
                ? e.priority > 0
                    ? Math.floor((e.priority / totalPriority) * totalVolume)
                    : 0
                : e.weeklySets || 0,
    }));

    const remainingSets =
        totalVolume -
        activeExercises.reduce(
            (sum, e) => sum + (updatedExercises.find((ue) => ue.id === e.id)?.weeklySets || 0),
            0
        );

    if (remainingSets > 0) {
        activeExercises
            .filter((e) => e.priority > 0)
            .map((e) => ({
                id: e.id,
                fraction:
                    (e.priority / totalPriority) * totalVolume -
                    (updatedExercises.find((ue) => ue.id === e.id)?.weeklySets || 0),
            }))
            .sort((a, b) => b.fraction - a.fraction)
            .slice(0, remainingSets)
            .forEach(({ id }) => {
                const idx = updatedExercises.findIndex((e) => e.id === id);
                if (idx !== -1) {
                    updatedExercises[idx].weeklySets++;
                }
            });
    }

    return updatedExercises;
};
export interface Plan {
    name: string;
    category: string;
    exercises: Exercise[];
}

// Update createExercise to calculate weeklySets
function createExercise(
    exerciseData: Omit<Exercise, "id">,
    allExercises: Omit<Exercise, "id">[]
): Exercise {
    const weeklySets = 0;
    return {
        ...exerciseData,
        id: generateExerciseId(exerciseData),
        weeklySets,
    };
}

export const suggestedPlans: { [key: string]: Plan } = {
    strength: {
        name: "Strength",
        category: "strength",
        exercises: (() => {
            const exerciseDataList = [
                {
                    name: "Deadlift",
                    description: "",
                    priority: 3,
                    category: "strength" as const,
                    muscleGroup: "Legs",
                },
                {
                    name: "Romanian Deadlift",
                    description: "",
                    priority: 2,
                    category: "strength" as const,
                    muscleGroup: "Legs",
                },
                {
                    name: "Machine Squat",
                    description: "Leg Press or Hack Squat",
                    priority: 2,
                    category: "strength" as const,
                    muscleGroup: "Legs",
                },
                {
                    name: "Split Squat",
                    description: "",
                    priority: 1,
                    category: "strength" as const,
                    muscleGroup: "Legs",
                },
                {
                    name: "Incline Bench",
                    description: "",
                    priority: 3,
                    category: "strength" as const,
                    muscleGroup: "Chest",
                },
                {
                    name: "Chest Fly",
                    description: "",
                    priority: 1,
                    category: "strength" as const,
                    muscleGroup: "Chest",
                },
                {
                    name: "Pull Up",
                    description: "",
                    priority: 3,
                    category: "strength" as const,
                    muscleGroup: "Back",
                },
                {
                    name: "Row",
                    description: "",
                    priority: 2,
                    category: "strength" as const,
                    muscleGroup: "Back",
                },
                {
                    name: "Overhead Press",
                    description: "",
                    priority: 2,
                    category: "strength" as const,
                    muscleGroup: "Shoulders",
                },
                {
                    name: "Lateral Raise",
                    description: "",
                    priority: 1,
                    category: "strength" as const,
                    muscleGroup: "Shoulders",
                },
                {
                    name: "Biceps",
                    description: "",
                    priority: 2,
                    category: "strength" as const,
                    muscleGroup: "Arms",
                },
                {
                    name: "Triceps",
                    description: "",
                    priority: 2,
                    category: "strength" as const,
                    muscleGroup: "Arms",
                },
                {
                    name: "Ab Roll",
                    description: "",
                    priority: 2,
                    category: "strength" as const,
                    muscleGroup: "Core",
                },
                {
                    name: "Quadratus Lumborum",
                    description: "",
                    priority: 1,
                    category: "strength" as const,
                    muscleGroup: "Core",
                },
                {
                    name: "Calf Raise",
                    description: "",
                    priority: 2,
                    category: "strength" as const,
                    muscleGroup: "Lower Legs",
                },
                {
                    name: "Tibialis Raise",
                    description: "",
                    priority: 1,
                    category: "strength" as const,
                    muscleGroup: "Lower Legs",
                },
            ];
            return exerciseDataList.map((data) => createExercise(data, exerciseDataList));
        })(),
    },
    mobility: {
        name: "Mobility",
        category: "mobility",
        exercises: (() => {
            const exerciseDataList = [
                {
                    name: "Dead Hang",
                    description: "70s",
                    priority: 2,
                    category: "mobility" as const,
                    muscleGroup: "Shoulders",
                },
                {
                    name: "Chest Stretch",
                    description: "90s",
                    priority: 2,
                    category: "mobility" as const,
                    muscleGroup: "Shoulders",
                },
                {
                    name: "Deep Squat",
                    description: "60s",
                    priority: 1,
                    category: "mobility" as const,
                    muscleGroup: "Hips",
                },
                {
                    name: "ATG Split Squat",
                    description: "2x45s",
                    priority: 2,
                    category: "mobility" as const,
                    muscleGroup: "Hips",
                },
                {
                    name: "Hamstring Stretch",
                    description: "60s",
                    priority: 2,
                    category: "mobility" as const,
                    muscleGroup: "Hips",
                },
                {
                    name: "Pancake Stretch",
                    description: "90s",
                    priority: 1,
                    category: "mobility" as const,
                    muscleGroup: "Hips",
                },
                {
                    name: "Ankle Stretch",
                    description: "2x45s",
                    priority: 2,
                    category: "mobility" as const,
                    muscleGroup: "Legs",
                },
            ];
            return exerciseDataList.map((data) => createExercise(data, exerciseDataList));
        })(),
    },
    cardio: {
        name: "Cardio",
        category: "endurance",
        exercises: (() => {
            const exerciseDataList = [
                {
                    name: "Running",
                    description: "",
                    priority: 3,
                    category: "endurance" as const,
                    muscleGroup: "Legs",
                    distance: 60,
                },
                {
                    name: "Cross Endurance",
                    description: "5k ~ 30m",
                    priority: 1,
                    category: "endurance" as const,
                    muscleGroup: "Legs",
                    distance: 0,
                },
            ];
            return exerciseDataList.map((data) => createExercise(data, exerciseDataList));
        })(),
    },
};
