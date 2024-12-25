import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiURL, apiVersion } from "../_app";
import { Summary } from "./Summary";
import USStateSelect from "./USStateSelect";

type ListBudgetSummariesResponse = string;

const budgetURL =
  "https://www.congress.gov/bill/118th-congress/house-bill/10545/text";

const introParagraph = `The latest federal budget,
signed on December 21, 2024, extends government funding until March 14, 2025.
It includes provisions that could affect you, including:`;

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

export const Page = () => {
  const { data, isLoading, error } = useQuery<ListBudgetSummariesResponse>({
    queryKey: ["list-budget-summaries"],
    queryFn: listBudgetSummaries,

    // refetches are unnecessary, because the data is static
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

  const summaries = (data ?? "").split(">>");

  return (
    <div className="m-10 overflow-auto max-w-full md:max-w-4/5 lg:max-w-3/4 xl:max-w-2/3">
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col gap-y-10">
          <h1 className="text-center text-4xl font-bold text-green-600">
            {"What does the "}
            <Link href={budgetURL} target="_blank" className="underline">
              new federal budget
            </Link>
            {" mean for you?"}
          </h1>
          <p className="text-base">{introParagraph}</p>
          <div className="flex items-center">
            <div className="flex flex-col gap-y-4 text-base max-w-fit">
              {summaries.map((summary, index) => (
                <Summary key={index} text={summary} />
              ))}
            </div>
          </div>
          <USStateSelect />
        </div>
      </div>
    </div>
  );
};

export default Page;
