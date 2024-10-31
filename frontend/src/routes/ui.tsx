import * as d3 from "d3";

import {
	Box,
	Flex,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Select,
	Text,
	VStack,
} from "@chakra-ui/react";
import { Feature, Geometry } from "geojson";
import { useEffect, useRef } from "react";

import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { feature } from "topojson-client";

interface StateData {
	[key: string]: number;
}

export const Route = createFileRoute("/ui")({
	component: UI,
});

function UI() {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const legendRef = useRef<HTMLDivElement | null>(null);
	const width = 960;
	const height = 600;
	const stressLevel: StateData = {
		Arizona: 4.5,
		Georgia: 3.9,
		"New York": 2.8,
	};

	const [chartType, setChartType] = React.useState<"filled" | "bar" | "bubble">("filled");
	const [selectedState, setSelectedState] = React.useState<string | null>(null);

	useEffect(() => {
		if (!svgRef.current || !legendRef.current) return;

		const svg = d3.select(svgRef.current);
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

		// Color scale
		const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 10]);

		// Legend
		const legendScale = d3
			.scaleLinear()
			.domain([0, 10])
			.range([0, 180])
			.interpolate(d3.interpolateRound);

		legend
			.append("svg")
			.attr("width", 200)
			.attr("height", 30)
			.append("defs")
			.append("linearGradient")
			.attr("id", "legend-gradient")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "0%");

		legend
			.append("rect")
			.attr("x", 0)
			.attr("y", 10)
			.attr("width", 200)
			.attr("height", 20)
			.style("fill", "url(#legend-gradient)");

		const legendAxis = d3
			.axisRight(legendScale)
			.tickValues(legendScale.ticks(2))
			.tickSize(-20)
			.tickPadding(8);

		legend.append("g").attr("transform", "translate(200,0)").call(legendAxis);

		// Load US map data
		d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then((us: any) => {
			const states = feature(us, us.objects.states);

			// Draw states
			svg
				.selectAll("path")
				.data((states as any).features)
				.enter()
				.append("path")
				.attr("d", path as any)
				.attr("class", "state")
				.style("fill", function (d) {
					const feature = d as unknown as Feature<Geometry>;
					const stateId = (feature.properties as any).name;
					const stateStressLevel = stressLevel[stateId] || 0;
					return chartType === "filled"
						? stateStressLevel > 0
							? colorScale(stateStressLevel)
							: "#f5f5f5"
						: "#fff";
				})
				.style("stroke", "#000")
				.style("stroke-width", "1")
				.on("click", function (event, d) {
					setSelectedState((d as any).properties.name);
				})
				.on("mouseout", function (event, d) {
					const feature = d as unknown as Feature<Geometry>;
					const stateId = (feature.properties as any).name;
					const stateStressLevel = stressLevel[stateId] || 0;
					d3.select(this).style(
						"fill",
						chartType === "filled"
							? stateStressLevel > 0
								? colorScale(stateStressLevel)
								: "#f5f5f5"
							: "#fff"
					);
				});

			// Add bar chart
			if (chartType === "bar") {
				svg
					.selectAll("rect")
					.data((states as any).features)
					.enter()
					.append("rect")
					.attr("x", function (d) {
						const feature = d as unknown as Feature<Geometry>;
						const stateId = (feature.properties as any).name;
						const stateStressLevel = stressLevel[stateId] || 0;
						return path.centroid(d)[0] - 20;
					})
					.attr("y", function (d) {
						const feature = d as unknown as Feature<Geometry>
						const stateId = (feature.properties as any).name;
						const stateStressLevel = stressLevel[stateId] || 0;
						return path.centroid(d)[1] - stateStressLevel * 10;
					})
					.attr("width", 40)
					.attr("height", function (d) {
						const feature = d as unknown as Feature<Geometry>;
						const stateId = (feature.properties as any).name;
						const stateStressLevel = stressLevel[stateId] || 0;
						return stateStressLevel * 10;
					})
					.style("fill", function (d) {
						const feature = d as unknown as Feature<Geometry>;
						const stateId = (feature.properties as any).name;
						const stateStressLevel = stressLevel[stateId] || 0;
						return colorScale(stateStressLevel);
					});
			}

			// Add bubble chart
			if (chartType === "bubble") {
				svg
					.selectAll("circle")
					.data((states as any).features)
					.enter()
					.append("circle")
					.attr("cx", function (d) {
						return path.centroid(d)[0];
					})
					.attr("cy", function (d) {
						return path.centroid(d)[1];
					})
					.attr("r", function (d) {
						const feature = d as unknown as Feature<Geometry>;
						const stateId = (feature.properties as any).name;
						const stateStressLevel = stressLevel[stateId] || 0;
						return stateStressLevel * 5; // Adjust the multiplier as needed
					})
					.style("fill", function (d) {
						const feature = d as unknown as Feature<Geometry>;
						const stateId = (feature.properties as any).name;
						const stateStressLevel = stressLevel[stateId] || 0;
						return colorScale(stateStressLevel);
					});
			}
		});
	}, [chartType]);

	return (
		<Flex align="center" justify="center" w="100vw" h="100vh">
			<Box
				position="relative"
				width={width}
				height={height}
				p={4}
				bg="white"
				borderRadius="md"
				boxShadow="md"
			>
				<Select
					position="absolute"
					top="1rem"
					left="1rem"
					size="sm"
					width="fit-content"
					value={chartType}
					onChange={(e) => setChartType(e.target.value as "filled" | "bar" | "bubble")}
				>
					<option value="filled">Filled Color</option>
					<option value="bar">Bar Chart</option>
					<option value="bubble">Bubble Chart</option>
				</Select>
				<svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
				<VStack
					position="absolute"
					top="1rem"
					right="1rem"
					align="end"
					spacing={4}
					bg="white"
					p={2}
					borderRadius="md"
				>
					<Box
						ref={legendRef}
						height="100px"
						width="20px"
						bgGradient="linear(to-b, #f5f5f5, red)"
					/>
					<Modal isOpen={!!selectedState} onClose={() => setSelectedState(null)}>
						<ModalOverlay />
						<ModalContent>
							<ModalHeader>{selectedState}</ModalHeader>
							<ModalCloseButton />
							<ModalBody>
								<Text>{`Stress level: ${stressLevel[selectedState!!] || 0}`}</Text>
							</ModalBody>
						</ModalContent>
					</Modal>
				</VStack>
			</Box>
		</Flex>
	);
}
