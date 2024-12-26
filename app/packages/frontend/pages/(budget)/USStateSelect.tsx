"use client";

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { ListUSStatesRow } from "@/db/us_states_sql";
import { createListCollection } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useMemo } from "react";
import { apiURL, apiVersion } from "../_app";

type ListUSStatesResponse = { us_states: ListUSStatesRow[] };

export const emptyUSState = "-";

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

export const USStateSelect = ({
  setSelected,
}: {
  setSelected: Dispatch<SetStateAction<string>>;
}) => {
  const { data, isLoading, error } = useQuery<ListUSStatesResponse>({
    queryKey: ["list-us-states"],
    queryFn: listUSStates,

    // refetches are unnecessary, because the data is static
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    experimental_prefetchInRender: true,
  });

  const items = useMemo(() => {
    const emptyUSStateItem = {
      label: error ? "Error" : isLoading ? "Loading..." : "(All states)",
      value: emptyUSState,
    };

    const stateNames = (data?.us_states ?? [])
      .filter((state) => state.name)
      .map((state) => state.name!)
      .sort((a, b) => a.localeCompare(b));

    return createListCollection({
      items: [
        emptyUSStateItem,
        ...stateNames.map((stateName) => ({
          label: stateName,
          value: stateName,
        })),
      ],
    });
  }, [error, isLoading, emptyUSState, data]);

  return (
    <SelectRoot
      collection={items}
      size="md"
      width="320px"
      variant="outline"
      defaultValue={[emptyUSState]}
      onValueChange={(item) => setSelected(item.value[0])}
      className="border-2 rounded-lg px-4"
    >
      <SelectTrigger>
        <SelectValueText placeholder="Select state" />
      </SelectTrigger>
      <SelectContent>
        {items.items.map((item) => (
          <SelectItem
            item={item}
            key={item.value}
            className="hover:cursor-pointer hover:bg-gray-300 text-inherit"
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

export default USStateSelect;
