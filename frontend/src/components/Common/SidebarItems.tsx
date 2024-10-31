import { Box, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { FiHome, FiUsers } from "react-icons/fi";

import { Link } from "@tanstack/react-router";
import type { UserPublic } from "../../client";
import { useQueryClient } from "@tanstack/react-query";

const items = [{ icon: FiHome, title: "Dashboard", path: "/ui" }];

interface SidebarItemsProps {
	onClose?: () => void;
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
	const queryClient = useQueryClient();
	const textColor = useColorModeValue("ui.main", "ui.light");
	const bgActive = useColorModeValue("#E2E8F0", "#4A5568");
	const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);

	const finalItems = currentUser?.is_superuser
		? [...items, { icon: FiUsers, title: "Admin", path: "/admin" }]
		: items;

	const listItems = finalItems.map(({ icon, title, path }) => (
		<Flex
			as={Link}
			to={path}
			w="100%"
			p={2}
			key={title}
			activeProps={{
				style: {
					background: bgActive,
					borderRadius: "12px",
				},
			}}
			color={textColor}
			onClick={onClose}
		>
			<Icon as={icon} alignSelf="center" />
			<Text ml={2}>{title}</Text>
		</Flex>
	));

	return (
		<>
			<Box>{listItems}</Box>
		</>
	);
};

export default SidebarItems;
