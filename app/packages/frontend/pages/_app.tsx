import "@/styles/global.css";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { useState } from "react";

export const apiURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";

const App = ({ Component, pageProps }: AppProps) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        <Component {...pageProps} />
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default App;
