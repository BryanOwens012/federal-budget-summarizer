"use client";

import { Alert } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { useEffect, useRef } from "react";
import { apiURL, apiVersion } from "../_app";

type GetBudgetElaborationResponse = string;

const getBudgetElaboration = async (
  summary: string,
  { signal }: { signal?: AbortSignal }
): Promise<GetBudgetElaborationResponse> => {
  try {
    const response = await fetch(
      `${apiURL}/${apiVersion}/ai/budget-elaboration`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary,
        }),
        signal,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching budget elaboration:", error);
    throw error;
  }
};

export const Elaboration = ({
  usState,
  summary,
  shouldShow,
  isSummaryFetching,
}: {
  usState: string;
  summary: string;
  shouldShow: boolean;
  isSummaryFetching: boolean;
}) => {
  const abortController = useRef(new AbortController());
  const previousUsState = useRef(usState);

  // Abort ongoing queries when usState changes
  useEffect(() => {
    if (usState !== previousUsState.current) {
      abortController.current.abort("Aborted query because US state changed");
      previousUsState.current = usState;
    }
  }, [usState]);

  // Create new controller when summary changes
  useEffect(() => {
    if (summary) {
      abortController.current = new AbortController();
    }
  }, [summary]);

  // Use `isFetching` instead of `isLoading`, because `isLoading` is always false if the placeholder data has been cached
  const { data, error, isFetching } = useQuery<GetBudgetElaborationResponse>({
    queryKey: ["get-budget-elaboration", summary],
    queryFn: () =>
      getBudgetElaboration(summary, { signal: abortController.current.signal }),

    // refetches are unnecessary, because the data is static
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    experimental_prefetchInRender: true,
    placeholderData: (previousData) => previousData,
  });

  if (!shouldShow) {
    return <></>;
  }

  const shouldGrayOut = isSummaryFetching || isFetching;

  return (
    <div
      className={classNames("flex flex-col text-left", {
        "text-gray-300": shouldGrayOut,
        "text-black": !shouldGrayOut,
      })}
    >
      <div className="flex flex-col items-center mb-3">
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

      <div className="whitespace-pre-line">{data}</div>
    </div>
  );
};

export default Elaboration;
