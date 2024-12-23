import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import { apiURL, apiVersion } from "../_app";

type CESummaryResponse = string;

const crOriginalDocURL =
  "https://www.congress.gov/bill/118th-congress/house-bill/10545/text";

const fetchCRSummary = async (): Promise<CESummaryResponse> => {
  try {
    const response = await fetch(`${apiURL}/${apiVersion}/ai/cr-summary`, {
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
    console.error("Error fetching CR summary:", error);
    throw error;
  }
};

const CRSummary: React.FC = () => {
  const { data, isLoading, error } = useQuery<CESummaryResponse>({
    queryKey: ["ce-summary"],
    queryFn: fetchCRSummary,
  });

  if (isLoading) {
    return (
      <div className="text-center mt-10">
        Loading summary of the Continuing Resolution...
      </div>
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
      <div className="flex items-center justify-center">
        <div className="flex flex-col gap-y-10">
          <h1 className="text-center text-4xl font-bold text-green-600">
            Summary of the Continuing Resolution (federal budget) signed into
            law on 12/21/2024
          </h1>
          <div className="flex flex-col gap-y-2">
            <h3 className="text-center text-base">As summarized by ChatGPT</h3>
            <Link href={crOriginalDocURL} target="_blank">
              <h3 className="text-center text-base text-blue-500 underline">
                View the CR
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
        </div>
      </div>
    </div>
  );
};

export default CRSummary;
