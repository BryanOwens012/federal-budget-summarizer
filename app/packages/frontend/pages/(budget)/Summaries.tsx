"use client";

import { Alert } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { apiURL, apiVersion } from "../_app";
import { Summary } from "./Summary";

type ListBudgetSummariesResponse = string;
const summaryDelimiter = "summary>>";

const listBudgetSummaries = async (
  usState: string
): Promise<ListBudgetSummariesResponse> => {
  try {
    const response = await fetch(
      `${apiURL}/${apiVersion}/ai/budget-summaries`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          us_state: usState,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching budget summaries:", error);
    throw error;
  }
};

export const Summaries = ({ usState }: { usState: string }) => {
  // Use `isFetching` instead of `isLoading`, because `isLoading` is always false if the placeholder data has been cached
  const { data, error, isFetching } = useQuery<ListBudgetSummariesResponse>({
    queryKey: ["list-budget-summaries", usState],
    queryFn: () => listBudgetSummaries(usState),

    // refetches are unnecessary, because the data is static
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    experimental_prefetchInRender: true,
    placeholderData: (previousData) => previousData,
  });

  const [_, ...summaries] = (data ?? "").split(summaryDelimiter);

  return (
    <div className="flex items-center">
      <div className="flex flex-col gap-y-4 text-base max-w-fit items-center">
        <div className="flex flex-col items-center">
          {error ? (
            <Alert
              status="error"
              title={`Error getting response from ChatGPT: ${error.message}`}
            />
          ) : isFetching ? (
            <Alert status="info" title="Asking ChatGPT..." />
          ) : (
            <></>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          {summaries.map((summary, index) => (
            <Summary
              key={index}
              usState={usState}
              text={summary}
              isFetching={isFetching}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Summaries;
