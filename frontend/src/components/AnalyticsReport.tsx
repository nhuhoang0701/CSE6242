import React from "react";
import { 
    Box, 
    Text, 
    VStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer
} from "@chakra-ui/react";

import WordCloud from "react-d3-cloud";

interface Word {
    text: string;
    value: number;
    color?: string;
    rotate?: number;
}


interface AnalyticsReportProps {
    word: string;  // Selected word for analytics
    wordCloudData: Word[];
    onWordSelect: (word: string) => void;
    posts: string[];  // Array of Reddit posts
}


function AnalyticsReport({ word, wordCloudData, onWordSelect, posts = []}: AnalyticsReportProps) {
    // Filter posts by the selected word
    const filteredPostTexts = posts
        .filter(text => text) // Remove null/undefined posts
        .filter(text => text.toLowerCase().includes(word.toLowerCase()));
    
    
    const handleWordClick = (event: any, d: any) => {  // Updated handler signature
        console.log("Word clicked:", d);  // Debug log
        if (onWordSelect) {
            onWordSelect(d.text);
        }
    };

    console.log("Filtered posts:", {
        total: posts.length,
        filtered: filteredPostTexts.length,
        posts: filteredPostTexts
    });

    
    return (
        <VStack spacing={4} align="stretch" h="100%">
            <Text fontSize="xl" fontWeight="bold">Analytics for "{word}"</Text>
            <Box flex="1" minH="400px">
                <Box 
                    borderRadius="lg" 
                    p={4} 
                    border={"1px solid"} 
                    borderColor={"gray.200"}
                    position="relative"
                    h="400px"
                    w="100%"
                    display="flex"
                    justifyContent="flex-start"
                >
                    <WordCloud
                        data={wordCloudData}
                        width={1300}
                        height={400}
                        font="arial"
                        fontSize={(d) => d.value}
                        padding={5}
                        rotate={(d) => d.rotate || 0}
                        style={{ marginLeft: "-200px" }}
                    />
                </Box>
            </Box>
            <Box flex="1" overflowY="auto" maxH="400px">
                {word && (
                    <VStack spacing={4} align="stretch">
                        <Box>
                            <Text fontSize="xl" fontWeight="bold">Original Posts containing "{word}"</Text>
                            <Text mb={4}>Number of Posts: {filteredPostTexts.length}</Text>
                        </Box>
                        
                        <TableContainer>
                            <Table variant="simple" size="sm">
                                <Thead position="sticky" top={0} bg="white">
                                    <Tr>
                                        <Th width="100px">No.</Th>
                                        <Th>Post Content</Th>
                                        <Th width="150px">Word Count</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredPostTexts.map((text, index) => (
                                        <Tr key={index} _hover={{ bg: "gray.50" }}>
                                            <Td>{index + 1}</Td>
                                            <Td>
                                                {text.length > 200 
                                                    ? `${text.substring(0, 200)}...` 
                                                    : text
                                                }
                                            </Td>
                                            <Td isNumeric>{text.split(/\s+/).length}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </VStack>
                )}
            </Box>
        </VStack>
    );
}

export default AnalyticsReport;
