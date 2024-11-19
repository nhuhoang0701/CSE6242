import React from "react";
import { Box } from "@chakra-ui/react";
import WordCloud from "react-d3-cloud";

interface Word {
	text: string;
	value: number;
	color?: string;
	rotate?: number;
}

export interface Word3DCloudProps {
	words: Word[];
	width?: number;
	height?: number;
	onWordSelect?: (word: string) => void; // Callback for word selection
}

const Word3DCloud = ({ words, width, height, onWordSelect }: Word3DCloudProps) => {
	// Define the onWordClick handler
	const handleWordClick = (word) => {
		if (onWordSelect) {
			onWordSelect(word.text); // Call the callback with the selected word text
		}
	};

	return (
		<Box borderRadius="lg" p={4} border={"1px solid"} borderColor={"gray.200"}>
			<WordCloud
				data={words}
				width={1500}
				height={height}
				font="arial"
				fontSize={(d) => d.value}
				padding={5}
				rotate={(d) => d.rotate || 0}
				onWordClick={handleWordClick} // Set the click handler
			/>
		</Box>
	);
};

export default Word3DCloud;
