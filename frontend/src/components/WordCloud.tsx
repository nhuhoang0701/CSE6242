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
}

const Word3DCloud = ({ words, width, height }: Word3DCloudProps) => {
	return (
		<Box borderRadius="lg" p={4} border={"1px solid"} borderColor={"gray.200"}>
			<WordCloud
				data={words}
				width={width}
				height={height}
				font="arial"
				fontSize={(d) => d.value}
				padding={5}
				rotate={(d) => d.rotate || 0}
			/>
		</Box>
	);
};

export default Word3DCloud;
