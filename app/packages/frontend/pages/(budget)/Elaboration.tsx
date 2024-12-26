import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { apiURL, apiVersion } from "../_app";

type GetBudgetElaborationResponse = string;

const getBudgetElaboration = async (
  summary: string
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
  summary,
  shouldShow,
}: {
  summary: string;
  shouldShow: boolean;
}) => {
  // Use `isFetching` instead of `isLoading`, because `isLoading` is always false if the placeholder data has been cached
  const { data, error, isFetching } = useQuery<GetBudgetElaborationResponse>({
    queryKey: ["get-budget-elaboration", summary],
    queryFn: () => getBudgetElaboration(summary),

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

  return (
    <div
      className={classNames("flex flex-col gap-y-8 text-left", {
        "text-gray-300": isFetching,
        "text-black": !isFetching,
      })}
    >
      {error ? (
        <p>Error getting elaboration from ChatGPT: {error.message}</p>
      ) : isFetching ? (
        <p>Getting elaboration from ChatGPT...</p>
      ) : data ? (
        <p>More about this:</p>
      ) : (
        <></>
      )}

      <p className="whitespace-pre-line">{data}</p>
    </div>
  );
};

export default Elaboration;
