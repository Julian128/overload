// contexts/ExerciseContext.tsx
import React, {
    createContext,
    useState,
    useContext,
    ReactNode,
    useEffect,
    useCallback,
    useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Exercise, ExerciseHistoryEntry } from "./Exercise";

interface ExerciseContextType {
    exercises: Exercise[];
    setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
    addExercise: (exercise: Exercise) => void;
    deleteExercise: (exerciseId: string) => void;
    exerciseHistory: Record<string, ExerciseHistoryEntry[]>;
    setExerciseHistory: React.Dispatch<
        React.SetStateAction<Record<string, ExerciseHistoryEntry[]>>
    >;
    addExerciseToHistory: (exerciseId: string, entry: ExerciseHistoryEntry) => void;
    updateExerciseHistoryEntry: (
        exerciseId: string,
        entryIndex: number,
        updatedEntry: ExerciseHistoryEntry
    ) => void;
    deleteExerciseHistoryEntry: (exerciseId: string, entryIndex: number) => void;
    updateExercise: (id: string, updatedExercise: Omit<Exercise, "id">) => void;
    trainingInterval: number;
    setTrainingInterval: (interval: number) => void;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export const ExerciseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [exerciseHistory, setExerciseHistory] = useState<Record<string, ExerciseHistoryEntry[]>>(
        {}
    );
    const [trainingInterval, setTrainingInterval] = useState<number>(7);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        saveData();
    }, [exercises, exerciseHistory, trainingInterval]);

    const loadData = async () => {
        try {
            const storedExercises = await AsyncStorage.getItem("exercises");
            const storedHistory = await AsyncStorage.getItem("exerciseHistory");
            const storedTrainingInterval = await AsyncStorage.getItem("trainingInterval");
            if (storedTrainingInterval) {
                setTrainingInterval(parseInt(storedTrainingInterval, 10));
            }
            if (storedExercises) {
                setExercises(JSON.parse(storedExercises));
            }
            if (storedHistory) {
                setExerciseHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const saveData = useCallback(async () => {
        try {
            await AsyncStorage.setItem("exercises", JSON.stringify(exercises));
            await AsyncStorage.setItem("exerciseHistory", JSON.stringify(exerciseHistory));
            await AsyncStorage.setItem("trainingInterval", trainingInterval.toString());
        } catch (error) {
            console.error("Error saving data:", error);
        }
    }, [exercises, exerciseHistory, trainingInterval]);

    const addExercise = useCallback((exercise: Exercise) => {
        setExercises((prevExercises) => [...prevExercises, exercise]);
    }, []);

    const deleteExercise = useCallback((id: string) => {
        setExercises((prevExercises) => prevExercises.filter((exercise) => exercise.id !== id));
    }, []);

    const addExerciseToHistory = useCallback((exerciseId: string, entry: ExerciseHistoryEntry) => {
        // only need the date for the date entry, no time, therefore set time to start of day always
        entry.date.setHours(0, 0, 0, 0);
        setExerciseHistory((prevHistory) => ({
            ...prevHistory,
            [exerciseId]: [...(prevHistory[exerciseId] || []), entry],
        }));
    }, []);

    const updateExerciseHistoryEntry = useCallback(
        (exerciseId: string, entryIndex: number, updatedEntry: ExerciseHistoryEntry) => {
            setExerciseHistory((prevHistory) => ({
                ...prevHistory,
                [exerciseId]: prevHistory[exerciseId].map((entry, index) =>
                    index === entryIndex ? updatedEntry : entry
                ),
            }));
        },
        []
    );

    const deleteExerciseHistoryEntry = useCallback((exerciseId: string, entryIndex: number) => {
        setExerciseHistory((prevHistory) => ({
            ...prevHistory,
            [exerciseId]: prevHistory[exerciseId].filter((_, index) => index !== entryIndex),
        }));
    }, []);

    const updateExercise = useCallback((id: string, updatedExercise: Omit<Exercise, "id">) => {
        setExercises((prevExercises) =>
            prevExercises.map((exercise) =>
                exercise.id === id ? { ...exercise, ...updatedExercise } : exercise
            )
        );
    }, []);

    return (
        <ExerciseContext.Provider
            value={{
                exercises,
                setExercises,
                setExerciseHistory,
                addExercise,
                deleteExercise,
                exerciseHistory,
                addExerciseToHistory,
                updateExerciseHistoryEntry,
                deleteExerciseHistoryEntry,
                updateExercise,
                trainingInterval,
                setTrainingInterval,
            }}
        >
            {children}
        </ExerciseContext.Provider>
    );
};

export const useExerciseContext = () => {
    const context = useContext(ExerciseContext);
    if (context === undefined) {
        throw new Error("useExerciseContext must be used within an ExerciseProvider");
    }
    return context;
};
