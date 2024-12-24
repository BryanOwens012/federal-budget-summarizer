import "@/styles/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { useState } from "react";

const port = 8000;

export const apiURL =
  (process.env.RAILWAY_API_PRIVATE_DOMAIN ||
    process.env.RAILWAY_API_PUBLIC_DOMAIN ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost") + `:${port}`;

export const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";

const App = ({ Component, pageProps }: AppProps) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
};

export default App;
