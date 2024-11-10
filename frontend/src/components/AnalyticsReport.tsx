import React from "react";
import { Box, Text } from "@chakra-ui/react";

interface AnalyticsReportProps {
	word: string;
}

const AnalyticsReport: React.FC<AnalyticsReportProps> = ({ word }) => {
	return (
		<Box p={4} borderRadius="md" border="1px solid" borderColor="gray.200">
			<Text fontSize="lg" fontWeight="bold">
				Analytics Report for: {word}
			</Text>
			{/* Add your analytics content here */}
			<Text mt={4}>
				{/* Example: Display stats or charts based on the word */}
				This is where you would display analytics data related to "{word}".
			</Text>
		</Box>
	);
};

export default AnalyticsReport;
