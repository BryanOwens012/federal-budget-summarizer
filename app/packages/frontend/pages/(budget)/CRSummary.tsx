import { ListUSStatesRow } from "@/db/us_states_sql";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import { apiURL, apiVersion } from "../_app";

type ListBudgetSummariesResponse = string;
type ListUSStatesResponse = { us_states: ListUSStatesRow[] };

const crOriginalDocURL =
  "https://www.congress.gov/bill/118th-congress/house-bill/10545/text";

const listBudgetSummaries = async (): Promise<ListBudgetSummariesResponse> => {
  try {
    const response = await fetch(
      `${apiURL}/${apiVersion}/ai/budget-summaries`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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

const listUSStates = async (): Promise<ListUSStatesResponse> => {
  try {
    const response = await fetch(`${apiURL}/${apiVersion}/us-states`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching US states:", error);
    throw error;
  }
};

const CRSummary: React.FC = () => {
  const { data, isLoading, error } = useQuery<ListBudgetSummariesResponse>({
    queryKey: ["list-budget-summaries"],
    queryFn: listBudgetSummaries,

    // refetches are unnecessary, as the data is static
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
  const { data: usStatesData } = useQuery<ListUSStatesResponse>({
    queryKey: ["list-us-states"],
    queryFn: listUSStates,

    // refetches are unnecessary, as the data is static
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="text-center mt-10">Loading summary of the budget...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error: {(error as Error).message}
      </div>
    );
  }

  const [introParagraph, ...bulletPoints] = (data ?? "").split(">>");

  return (
    <div className="m-10 overflow-auto max-w-full md:max-w-4/5 lg:max-w-3/4 xl:max-w-2/3">
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col gap-y-10">
          <h1 className="text-center text-4xl font-bold text-green-600">
            What's in the new federal budget?
          </h1>
          <div className="flex flex-col gap-y-2">
            <h3 className="text-center text-base">As summarized by ChatGPT</h3>
            <Link href={crOriginalDocURL} target="_blank">
              <h3 className="text-center text-base text-blue-500 underline">
                View the federal budget passed on 12/21/24
              </h3>
            </Link>
          </div>
          <p className="text-base">{introParagraph}</p>
          <p>Major provisions:</p>
          <div className="flex items-center">
            <div className="flex flex-col gap-y-4 text-base max-w-fit">
              {bulletPoints.map((bulletPoint, index) => (
                <div
                  key={index}
                  className="text-left p-4 border-black border-2"
                >
                  <p>{bulletPoint}</p>
                </div>
              ))}
            </div>
          </div>
          <p>US States:</p>
          <div className="flex items-center">
            <div className="flex flex-col gap-y-4 text-base max-w-fit">
              {usStatesData?.us_states
                .filter((usState) => usState.name)
                .map((usState) => (
                  <div
                    key={usState.id}
                    className="text-left p-4 border-black border-2"
                  >
                    <p>{usState.name}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRSummary;