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

import { KeywordsService } from "../client";
import WordCloud from "react-d3-cloud";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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

			<HStack justify="center" mt={4}>
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

	if (isWordCloudPending) {
		return (
			<VStack justifyContent="center" alignItems="center" minH="100vh">
				<Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
			</VStack>
		);
	}
	if (isWordCloudError) {
		return <div>Error: {wordCloudError.message}</div>;
	}

	const wordCloud = Object.entries(wordCloudData.words).map(([word, value]) => ({
		text: word,
		value: (value as number) * 1000,
	}));

	return (
		<VStack spacing={4} align="stretch" h="100%">
			<Text fontSize="xl" fontWeight="bold">
				Analytics for "{word}"
			</Text>
			<Box flex="1" minH="400px">
				<WordCloud
					data={wordCloud}
					width={1300}
					height={400}
					font="arial"
					fontSize={(d) => d.value}
					padding={5}
					rotate={(d) => d.rotate || 0}
				/>
			</Box>
			<Box flex="1" maxH="400px">
				{word && (
					<VStack spacing={4} align="stretch" height="100%" overflow="hidden">
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
