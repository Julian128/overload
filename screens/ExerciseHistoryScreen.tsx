import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    Button,
    TextInput,
    StyleSheet,
    Alert,
    Vibration,
    TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/Ionicons";
import { useExerciseContext } from "../contexts/ExerciseContext";
import { ExerciseHistoryScreenRouteProp } from "../types/navigation";
import { ExerciseHistoryEntry } from "../models/Exercise";

const ExerciseHistoryScreen = () => {
    const route = useRoute<ExerciseHistoryScreenRouteProp>();
    const { exerciseId } = route.params;
    const {
        exercises,
        exerciseHistory,
        addExerciseToHistory,
        updateExerciseHistoryEntry,
        deleteExerciseHistoryEntry,
        timerRunning,
        timeLeft,
        startTimer,
        stopTimer,
    } = useExerciseContext();

    const [sets, setSets] = useState("");
    const [reps, setReps] = useState("");
    const [rpe, setRpe] = useState("");
    const [weight, setWeight] = useState("");
    const { oneRepMaxFormula } = useExerciseContext();
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const swipeableRefs = useRef<(Swipeable | null)[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const exercise = exercises.find((e) => e.id === exerciseId);
    const history = exerciseHistory[exerciseId] || [];

    const calculateOneRepMax = (weight: number, reps: number): number => {
        switch (oneRepMaxFormula) {
            case "brzycki":
                return Math.floor(weight / (1.0278 - 0.0278 * reps));
            case "epley":
                return Math.floor(weight * (1 + 0.0333 * reps));
            case "lander":
                return Math.floor((100 * weight) / (101.3 - 2.67123 * reps));
            default:
                return 0;
        }
    };

    const fillFromLastWorkout = useCallback(() => {
        if (history.length > 0) {
            const lastWorkout = history[history.length - 1];
            setSets(lastWorkout.sets.toString());
            setReps(lastWorkout.reps.toString());
            setWeight((lastWorkout.weight + 2.5).toString());
            setRpe(lastWorkout.rpe.toString());
        }
    }, [history]);

    const handleAddOrUpdateEntry = () => {
        if (!sets.trim() || !reps.trim() || !weight.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        const entry: ExerciseHistoryEntry = {
            date: editingIndex !== null ? history[editingIndex].date : new Date(),
            sets: parseInt(sets, 10),
            reps: parseInt(reps, 10),
            weight: parseFloat(weight),
            rpe: parseInt(rpe, 10),
        };

        if (editingIndex !== null) {
            updateExerciseHistoryEntry(exerciseId, editingIndex, entry);
            setEditingIndex(null);
        } else {
            addExerciseToHistory(exerciseId, entry);
        }

        setSets("");
        setReps("");
        setWeight("");
        setRpe(""); // Clear RPE input
    };

    const handleEditEntry = (entry: ExerciseHistoryEntry, index: number) => {
        setEditingIndex(index);
        setSets(entry.sets.toString());
        setReps(entry.reps.toString());
        setWeight(entry.weight.toString());
    };

    const handleDeleteEntry = useCallback(
        (index: number) => {
            Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {
                        // Clear editing state if we're deleting the entry being edited
                        if (editingIndex === index) {
                            setEditingIndex(null);
                            setSets("");
                            setReps("");
                            setWeight("");
                        }
                        deleteExerciseHistoryEntry(exerciseId, index);
                        swipeableRefs.current.forEach((ref) => ref?.close());
                    },
                    style: "destructive",
                },
            ]);
        },
        [deleteExerciseHistoryEntry, exerciseId, editingIndex]
    );

    const renderHistoryItem = ({ item, index }: { item: ExerciseHistoryEntry; index: number }) => (
        <Swipeable
            ref={(el) => (swipeableRefs.current[index] = el)}
            renderRightActions={() => (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEntry(index)}
                >
                    <Icon name="trash-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            )}
            rightThreshold={40}
        >
            <TouchableOpacity
                style={styles.historyItem}
                onPress={() => handleEditEntry(item, index)}
            >
                <Text>{new Date(item.date).toLocaleDateString()}</Text>
                <Text>
                    {item.sets} sets x {item.reps} reps @ {item.weight} kg{" "}
                    {item.rpe ? ` (RPE ${item.rpe})` : ""}
                </Text>
            </TouchableOpacity>
        </Swipeable>
    );

    if (!exercise) {
        return <Text>Exercise not found</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{exercise?.name}</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity onPress={fillFromLastWorkout} style={styles.fillButton}>
                        <Icon name="arrow-up" size={25} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={timerRunning ? stopTimer : startTimer}>
                        <View style={styles.timerContainer}>
                            <Text style={styles.timerText}>{timeLeft}</Text>
                            <Icon
                                name={timerRunning ? "pause" : "play"}
                                size={20}
                                color="#007AFF"
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Sets"
                    value={sets}
                    onChangeText={setSets}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Reps"
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Weight"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="RPE"
                    value={rpe}
                    onChangeText={setRpe}
                    keyboardType="numeric"
                />
            </View>
            <Button
                title={editingIndex !== null ? "Update Entry" : "Add to History"}
                onPress={handleAddOrUpdateEntry}
            />
            <FlatList
                data={[...history].reverse()}
                renderItem={renderHistoryItem}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginRight: 10,
        borderRadius: 5,
    },
    historyItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: "#FF3B30",
        justifyContent: "center",
        alignItems: "center",
        width: 80,
        height: "100%",
    },
    historyItemContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    oneRepMax: {
        color: "#666",
        fontWeight: "bold",
    },
    timerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    timerText: { fontSize: 20, fontWeight: "bold" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    headerButtons: {
        flexDirection: "row",
        alignItems: "center",
    },
    fillButton: {
        backgroundColor: "#f0f0f0",
        marginRight: 20,
    },
});

export default ExerciseHistoryScreen;
