import React, { useState, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useExerciseContext } from "../../contexts/ExerciseContext";
import { Set } from "../../models/Exercise";
import { useTheme } from "../../contexts/ThemeContext";
import { lightTheme, darkTheme, createNsunsExerciseHistoryStyles } from "../../styles/globalStyles";

interface NSunsHistoryScreenProps {
    exerciseId: string;
}

const NSunsHistoryScreen: React.FC<NSunsHistoryScreenProps> = ({ exerciseId }) => {
    const { theme } = useTheme();
    const currentTheme = theme === "light" ? lightTheme : darkTheme;
    const styles = createNsunsExerciseHistoryStyles(currentTheme);

    const { exercises, updateExercise } = useExerciseContext();
    const [exercise, setExercise] = useState(exercises.find((e) => e.id === exerciseId));
    const [isEditing1RM, setIsEditing1RM] = useState(false);
    const [editedOneRepMax, setEditedOneRepMax] = useState(exercise?.oneRepMax?.toString() || "");
    const inputRef = useRef<TextInput>(null);

    const workout: Set[] = exercise?.workout || [];

    const [completedSets, setCompletedSets] = useState<boolean[]>(() =>
        new Array(workout.length).fill(false)
    );

    const handleEdit1RM = () => {
        setIsEditing1RM(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleSave1RM = () => {
        const newOneRepMax = parseFloat(editedOneRepMax);
        if (!isNaN(newOneRepMax) && exercise) {
            const updatedExercise = { ...exercise, oneRepMax: newOneRepMax };
            updateExercise(exerciseId, updatedExercise);
            setExercise(updatedExercise);
        }
        setIsEditing1RM(false);
    };
    const toggleSet = (index: number) => {
        setCompletedSets((prev) => {
            const newCompletedSets = [...prev];
            newCompletedSets[index] = !newCompletedSets[index];
            return newCompletedSets;
        });
    };

    const renderSet = useCallback(
        ({ item, index }: { item: Set; index: number }) => (
            <TouchableOpacity style={styles.setItem} onPress={() => toggleSet(index)}>
                <View>
                    <Text style={styles.setText}>
                        {`${item.reps} reps at ${
                            (item.relativeWeight * (exercise?.oneRepMax || 1)) / 100
                        } kg`}
                    </Text>
                    <Text style={styles.percentText}>
                        {`${item.relativeWeight.toFixed(0)}% of 1 RM`}
                    </Text>
                </View>
                <View style={styles.iconContainer}>
                    {completedSets[index] ? (
                        <Icon
                            name="checkmark-circle"
                            size={24}
                            color={currentTheme.colors.primary}
                        />
                    ) : (
                        <View style={styles.placeholderIcon} />
                    )}
                </View>
            </TouchableOpacity>
        ),
        [completedSets, currentTheme.colors.primary, exercise?.oneRepMax]
    );

    if (!exercise) {
        return <Text>Exercise not found</Text>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{exercise.name}</Text>
                <TouchableOpacity onPress={handleEdit1RM} style={styles.oneRepMaxContainer}>
                    <Text style={styles.oneRepMaxLabel}> 1 RM: </Text>
                    {isEditing1RM ? (
                        <TextInput
                            ref={inputRef}
                            style={styles.oneRepMaxValue}
                            value={editedOneRepMax}
                            onChangeText={setEditedOneRepMax}
                            keyboardType="numeric"
                            onBlur={handleSave1RM}
                            onSubmitEditing={handleSave1RM}
                        />
                    ) : (
                        <Text style={styles.oneRepMaxValue}>
                            {exercise.oneRepMax?.toFixed(0) || "N/A"}
                        </Text>
                    )}
                    <Text style={styles.oneRepMaxValue}> kg</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={workout}
                renderItem={renderSet}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
};

export default NSunsHistoryScreen;
