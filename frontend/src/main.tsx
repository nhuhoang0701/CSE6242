import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { ChakraProvider } from "@chakra-ui/react";
import { OpenAPI } from "./client";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { routeTree } from "./routeTree.gen";
import theme from "./theme";

OpenAPI.BASE = import.meta.env.VITE_API_URL;

const queryClient = new QueryClient();

const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ChakraProvider theme={theme}>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</ChakraProvider>
	</StrictMode>
);
