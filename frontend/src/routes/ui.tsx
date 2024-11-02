import * as d3 from "d3";

import {
	Box,
	Flex,
	HStack,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Select,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text,
	VStack,
} from "@chakra-ui/react";
import { Feature, Geometry } from "geojson";
import Word3DCloud, { Word3DCloudProps } from "../components/WordCloud";
import { useEffect, useRef } from "react";

import React from "react";
import Sidebar from "../components/Common/Sidebar";
import { createFileRoute } from "@tanstack/react-router";
import { feature } from "topojson-client";

type Sentiment = "positive" | "neutral" | "negative";
interface StateData {
	[key: string]: {
		stress: Sentiment;
		sport: Sentiment;
		wordsByTopic: { [key in "stress" | "sport"]: Word3DCloudProps };
	};
}

function sentimentToColor(sentiment: Sentiment | null) {
	switch (sentiment) {
		case "positive":
			return "green";
		case "negative":
			return "red";
		case "neutral":
			return "gray";
		case null:
			return "gray";
	}
}

export const Route = createFileRoute("/ui")({
	component: UI,
});

function UI() {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const legendRef = useRef<HTMLDivElement | null>(null);
	const width = 960;
	const height = 600;
	const sentimentLevel = {
		Arizona: {
			stress: "positive",
			sport: "positive",
			wordsByTopic: {
				stress: [
					{ text: "Worry", value: 100 },
					{ text: "Exam", value: 200 },
				],
				sport: [
					{ text: "Win", value: 100 },
					{ text: "Fight", value: 200 },
				],
			},
		},
		Georgia: {
			stress: "negative",
			sport: "positive",
			wordsByTopic: {
				stress: [
					{ text: "Worry", value: 100 },
					{ text: "Exam", value: 200 },
				],
				sport: [
					{ text: "Win", value: 100 },
					{ text: "Fight", value: 200 },
				],
			},
		},
		"New York": {
			stress: "positive",
			sport: "negative",
			wordsByTopic: {
				stress: [
					{ text: "Worry", value: 100 },
					{ text: "Exam", value: 200 },
				],
				sport: [
					{ text: "Win", value: 100 },
					{ text: "Fight", value: 200 },
				],
			},
		},
	};
	const [chartType, setChartType] = React.useState<"filled" | "bar" | "bubble">("filled");
	const [topic, setTopic] = React.useState<"stress" | "sport">("stress");
	const [selectedState, setSelectedState] = React.useState<string | null>(null);
	const [isZoomed, setIsZoomed] = React.useState(false);

	useEffect(() => {
		if (!svgRef.current || !legendRef.current) return;

		const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height]);
		const legend = d3.select(legendRef.current);

		// Clear previous content
		svg.selectAll("*").remove();
		legend.selectAll("*").remove();

		// Create projection
		const projection = d3
			.geoAlbersUsa()
			.scale(1100)
			.translate([width / 2, height / 2]);

		const path = d3.geoPath().projection(projection);

		// Replace the existing legend code (around line 94-128) with:
		const legendData = [
			{ label: "Positive", color: "green" },
			{ label: "Neutral", color: "gray" },
			{ label: "Negative", color: "red" },
			{ label: "Unknown", color: "#f5f5f5" },
		];

		const size = 20;
		const legendSpacing = 5;

		const legendGroup = legend
			.append("svg")
			.attr("width", 120)
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
			.attr("x", size + legendSpacing)
			.attr("y", (d, i) => i * (size + legendSpacing) + size / 2)
			.text((d) => d.label)
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
					const sentiment = sentimentLevel[stateId]?.[topic] ?? null;
					return chartType === "filled" && sentiment != null
						? sentimentToColor(sentiment)
						: "#f5f5f5";
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
				});

			// Add bar chart
			// if (chartType === "bar") {
			// 	svg
			// 		.selectAll("rect")
			// 		.data((states as any).features)
			// 		.enter()
			// 		.append("rect")
			// 		.attr("x", function (d: any) {
			// 			const feature = d as unknown as Feature<Geometry>;
			// 			const stateId = (feature.properties as any).name;
			// 			return path.centroid(d)[0] - 20;
			// 		})
			// 		.attr("y", function (d: any) {
			// 			const feature = d as unknown as Feature<Geometry>;
			// 			const stateId = (feature.properties as any).name;
			// 			const stateStressLevel = sentimentLevel[stateId] || 0;
			// 			return path.centroid(d)[1] - stateStressLevel * 10;
			// 		})
			// 		.attr("width", 40)
			// 		.attr("height", function (d) {
			// 			const feature = d as unknown as Feature<Geometry>;
			// 			const stateId = (feature.properties as any).name;
			// 			const stateStressLevel = sentimentLevel[stateId] || 0;
			// 			return stateStressLevel * 10;
			// 		})
			// 		.style("fill", function (d) {
			// 			const feature = d as unknown as Feature<Geometry>;
			// 			const stateId = (feature.properties as any).name;
			// 			const stateStressLevel = sentimentLevel[stateId] || 0;
			// 			return colorScale(stateStressLevel);
			// 		});
			// }

			// Add bubble chart
			// if (chartType === "bubble") {
			// 	svg
			// 		.selectAll("circle")
			// 		.data((states as any).features)
			// 		.enter()
			// 		.append("circle")
			// 		.attr("cx", function (d: any) {
			// 			return path.centroid(d)[0];
			// 		})
			// 		.attr("cy", function (d: any) {
			// 			return path.centroid(d)[1];
			// 		})
			// 		.attr("r", function (d) {
			// 			const feature = d as unknown as Feature<Geometry>;
			// 			const stateId = (feature.properties as any).name;
			// 			const stateStressLevel = sentimentLevel[stateId] || 0;
			// 			return stateStressLevel * 5; // Adjust the multiplier as needed
			// 		})
			// 		.style("fill", function (d) {
			// 			const feature = d as unknown as Feature<Geometry>;
			// 			const stateId = (feature.properties as any).name;
			// 			const stateStressLevel = sentimentLevel[stateId] || 0;
			// 			return colorScale(stateStressLevel);
			// 		});
			// }
		});
	}, [chartType, topic, isZoomed]);

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
					<Select
						size="sm"
						width="fit-content"
						value={topic}
						onChange={(e) => setTopic(e.target.value as "stress" | "sport")}
					>
						<option value="stress">Stress</option>
						<option value="sport">Sport</option>
					</Select>
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
				<Modal
					isOpen={!!selectedState}
					onClose={() => setSelectedState(null)}
					size={{ base: "full", md: "75%" }}
				>
					<ModalOverlay />
					<ModalContent w="75vw" h="90vh" maxW="75vw">
						<ModalHeader>{selectedState}</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							<Tabs defaultIndex={0} variant="enclosed">
								<TabList>
									<Tab>Word Cloud</Tab>
									<Tab>Analytics Report</Tab>
								</TabList>
								<TabPanels>
									<TabPanel>
										<Word3DCloud
											words={sentimentLevel[selectedState]?.["wordsByTopic"][topic]}
										></Word3DCloud>
									</TabPanel>
									<TabPanel>
										<Text>Analytics Report (WIP)</Text>
									</TabPanel>
								</TabPanels>
							</Tabs>
						</ModalBody>
					</ModalContent>
				</Modal>
			</Box>
		</Flex>
	);
}
