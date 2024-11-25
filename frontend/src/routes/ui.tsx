import * as d3 from "d3";

import {
	Box,
	Button,
	Flex,
	HStack,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Select,
	VStack,
} from "@chakra-ui/react";
import { Feature, Geometry } from "geojson";
import { useEffect, useRef } from "react";

import AnalyticsReport from "../components/AnalyticsReport";
import React from "react";
import Sidebar from "../components/Common/Sidebar";
import { createFileRoute } from "@tanstack/react-router";
import { feature } from "topojson-client";

type Sentiment = "positive" | "neutral" | "negative";

interface RedditPost {
	State: string;
	year: number;
	text: string;
	positive: number;
	neutral: number;
	negative: number;
}

export const Route = createFileRoute("/ui")({
	component: UI,
});

function UI() {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const legendRef = useRef<HTMLDivElement | null>(null);
	const tooltipRef = useRef<HTMLDivElement | null>(null); // Tooltip reference for displaying sentiment values
	const width = 960;
	const height = 600;
	const [chartType, setChartType] = React.useState<"filled" | "bar" | "bubble">("filled");
	const [year, setYear] = React.useState("2019"); // State for selected year
	const [topic, setTopic] = React.useState<"stress" | "sport">("stress");
	// const [wordCloudData, setWordCloudData] = React.useState<{ text: string; value: number }[]>([]);
	const [isZoomed, setIsZoomed] = React.useState(false);
	const [selectedState, setSelectedState] = React.useState<string | null>(null);
	const [searchTerm, setSearchTerm] = React.useState<string>(""); // State for search term
	const [posts, setPosts] = React.useState<RedditPost[]>([]); // State for storing CSV data
	const [stateSentiments, setStateSentiments] = React.useState<{ [state: string]: Sentiment }>({});
	const [sentimentMap, setSentimentMap] = React.useState<{
		[state: string]: { positive: number; neutral: number; negative: number };
	}>({});
	const [selectedWord, setSelectedWord] = React.useState<string>(""); // State for selected word
	// const [hits, setHits] = React.useState(0);

	const loadDataForYear = (selectedYear: string) => {
		d3.csv(`dataset/data_${selectedYear}.csv`)
			.then((data) => {
				console.log(`Raw CSV data for ${selectedYear}:`, data);
				const posts = data.map((row: any) => ({
					State: row.State ? row.State.trim() : "",
					text: row.preprocessed_text ? row.preprocessed_text.trim() : "",
					year: row.Year ? parseInt(row.Year) : 0,
					positive: row.emo_pred_pos ? parseFloat(row.emo_pred_pos) : 0,
					neutral: row.emo_pred_neu ? parseFloat(row.emo_pred_neu) : 0,
					negative: row.emo_pred_neg ? parseFloat(row.emo_pred_neg) : 0,
				}));
				setPosts(posts);
			})
			.catch((error) => {
				console.error("Error loading CSV data:", error);
			});
	};

	useEffect(() => {
		loadDataForYear(year);
	}, [year]);

	const handleSearchSubmit = () => {
		if (!searchTerm) return;

		const newSentimentMap: {
			[state: string]: { positive: number; neutral: number; negative: number };
		} = {};
		const wordCounts: { [word: string]: number } = {};

		const filteredPosts = posts.filter(
			(post) => post.text && post.text.toLowerCase().includes(searchTerm.toLowerCase())
		);

		filteredPosts.forEach((post) => {
			// Ensure State and text exist
			if (!post.State || !post.text) return;

			// Initialize sentiment map for the state
			if (!newSentimentMap[post.State]) {
				newSentimentMap[post.State] = { positive: 0, neutral: 0, negative: 0 };
			}

			newSentimentMap[post.State].positive += post.positive || 0;
			newSentimentMap[post.State].neutral += post.neutral || 0;
			newSentimentMap[post.State].negative += post.negative || 0;

			// Count word occurrences
			const words = post.text.split(/\s+/);
			words.forEach((word) => {
				const normalizedWord = word.toLowerCase().replace(/[^a-z0-9]/gi, "");
				if (normalizedWord) {
					wordCounts[normalizedWord] = (wordCounts[normalizedWord] || 0) + 1;
				}
			});
		});

		Object.keys(newSentimentMap).forEach((state) => {
			const sentiment = newSentimentMap[state];
			const total = sentiment.positive + sentiment.neutral + sentiment.negative;

			if (total > 0) {
				sentiment.positive = (sentiment.positive / total) * 100;
				sentiment.neutral = (sentiment.neutral / total) * 100;
				sentiment.negative = (sentiment.negative / total) * 100;
			}
		});

		setSentimentMap(newSentimentMap);

		// Log word counts and sentiment map only for filtered results

		// Convert word counts into the format needed for Word3DCloud
		// const formattedWords = Object.keys(wordCounts).map((word) => ({
		// 	text: word,
		// 	value: wordCounts[word],
		// }));

		// setWordCloudData(formattedWords);

		// Determine the maximum sentiment for each state
		const newStateSentiments: { [state: string]: Sentiment } = {};
		Object.keys(newSentimentMap).forEach((state) => {
			const { positive, neutral, negative } = newSentimentMap[state];
			let maxSentiment: Sentiment = "neutral";
			if (positive >= neutral && positive >= negative) {
				maxSentiment = "positive";
			} else if (negative >= positive && negative >= neutral) {
				maxSentiment = "negative";
			}
			newStateSentiments[state] = maxSentiment;
		});

		// Update state sentiments
		setStateSentiments(newStateSentiments);
	};

	const sentimentToColor = (
		sentimentData: { positive: number; neutral: number; negative: number } | null
	) => {
		if (!sentimentData) {
			return "#9aa2a0"; // Default gray color for no data
		}

		const { positive, neutral, negative } = sentimentData;

		// Define thresholds and corresponding colors
		if (negative > 60) {
			return "red"; // Very Negative
		} else if (negative > 40 && negative <= 60) {
			return "#E96100"; // Negative
		} else if (neutral > 50 || (positive > 40 && negative > 40)) {
			return "yellow"; // Neutral
		} else if (positive > 40 && positive <= 60) {
			return "#69B34C"; // Positive
		} else if (positive > 60) {
			return "#009E20"; // Very Positive
		} else {
			return "yellow"; // balanced
		}
	};

	useEffect(() => {
		if (!svgRef.current || !legendRef.current) return;

		const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height]);
		const legend = d3.select(legendRef.current).style("width", "60px");
		const tooltip = d3.select(tooltipRef.current);

		// Clear previous content
		svg.selectAll("*").remove();
		legend.selectAll("*").remove();

		// Create projection
		const projection = d3
			.geoAlbersUsa()
			.scale(1100)
			.translate([width / 2, height / 2]);

		const path = d3.geoPath().projection(projection);

		const legendData = [
			{ label: "Highly Negative", color: "red" },
			{ label: "Negative", color: "#E96100" },
			{ label: "Neutral / Balanced", color: "yellow" },
			{ label: "Positive", color: "#69B34C" },
			{ label: "Highly Positive", color: "#009E20" },
			{ label: "Unknown", color: "#9aa2a0" },
		];

		const size = 20;
		const legendSpacing = 5;

		const legendGroup = legend
			.append("svg")
			.attr("width", 150)
			.attr("height", (size + legendSpacing) * legendData.length);

		// Add squares
		legendGroup
			.selectAll("rect")
			.data(legendData)
			.enter()
			.append("rect")
			.attr("x", 0)
			.attr("y", (_, i) => i * (size + legendSpacing))
			.attr("width", size)
			.attr("height", size)
			.style("fill", (d) => d.color);

		// Add labels
		legendGroup
			.selectAll("text")
			.data(legendData)
			.enter()
			.append("text")
			.attr("x", size + 5)
			.attr("y", (d, i) => i * (size + legendSpacing) + size / 2)
			.text((d) => d.label)
			.style("font-size", "13px")
			.attr("alignment-baseline", "middle");

		// Load US map data
		d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then((us: any) => {
			const states = feature(us, us.objects.states);

			const zoom = d3
				.zoom()
				.scaleExtent([1, 8])
				.on("zoom", (event) => {
					const { transform } = event;
					svg.attr("transform", transform);
					svg.attr("stroke-width", 1 / transform.k);
				});

			// Draw states
			svg
				.selectAll("path")
				.data((states as any).features)
				.enter()
				.append("path")
				.attr("d", path as any)
				.attr("class", "state")
				.attr("cursor", "pointer")
				.style("fill", function (d) {
					const feature = d as unknown as Feature<Geometry>;
					const stateId = (feature.properties as any).name;
					const sentiment = sentimentMap[stateId] ?? null;
					return chartType === "filled" ? sentimentToColor(sentiment) : "#f5f5f5";
				})
				.style("stroke", "#000")
				.style("stroke-width", "1")
				.on("click", function (event, d) {
					event.preventDefault(); // Prevent default right-click menu
					event.stopPropagation();
					const feature = d as unknown as Feature<Geometry>;
					const [[x0, y0], [x1, y1]] = path.bounds(feature);

					const clientWidth = svgRef.current?.clientWidth || 0;
					const clientHeight = svgRef.current?.clientHeight || 0;

					svg
						.transition()
						.duration(750)
						.call(
							zoom.transform,
							d3.zoomIdentity
								.scale(3)
								.translate(clientWidth / 2, clientHeight / 2)
								.translate(
									(-(x0 + x1) / 2) * (clientWidth / width),
									(-(y0 + y1) / 2) * (clientHeight / height)
								),
							d3.pointer(event, svg.node())
						);
					setIsZoomed(true);
				})
				.on("contextmenu", function (event) {
					event.preventDefault();
					if (isZoomed) {
						svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
						setIsZoomed(false);
					}
				})
				.on("mousedown", function (event, d) {
					if (event.button === 1) {
						setSelectedState((d as any).properties.name);
					}
				})
				.on("mouseover", function (event, d) {
					const stateId = d.properties.name;
					const sentimentData = sentimentMap[stateId];
					const svgBounds = svgRef.current.getBoundingClientRect();

					// Show tooltip with sentiment values
					if (sentimentData) {
						tooltip
							.style("opacity", 1)
							.html(
								`<strong>${stateId}</strong><br>Positive: ${sentimentData.positive.toFixed(1)} %<br>Neutral: ${sentimentData.neutral.toFixed(1)} %<br>Negative: ${sentimentData.negative.toFixed(1)} %`
							)
							.style("left", `${event.clientX - svgBounds.left + 50}px`)
							.style("top", `${event.clientY - svgBounds.top + 10}px`);
					}
				})
				.on("mousemove", function (event) {
					const svgBounds = svgRef.current.getBoundingClientRect();
					// Update tooltip position as the mouse moves
					tooltip
						.style("left", `${event.clientX - svgBounds.left + 50}px`)
						.style("top", `${event.clientY - svgBounds.top + 10}px`);
				})
				.on("mouseout", function () {
					// Hide tooltip when mouse leaves the state
					tooltip.style("opacity", 0);
				});
		});
	}, [chartType, topic, isZoomed, stateSentiments, sentimentMap]);

	return (
		<Flex direction={{ base: "column", md: "row" }} w="100vw" h="100vh" overflow="hidden">
			<Box
				w={{ base: "100%", md: "250px" }}
				h={{ base: "auto", md: "100vh" }}
				bg="white"
				borderRadius="md"
				overflow="hidden"
			>
				<Sidebar />
			</Box>
			<Box
				flex="1"
				h={{ base: "calc(100vh - 250px)", md: "100vh" }}
				p={4}
				bg="white"
				borderRadius="md"
				position="relative"
			>
				<HStack position="absolute" top="1rem" left="1rem" spacing={2} width="fit-content">
					<Input
						placeholder="Search Your Topic!"
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							// handleDebouncedSearch(); // Runs after the user stops typing for 300ms
						}}
						size="sm"
						width="150px"
					/>

					{/* Year Selector */}
					<Select
						size="sm"
						width="fit-content"
						value={year}
						onChange={(e) => setYear(e.target.value)}
					>
						<option value="2019">2019</option>
						<option value="2020">2020</option>
						<option value="2021">2021</option>
						<option value="2022">2022</option>
					</Select>

					<Button onClick={handleSearchSubmit} size="sm" colorScheme="blue">
						Submit
					</Button>

					<Select
						size="sm"
						width="fit-content"
						value={chartType}
						onChange={(e) => setChartType(e.target.value as "filled" | "bar" | "bubble")}
					>
						<option value="filled">Filled Color</option>
						<option value="bar">Bar Chart</option>
						<option value="bubble">Bubble Chart</option>
					</Select>
					{/* Add the search box */}
				</HStack>

				<svg ref={svgRef} style={{ width: "100%", height: "100%", overflow: "hidden" }}></svg>
				<VStack
					position="absolute"
					top="1rem"
					right="5rem"
					align="end"
					spacing={4}
					bg="white"
					p={2}
					borderRadius="md"
				>
					<Box ref={legendRef} height="100px" width="20px" />
				</VStack>

				{/* Tooltip */}
				<div
					ref={tooltipRef}
					style={{
						position: "absolute",
						backgroundColor: "white",
						padding: "8px",
						border: "1px solid #ccc",
						borderRadius: "4px",
						boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
						pointerEvents: "none",
						opacity: 0,
						transition: "opacity 0.2s ease-in-out",
						fontSize: "12px",
						color: "#333",
					}}
				></div>

				<Modal
					isOpen={!!selectedState}
					onClose={() => setSelectedState(null)}
					size={{ base: "full", md: "75%" }}
				>
					<ModalOverlay />
					<ModalContent w="75vw" h="90vh" maxW="75vw">
						<ModalHeader fontSize={"2xl"} fontWeight={"bold"}>
							Analytics report for state "{selectedState}" on keyword "{searchTerm}" in {year}
						</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							<AnalyticsReport
								word={searchTerm}
								state={selectedState!}
								year={parseInt(year)!}
								onWordSelect={(newWord) => {
									console.log("Word selected:", newWord); // Debug log
									setSelectedWord(newWord);
								}}
								posts={posts
									.filter((post) => post.State === selectedState && post.year === parseInt(year))
									.map((post) => post.text)}
							/>
						</ModalBody>
					</ModalContent>
				</Modal>
			</Box>
		</Flex>
	);
}
