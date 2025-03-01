// screens/WelcomeScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AppleHealthKit from "react-native-health";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { useTheme } from "../contexts/ThemeContext";
import { lightTheme, darkTheme, createWelcomeStyles } from "../../styles/globalStyles";
import { healthKitPermissions } from "../utils/healthKitPermissions";
import { useHealthKit } from "../contexts/HealthKitContext";
import { useExerciseContext } from "../contexts/ExerciseContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Welcome">;

const HealthKitIntroSteps = [
    {
        title: "Health Data Integration",
        description:
            "Overload Training uses Apple HealthKit to import your running workouts seamlessly into the app.",
        icon: "heart-pulse",
    },
    {
        title: "Data We Access",
        description: "We only access your running workout data to import your runs into the app.",
        icon: "run",
    },
    {
        title: "Your Privacy Matters",
        description:
            "Your health data stays on your device and is only used to display your running history.",
        icon: "shield-check",
    },
];

const WelcomeScreen = () => {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();
    const { theme } = useTheme();
    const currentTheme = theme === "light" ? lightTheme : darkTheme;
    const styles = createWelcomeStyles(currentTheme);
    const { exercises } = useExerciseContext(); // Get exercises from context

    const [showHealthKitIntro, setShowHealthKitIntro] = useState(true);
    const [currentIntroStep, setCurrentIntroStep] = useState(0);
    const { setIsHealthKitAuthorized } = useHealthKit();

    const initializeHealthKit = () => {
        if (Platform.OS === "ios") {
            AppleHealthKit.initHealthKit(healthKitPermissions, async (error: string) => {
                if (error) {
                    console.log("[ERROR] Cannot initialize HealthKit:", error);
                    Alert.alert(
                        "HealthKit Access",
                        "We need access to HealthKit to import your workouts."
                    );
                } else {
                    console.log("HealthKit initialized successfully");
                    setIsHealthKitAuthorized(true);

                    // Set alreadySetup to true in AsyncStorage
                    try {
                        await AsyncStorage.setItem("alreadySetup", "true");
                        console.log("App setup completed and saved to AsyncStorage");
                    } catch (storageError) {
                        console.error("Error saving setup state:", storageError);
                    }

                    // Check if there are exercises in the context
                    if (exercises && exercises.length > 0) {
                        navigation.navigate("Home");
                    } else {
                        navigation.navigate("OnboardingWizard");
                    }
                }
            });
        } else {
            // For non-iOS platforms, still mark setup as complete
            try {
                AsyncStorage.setItem("alreadySetup", "true");

                // Check if there are exercises in the context
                if (exercises && exercises.length > 0) {
                    navigation.navigate("Home");
                } else {
                    navigation.navigate("OnboardingWizard");
                }
            } catch (storageError) {
                console.error("Error saving setup state:", storageError);

                // Even with an error, we should still navigate based on exercises
                if (exercises && exercises.length > 0) {
                    navigation.navigate("Home");
                } else {
                    navigation.navigate("OnboardingWizard");
                }
            }
        }
    };

    const renderHealthKitIntro = () => {
        const step = HealthKitIntroSteps[currentIntroStep];

        return (
            <View style={styles.introContainer}>
                <Icon
                    name={step.icon}
                    size={80}
                    color={currentTheme.colors.primary}
                    style={styles.introIcon}
                />
                <Text style={[styles.introTitle, { color: currentTheme.colors.text }]}>
                    {step.title}
                </Text>
                <Text style={[styles.introDescription, { color: currentTheme.colors.text }]}>
                    {step.description}
                </Text>

                <View style={styles.introDots}>
                    {HealthKitIntroSteps.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor:
                                        currentIntroStep === index
                                            ? currentTheme.colors.primary
                                            : currentTheme.colors.border,
                                },
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: currentTheme.colors.primary }]}
                    onPress={() => {
                        if (currentIntroStep === HealthKitIntroSteps.length - 1) {
                            initializeHealthKit();
                        } else {
                            setCurrentIntroStep((prev) => prev + 1);
                        }
                    }}
                >
                    <Text style={[styles.buttonText, { color: currentTheme.colors.background }]}>
                        {"Continue"}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: currentTheme.colors.background }]}
        >
            {showHealthKitIntro && renderHealthKitIntro()}
        </SafeAreaView>
    );
};

export default WelcomeScreen;
