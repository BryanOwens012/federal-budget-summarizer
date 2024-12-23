import { useQuery } from "@tanstack/react-query";
import React from "react";
import { apiURL, apiVersion } from "../_app";

type CESummaryResponse = string;

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

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      {data}
    </div>
  );
};

export default CRSummary;
