import React, { useEffect, useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";

// Mock CSV data with emotions
const mockCSV = `
state,year,emotion
CA,2023,Happy
CA,2023,Happy
CA,2023,Sad
NY,2023,Neutral
CA,2023,Angry
NY,2023,Happy
CA,2023,Sad
NY,2023,Neutral
NY,2023,Happy
`;

const EmotionPieChart = () => {
  const selectedYear = "2023"; // Hardcoded for testing
  const selectedState = "CA"; // Hardcoded for testing

  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    // Mock CSV parsing logic
    const parsedData = mockCSV.split("\n").map(row => row.split(","));
    const filteredData = parsedData.filter(
      (row: string[]) => row[1] === selectedYear && row[0] === selectedState
    );

    const emotionCounts: { [key: string]: number } = {};
    filteredData.forEach((row: string[]) => {
      const emotion = row[2];
      if (emotion) {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }
    });

    const chartData = Object.entries(emotionCounts).map(([key, value]) => ({
      name: key,
      value,
    }));

    setChartData(chartData);
  }, [selectedYear, selectedState]);

  // Pie chart color map
  const COLORS: { [key: string]: string } = {
    Happy: "#FFD700", // Gold
    Sad: "#1E90FF",   // Dodger Blue
    Neutral: "#D3D3D3", // Light Gray
    Angry: "#FF6347",  // Tomato
  };

  // Total value to calculate angles for each slice
  const totalValue = chartData.reduce((sum, entry) => sum + entry.value, 0);

  // Calculate the start and end angle for each slice
  let cumulativeAngle = 0;
  const slices = chartData.map(entry => {
    const angle = (entry.value / totalValue) * 360;
    const slice = {
      name: entry.name,
      color: COLORS[entry.name] || "#8884d8",
      startAngle: cumulativeAngle,
      endAngle: cumulativeAngle + angle,
    };
    cumulativeAngle += angle;
    return slice;
  });

  return (
    <Box p={5} borderRadius="md" shadow="md" width="100%">
      <Flex direction="column" align="center">
        <Text fontSize="2xl" mb={4}>
          Emotion Distribution in {selectedState} ({selectedYear})
        </Text>
        <Box
          width="200px"
          height="200px"
          borderRadius="50%"
          position="relative"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="center"
          background={`conic-gradient(${slices.map(
            (slice) => `${slice.color} ${slice.startAngle}deg ${slice.endAngle}deg`
          ).join(", ")})`}
        >
          <Text fontSize="md" color="white" fontWeight="bold">
            {selectedState} ({selectedYear})
          </Text>
        </Box>
        <Flex mt={4} direction="column" align="center">
          {slices.map((slice, index) => (
            <Text key={index} color={slice.color}>
              {slice.name}: {chartData[index]?.value}
            </Text>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

export default EmotionPieChart;
