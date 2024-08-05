// screens/StatsScreen.tsx
import React, { useMemo } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useExerciseContext } from "../contexts/ExerciseContext";
import { useTheme } from "../contexts/ThemeContext";
import { lightTheme, darkTheme, createStatsStyles } from "../styles/globalStyles";
import { subDays, isAfter } from "date-fns";
import { Exercise, ExerciseHistoryEntry } from "../models/Exercise";

const calculateMovingAverage = (data: number[], windowSize: number): number[] => {
    let result = data.map((_, index, array) => {
        const start = Math.max(0, index - windowSize + 1);
        const window = array.slice(start, index + 1);
        return window.reduce((sum, value) => sum + value, 0) / window.length;
    });
    result = result.slice(-windowSize);

    // check if the moving average is valid
    if (result.some((load: number) => isNaN(load))) {
        return Array(windowSize).fill(0);
    }
    return result;
};

const StatsScreen = () => {
    const { theme } = useTheme();
    const currentTheme = theme === "light" ? lightTheme : darkTheme;
    const styles = createStatsStyles(currentTheme);
    const { exercises, exerciseHistory, trainingInterval } = useExerciseContext();

    const {
        strengthLoadData,
        enduranceLoadData,
        mobilityLoadData,
        strengthLoadDataForMA,
        enduranceLoadDataForMA,
        mobilityLoadDataForMA,
        targetStrengthLoad,
        targetEnduranceLoad,
        targetMobilityLoad,
        actualStrengthLoad,
        actualEnduranceLoad,
        actualMobilityLoad,
        actualStrengthSets,
        targetStrengthSets,
        actualMobilitySets,
        targetMobilitySets,
    } = useMemo(() => {
        console.log("Recalculating stats data");
        console.log("trainingInterval: ", trainingInterval);
        const today = new Date();
        const intervalStart = subDays(today, trainingInterval);

        let strengthLoadByDay = Array(trainingInterval).fill(0);
        let enduranceLoadByDay = Array(trainingInterval).fill(0);
        let mobilityLoadByDay = Array(trainingInterval).fill(0);

        // make sure length of strengthLoadByDay, enduranceLoadByDay, and mobilityLoadByDay is equal to trainingInterval
        while (strengthLoadByDay.length < trainingInterval) {
            strengthLoadByDay.push(0);
        }
        while (enduranceLoadByDay.length < trainingInterval) {
            enduranceLoadByDay.push(0);
        }
        while (mobilityLoadByDay.length < trainingInterval) {
            mobilityLoadByDay.push(0);
        }

        console.log("strengthLoadByDay: ", strengthLoadByDay);

        const intervalStartForMA = subDays(today, trainingInterval * 2);
        const strengthLoadByDayForMA = Array(trainingInterval * 2).fill(0);
        const enduranceLoadByDayForMA = Array(trainingInterval * 2).fill(0);
        const mobilityLoadByDayForMA = Array(trainingInterval * 2).fill(0);

        let targetStrengthLoad = 0;
        let targetEnduranceLoad = 0;
        let targetMobilityLoad = 0;
        let actualStrengthLoad = 0;
        let actualEnduranceLoad = 0;
        let actualMobilityLoad = 0;
        let targetStrengthSets = 0;
        let actualStrengthSets = 0;
        let targetMobilitySets = 0;
        let actualMobilitySets = 0;
        let totalWeeklyEnduranceSets = 0;

        exercises.forEach((exercise: Exercise) => {
            const history = exerciseHistory[exercise.id] || [];
            const isEndurance = exercise.category === "endurance";
            const isMobility = exercise.category === "mobility";

            if (isEndurance) {
                targetEnduranceLoad += exercise.weeklySets * (exercise.distance ?? 0);
                totalWeeklyEnduranceSets += exercise.weeklySets;
            } else if (isMobility) {
                targetMobilityLoad += exercise.weeklySets;
                targetMobilitySets += exercise.weeklySets;
            } else {
                targetStrengthLoad += exercise.weeklySets * exercise.targetRPE;
                targetStrengthSets += exercise.weeklySets;
            }

            history.forEach((entry: ExerciseHistoryEntry) => {
                const entryDate = new Date(entry.date);
                if (isAfter(entryDate, intervalStart)) {
                    const dayIndex =
                        trainingInterval -
                        Math.ceil((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (dayIndex >= 0 && dayIndex < trainingInterval) {
                        if (isEndurance) {
                            const load = entry.distance ?? 0;
                            enduranceLoadByDay[dayIndex] += load;
                            actualEnduranceLoad += load;
                        } else if (isMobility) {
                            const load = entry.sets ?? 0;
                            mobilityLoadByDay[dayIndex] += load;
                            actualMobilityLoad += load;
                            actualMobilitySets += entry.sets ?? 0;
                        } else {
                            const load = (entry.sets ?? 0) * entry.rpe;
                            strengthLoadByDay[dayIndex] += load;
                            actualStrengthLoad += load;
                            actualStrengthSets += entry.sets ?? 0;
                        }
                    }
                }
            });

            // data to calculate moving average
            history.forEach((entry: ExerciseHistoryEntry) => {
                const entryDate = new Date(entry.date);
                if (isAfter(entryDate, intervalStartForMA)) {
                    const dayIndex =
                        trainingInterval * 2 -
                        Math.ceil((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (dayIndex >= 0 && dayIndex < trainingInterval * 2) {
                        if (isEndurance) {
                            const load = entry.distance ?? 0;
                            enduranceLoadByDayForMA[dayIndex] += load;
                        } else if (isMobility) {
                            const load = entry.sets ?? 0;
                            mobilityLoadByDayForMA[dayIndex] += load;
                        } else {
                            const load = (entry.sets ?? 0) * entry.rpe;
                            strengthLoadByDayForMA[dayIndex] += load;
                        }
                    }
                }
            });
        });

        // print out the stats
        console.log(strengthLoadByDay.map((load) => Math.max(load, 0)));
        console.log(enduranceLoadByDay.map((load) => Math.max(load, 0)));
        console.log(mobilityLoadByDay.map((load) => Math.max(load, 0)));
        console.log("intervalStart", intervalStart);
        return {
            strengthLoadData: strengthLoadByDay.map((load) => Math.max(load, 0)),
            enduranceLoadData: enduranceLoadByDay.map((load) => Math.max(load, 0)),
            mobilityLoadData: mobilityLoadByDay.map((load) => Math.max(load, 0)),
            strengthLoadDataForMA: strengthLoadByDayForMA.map((load) => Math.max(load, 0)),
            enduranceLoadDataForMA: enduranceLoadByDayForMA.map((load) => Math.max(load, 0)),
            mobilityLoadDataForMA: mobilityLoadByDayForMA.map((load) => Math.max(load, 0)),
            targetStrengthLoad: Math.max(targetStrengthLoad, 0),
            targetEnduranceLoad: Math.max(targetEnduranceLoad, 0),
            targetMobilityLoad: Math.max(targetMobilityLoad, 0),
            actualStrengthLoad,
            actualEnduranceLoad,
            actualMobilityLoad,
            targetStrengthSets,
            actualStrengthSets,
            targetMobilitySets,
            actualMobilitySets,
            totalWeeklyEnduranceSets,
        };
    }, [exercises, exerciseHistory, trainingInterval]);

    const createChartData = (loadData: number[], dataForMA: number[], targetLoad: number) => {
        loadData = loadData.map((value) => (isNaN(value) ? 0 : value));
        const movingAverage = calculateMovingAverage(dataForMA, trainingInterval);

        const result = {
            labels: Array.from(
                { length: loadData.length }, // Use loadData.length instead of trainingInterval
                (_, i) => `${i === loadData.length - 1 ? "Today" : -loadData.length + i + 1}`
            ),
            datasets: [
                {
                    data: loadData,
                    color: (opacity = 1) => currentTheme.colors.primary,
                    strokeWidth: 1,
                },
                {
                    data: Array(trainingInterval).fill(targetLoad),
                    color: (opacity = 1) => "rgba(255, 0, 0, 0.8)",
                    strokeWidth: 1,
                },
                {
                    data: movingAverage,
                    color: (opacity = 1) => "rgba(0, 255, 0, 0.8)",
                    strokeWidth: 1,
                },
            ],
            legend: [`Actual`, `Target`, `MA`],
        };

        if (
            result.datasets[0].data.some((load: number) => isNaN(load)) ||
            result.datasets[1].data.some((load: number) => isNaN(load)) ||
            result.datasets[2].data.some((load: number) => isNaN(load)) ||
            result.datasets[0].data.length != trainingInterval ||
            result.datasets[2].data.length != trainingInterval
        ) {
            console.log(result.datasets[0].data);
            console.log(result.datasets[1].data);
            console.log(result.datasets[2].data);
            console.log(trainingInterval);
            console.log("Invalid data for chart");
        }
        return result;
    };

    const renderChart = (chartData: any, title: string) => {
        const screenWidth = Dimensions.get("window").width;

        if (!chartData) {
            return null;
        }

        return (
            <View>
                <Text style={styles.title}>{title}</Text>
                {chartData.datasets[0].data.some((load: number) => load > 0) ? (
                    <LineChart
                        data={chartData}
                        width={screenWidth - 16}
                        height={220}
                        yAxisLabel=""
                        chartConfig={{
                            backgroundColor: currentTheme.colors.background,
                            backgroundGradientFrom: currentTheme.colors.background,
                            backgroundGradientTo: currentTheme.colors.background,
                            decimalPlaces: 1, // Set decimal places to 2 for more precision
                            color: (opacity = 1) => currentTheme.colors.text,
                            labelColor: (opacity = 1) => currentTheme.colors.text,
                            propsForBackgroundLines: {
                                strokeDasharray: "", // Solid gridlines
                                stroke: currentTheme.colors.text, // Ensure gridlines are visible and consistent
                            },
                            propsForDots: {
                                r: "3",
                                strokeWidth: "1",
                                stroke: currentTheme.colors.text,
                            },
                            strokeWidth: 2, // Width of the line
                            useShadowColorFromDataset: false, // Do not use shadow color from dataset
                            propsForLabels: {
                                fontSize: 12,
                                fontWeight: "bold",
                            },
                        }}
                        bezier
                        style={styles.chart}
                        formatYLabel={(value) => parseFloat(value).toFixed(1)} // Ensure y-axis labels are not rounded to integers
                        // verticalLabelRotation={30} // Adjusts rotation of x-axis labels for better readability
                        fromZero={true} // Ensures y-axis starts from zero
                    />
                ) : (
                    <Text style={styles.noDataText}>
                        No {title.toLowerCase()} training data available for the current interval
                    </Text>
                )}
            </View>
        );
    };

    const renderStrengthStats = (
        actualLoad: number,
        targetLoad: number,
        actualSets: number,
        totalSets: number,
        title: string
    ) => (
        <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>{title} Stats for this Interval</Text>
            <Text style={styles.statsText}>Target Load (Sets x RPE): {targetLoad.toFixed(1)}</Text>
            <Text style={styles.statsText}>Actual Load: {actualLoad.toFixed(1)}</Text>
            <Text style={styles.statsText}>Target Sets: {totalSets}</Text>
            <Text style={styles.statsText}>Actual Sets: {actualSets}</Text>
        </View>
    );

    const renderEnduranceStats = (
        totalWeeklyLoad: number,
        targetWeeklyLoad: number,
        title: string
    ) => (
        <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>{title} Stats for this Interval</Text>
            <Text style={styles.statsText}>Target Distance: {targetWeeklyLoad.toFixed(1)}</Text>
            <Text style={styles.statsText}>Actual Distance: {totalWeeklyLoad.toFixed(1)}</Text>
        </View>
    );

    const renderMobilityStats = (
        actualLoad: number,
        targetLoad: number,
        actualSets: number,
        totalSets: number,
        title: string
    ) => (
        <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>{title} Stats for this Interval</Text>
            {/* <Text style={styles.statsText}>Target Load (Sets x RPE): {targetLoad.toFixed(1)}</Text> */}
            {/* <Text style={styles.statsText}>Actual Load: {actualLoad.toFixed(1)}</Text> */}
            <Text style={styles.statsText}>Target Sets: {totalSets}</Text>
            <Text style={styles.statsText}>Actual Sets: {actualSets}</Text>
        </View>
    );

    const renderSeparator = () => <View style={styles.separator} />;

    return (
        <ScrollView style={styles.container}>
            {renderChart(
                createChartData(
                    strengthLoadData,
                    strengthLoadDataForMA,
                    targetStrengthLoad / trainingInterval
                ),
                "Strength"
            )}
            {renderStrengthStats(
                actualStrengthLoad,
                targetStrengthLoad,
                actualStrengthSets,
                targetStrengthSets,
                "Strength"
            )}

            {renderSeparator()}

            {renderChart(
                createChartData(
                    enduranceLoadData,
                    enduranceLoadDataForMA,
                    targetEnduranceLoad / trainingInterval
                ),
                "Endurance"
            )}
            {renderEnduranceStats(actualEnduranceLoad, targetEnduranceLoad, "Endurance")}

            {renderSeparator()}

            {renderChart(
                createChartData(
                    mobilityLoadData,
                    mobilityLoadDataForMA,
                    targetMobilityLoad / trainingInterval
                ),
                "Mobility"
            )}
            {renderMobilityStats(
                actualMobilityLoad,
                targetMobilityLoad,
                actualMobilitySets,
                targetMobilitySets,
                "Mobility"
            )}
        </ScrollView>
    );
};

export default StatsScreen;
