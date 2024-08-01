// screens/AddExerciseScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useExerciseContext } from "../contexts/ExerciseContext";
import { AddExerciseScreenNavigationProp, AddExerciseScreenRouteProp } from "../types/navigation";
import { Exercise } from "../models/Exercise";

const AddExerciseScreen = () => {
    const { addExercise, updateExercise, exercises } = useExerciseContext();
    const navigation = useNavigation<AddExerciseScreenNavigationProp>();
    const route = useRoute<AddExerciseScreenRouteProp>();
    const exerciseId = route.params?.exerciseId;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [setsPerWeek, setSetsPerWeek] = useState("");
    const [category, setCategory] = useState("");

    useEffect(() => {
        if (exerciseId) {
            const exercise = exercises.find((e) => e.id === exerciseId);
            if (exercise) {
                setName(exercise.name);
                setDescription(exercise.description);
                setSetsPerWeek(exercise.setsPerWeek.toString());
                setCategory(exercise.category);
            }
        }
    }, [exerciseId, exercises]);

    const handleAddOrUpdateExercise = () => {
        if (!name.trim() || !setsPerWeek.trim() || !category.trim()) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        const exerciseData: Omit<Exercise, "id"> = {
            name,
            description,
            setsPerWeek: parseInt(setsPerWeek, 10),
            category,
        };

        if (exerciseId) {
            updateExercise(exerciseId, exerciseData);
        } else {
            addExercise({ ...exerciseData, id: Date.now().toString() });
        }

        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Exercise Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
            />
            <TextInput
                style={styles.input}
                placeholder="Sets per Week"
                value={setsPerWeek}
                onChangeText={setSetsPerWeek}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
            />
            <Button
                title={exerciseId ? "Update Exercise" : "Add Exercise"}
                onPress={handleAddOrUpdateExercise}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
});

export default AddExerciseScreen;
