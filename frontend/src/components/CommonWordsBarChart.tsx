import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { Box, Flex, Text, VStack, HStack } from "@chakra-ui/react";

// Mock CSV data
const mockCSV = `
state,year,content
CA,2023,"hello world example example example"
CA,2023,"another example world test"
NY,2023,"hello another test world"
CA,2022,"sample sample test test"
NY,2022,"world world world hello"
`;

const CommonWordsBarChart = () => {
  const selectedYear = "2023"; // Hardcoded for testing
  const selectedState = "CA"; // Hardcoded for testing

  const [chartData, setChartData] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });

  useEffect(() => {
    Papa.parse(mockCSV, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        // Filter data by year and state
        const filteredData = result.data.filter(
          (row: any) => row.year.toString() === selectedYear && row.state === selectedState
        );

        if (filteredData.length === 0) {
          console.error(`No data found for ${selectedState} in ${selectedYear}`);
          return;
        }

        // Word extraction logic
        const stopWords = ["the", "and", "to", "a", "of", "in", "for", "on", "with", "at", "by", "an", "this", "that", "it"];
        let wordCounts: { [key: string]: number } = {};

        filteredData.forEach((row: any) => {
          const words = row.content
            .split(/\W+/)
            .map((word: string) => word.toLowerCase())
            .filter((word: string) => word && !stopWords.includes(word));

          words.forEach((word: string) => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          });
        });

        const topWords = Object.entries(wordCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        const chartLabels = topWords.map((entry: [string, number]) => entry[0]);
        const chartValues = topWords.map((entry: [string, number]) => entry[1]);

        setChartData({
          labels: chartLabels,
          values: chartValues,
        });
      },
      error: (error) => {
        console.error("CSV Parsing Error:", error);
      },
    });
  }, [selectedYear, selectedState]);

  if (!chartData.labels.length) return <Text>Loading chart...</Text>;

  // Max value to scale the bar heights
  const maxValue = Math.max(...chartData.values);

  return (
    <Box p={5} borderRadius="md" shadow="md" width="100%">
      <Flex direction="column" align="center">
        <Text fontSize="2xl" mb={4}>
          Top 5 Most Common Words in {selectedState} ({selectedYear})
        </Text>
        <VStack spacing={4} width="100%">
          {/* Loop over chart data and display each bar */}
          {chartData.labels.map((label, index) => {
            const value = chartData.values[index];
            const barHeight = `${(value / maxValue) * 80}%`;
            return (
              <HStack key={label} width="100%" spacing={4} align="center" justify="flex-start">
                {/* Label for the bar */}
                <Text width="100px" fontSize="lg">{label}</Text>

                {/* Bar itself */}
                <Box
                  height="30px"
                  width={barHeight}
                  backgroundColor="teal.500"
                  borderRadius="md"
                  display="inline-block"
                />

                {/* Value of the bar */}
                <Text>{value}</Text>
              </HStack>
            );
          })}
        </VStack>
      </Flex>

    </Box>
  );
};

export default CommonWordsBarChart;

