import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	Tooltip as RechartsTooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Box,
	Button,
	HStack,
	Spinner,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tooltip,
	Tr,
	VStack,
} from "@chakra-ui/react";
import { EmotionsService, KeywordsService } from "../client";

import WordCloud from "react-d3-cloud";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface EmotionData {
	name: string;
	value: number;
}
interface WordFrequency {
	word: string;
	count: number;
}

function WordFrequencyChart({ words }: { words: Record<string, number> }) {
	// Convert and sort data
	const data: WordFrequency[] = Object.entries(words)
		.map(([word, count]) => ({ word, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);

	console.log(data);
	return (
		<Box w="100%" h="100%" display="flex" justifyContent="center">
			<BarChart
				data={data}
				width={400}
				height={400}
				margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="word" />
				<YAxis />
				<RechartsTooltip />
				<Legend />
				<Bar dataKey="count" fill="#8884d8" name="Frequency" />
			</BarChart>
		</Box>
	);
}

const EmotionsPieChart = ({ emotionsCount }: { emotionsCount: Record<string, number> }) => {
	const COLORS = ["#0088FE", "#454545", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF69B4"];
	// Transform the data for Recharts
	const data: EmotionData[] = Object.entries(emotionsCount).map(([name, value]) => ({
		name,
		value,
	}));

	return (
		<Box w="100%" h="100%" display="flex" justifyContent="center">
			<PieChart width={600} height={400}>
				<Pie
					data={data}
					cx="50%"
					cy="50%"
					labelLine={false}
					label={({ name: emotion, percent: count }) => `${emotion} ${(count * 100).toFixed(0)}%`}
					outerRadius={120}
					fill="#8884d8"
					dataKey="value"
				>
					{data.map((_, index) => (
						<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
					))}
				</Pie>
				<RechartsTooltip />
				<Legend />
			</PieChart>
		</Box>
	);
};

interface AnalyticsReportProps {
	word: string; // Selected word for analytics
	state: string;
	year: number;
	onWordSelect: (word: string) => void;
	posts: string[]; // Array of Reddit posts
}

const ITEMS_PER_PAGE = 5;

function PaginatedTable({ posts }: { posts: string[] }) {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedPosts = posts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	return (
		<>
			<Box overflowX="auto">
				<TableContainer height="100%">
					<Table variant="simple" size="sm">
						<Thead position="sticky" top={0} bg="white" zIndex={1}>
							<Tr>
								<Th width="100px">No.</Th>
								<Th>Post Content</Th>
								<Th width="150px">Word Count</Th>
							</Tr>
						</Thead>
						<Tbody>
							{paginatedPosts.map((text, index) => (
								<Tr key={index} _hover={{ bg: "gray.50" }}>
									<Td>{index + 1}</Td>
									<Td maxW="400px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
										<Tooltip label={text}>
											<Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
												{text}
											</Text>
										</Tooltip>
									</Td>
									<Td isNumeric>{text.split(/\s+/).length}</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				</TableContainer>
			</Box>

			<HStack justify="center" mt={1}>
				<Button
					size="sm"
					onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
					isDisabled={currentPage === 1}
				>
					Previous
				</Button>

				<Text>
					Page {currentPage} of {totalPages}
				</Text>

				<Button
					size="sm"
					onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
					isDisabled={currentPage === totalPages}
				>
					Next
				</Button>
			</HStack>
		</>
	);
}

function AnalyticsReport({ word, state, year, onWordSelect, posts = [] }: AnalyticsReportProps) {
	// Filter posts by the selected word
	const filteredPostTexts = posts
		.filter((text) => text) // Remove null/undefined posts
		.filter((text) => text.toLowerCase().includes(word.toLowerCase()));

	const {
		isPending: isWordCloudPending,
		isError: isWordCloudError,
		data: wordCloudData,
		error: wordCloudError,
	} = useQuery({
		queryKey: ["wordCloudData", word, state, year],
		queryFn: () => KeywordsService.getStateWordCloud({ keyword: word, state, year }),
	});

	const { isPending: isEmotionsPending, data: emotionsData } = useQuery({
		queryKey: ["emotionsData", word, state, year],
		queryFn: () => EmotionsService.getStateEmotions({ keyword: word, state, year }),
	});

	if (isWordCloudPending || isEmotionsPending) {
		return (
			<VStack justifyContent="center" alignItems="center" minH="100vh">
				<Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
			</VStack>
		);
	}
	if (isWordCloudError) {
		return <div>Error: {wordCloudError.message}</div>;
	}

	const totalWords = Object.values(wordCloudData.words).reduce((sum, count) => sum + count, 0);
	const wordCloud = Object.entries(wordCloudData.words).map(([word, freq]) => ({
		text: word,
		value: ((freq as number) / (totalWords as number)) * 1500,
	}));

	const emotionsCount = emotionsData?.emotion_counts;

	return (
		<VStack spacing={4} align="stretch" h="100%">
			{/* First Row */}
			<Box flex="2" minH="200px" borderRadius="md" border={"1px solid rgba(0, 0, 0, 0.1)"}>
				<WordCloud
					data={wordCloud}
					width={1300}
					height={300}
					font="arial"
					fontSize={(d) => d.value}
					padding={5}
					rotate={(d) => d.rotate || 0}
				></WordCloud>
			</Box>

			{/* Second Row with two columns */}
			<HStack spacing={4} flex="1" minH="400px">
				<Box flex="1" minH="400px" borderRadius="md" border={"1px solid rgba(0, 0, 0, 0.1)"}>
					<WordFrequencyChart words={wordCloudData.words} />
				</Box>
				<Box flex="1" minH="400px" borderRadius="md" border={"1px solid rgba(0, 0, 0, 0.1)"}>
					<EmotionsPieChart emotionsCount={emotionsCount} />
				</Box>
			</HStack>

			{/* Third Row */}
			<Box flex="2" minH="200px" borderRadius="md" border={"1px solid rgba(0, 0, 0, 0.1)"}>
				{word && (
					<VStack spacing={4} align="stretch" overflow="hidden">
						<Box flexShrink={0}>
							<Text fontSize="xl" fontWeight="bold">
								Original Posts containing "{word}"
							</Text>
							<Text mb={4}>Number of Posts: {filteredPostTexts.length}</Text>
						</Box>

						<Box flex="1" overflow="auto">
							<PaginatedTable posts={filteredPostTexts} />
						</Box>
					</VStack>
				)}
			</Box>
		</VStack>
	);
}

export default AnalyticsReport;
