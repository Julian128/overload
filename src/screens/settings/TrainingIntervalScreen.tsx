// screens/TrainingIntervalScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { useExerciseContext } from "../../contexts/ExerciseContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../types/navigation";
import { lightTheme, darkTheme, createTrainingIntervalStyles } from "../../../styles/globalStyles";

type TrainingIntervalScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "TrainingInterval"
>;

const TrainingIntervalScreen = () => {
    const navigation = useNavigation<TrainingIntervalScreenNavigationProp>();
    const { trainingInterval, setTrainingInterval } = useExerciseContext();
    const [selectedInterval, setSelectedInterval] = useState(trainingInterval);
    const [isSetup, setIsSetup] = useState(false);
    const { theme } = useTheme();
    const currentTheme = theme === "light" ? lightTheme : darkTheme;
    const styles = createTrainingIntervalStyles(currentTheme);

    useEffect(() => {
        checkIfSetup();
    }, []);

    const checkIfSetup = async () => {
        const alreadySetup = await AsyncStorage.getItem("alreadySetup");
        setIsSetup(alreadySetup !== "true");
    };

    const generatePickerItems = () => {
        const items = [];
        for (let i = 1; i <= 30; i++) {
            items.push(
                <Picker.Item
                    key={i}
                    label={`${i} days`}
                    value={i}
                    color={currentTheme.colors.text}
                />
            );
        }
        return items;
    };

    const handleSave = async () => {
        setTrainingInterval(selectedInterval);
        if (isSetup) {
            await AsyncStorage.setItem("alreadySetup", "true");
            navigation.navigate("Home");
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Training Interval</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedInterval}
                    onValueChange={(itemValue) => setSelectedInterval(itemValue)}
                    style={styles.picker}
                    dropdownIconColor={currentTheme.colors.text}
                >
                    {generatePickerItems()}
                </Picker>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{isSetup ? "Next" : "Save"}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default TrainingIntervalScreen;
