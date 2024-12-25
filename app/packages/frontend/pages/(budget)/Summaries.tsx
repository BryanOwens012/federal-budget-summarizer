"use client";

import { Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { apiURL, apiVersion } from "../_app";
import { Summary } from "./Summary";

type ListBudgetSummariesResponse = string;

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
  const { data, isLoading, error } = useQuery<ListBudgetSummariesResponse>({
    queryKey: ["list-budget-summaries", usState],
    queryFn: () => listBudgetSummaries(usState),

    // refetches are unnecessary, because the data is static
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center text-center text-red-500">
        Error: {(error as Error).message}
      </div>
    );
  }

  const [_, ...summaries] = (data ?? "").split(">>");

  return (
    <div className="flex items-center overflow-y-hidden">
      <div className="flex flex-col gap-y-4 text-base max-w-fit">
        {summaries.map((summary, index) => (
          <Summary key={index} text={summary} />
        ))}
      </div>
    </div>
  );
};

export default Summaries;
