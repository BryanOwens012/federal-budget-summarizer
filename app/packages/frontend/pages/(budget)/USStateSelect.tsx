"use client";

import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { ListUSStatesRow } from "@/db/us_states_sql";
import { createListCollection } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiURL, apiVersion } from "../_app";

type ListUSStatesResponse = { us_states: ListUSStatesRow[] };

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

export const USStateSelect = () => {
  const { data: usStatesData } = useQuery<ListUSStatesResponse>({
    queryKey: ["list-us-states"],
    queryFn: listUSStates,

    // refetches are unnecessary, because the data is static
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const usStates = useMemo(
    () =>
      createListCollection({
        items:
          usStatesData?.us_states.map((usState) => ({
            label: usState.name,
            value: usState.name,
          })) || [],
      }),
    [usStatesData]
  );

  return (
    <SelectRoot collection={usStates} size="sm" width="320px">
      <SelectLabel>Select U.S. state</SelectLabel>
      <SelectTrigger>
        <SelectValueText placeholder="Select state" />
      </SelectTrigger>
      <SelectContent>
        {usStates.items.map((usState) => (
          <SelectItem item={usState} key={usState.value}>
            {usState.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

export default USStateSelect;
