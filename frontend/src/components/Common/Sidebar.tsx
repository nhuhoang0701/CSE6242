import { Box, Flex, Image, useColorModeValue } from "@chakra-ui/react";

import Logo from "/assets/images/reddit-university.png";
import SidebarItems from "./SidebarItems";

const Sidebar = () => {
	const bgColor = useColorModeValue("ui.light", "ui.dark");
	const secBgColor = useColorModeValue("ui.secondary", "ui.darkSlate");

	return (
		<Box
			bg={bgColor}
			p={3}
			h="100vh"
			position="sticky"
			top="0"
			display={{ base: "none", md: "flex" }}
		>
			<Flex flexDir="column" justify="space-between" bg={secBgColor} p={4} borderRadius={12}>
				<Box p={0} m={0}>
					<Image src={Logo} alt="Logo" w="210px" maxW="2xs" />
					<SidebarItems />
				</Box>
			</Flex>
		</Box>
	);
};

export default Sidebar;
