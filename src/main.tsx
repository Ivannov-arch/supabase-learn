import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import NewRevisedApp from "./NewRevisedApp";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
const queryClient = new QueryClient();
// { defaultOptions: {queries: {staleTime: 1000 * 2}}}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <NewRevisedApp />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </StrictMode>
);
