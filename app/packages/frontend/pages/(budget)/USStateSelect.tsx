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
  const { data } = useQuery<ListUSStatesResponse>({
    queryKey: ["list-us-states"],
    queryFn: listUSStates,

    // refetches are unnecessary, because the data is static
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const items = useMemo(() => {
    const stateNames = (data?.us_states ?? [])
      .filter((state) => state.name)
      .map((state) => state.name!);

    return createListCollection({
      items: [emptyUSState, ...stateNames].map((stateName) => ({
        label: stateName,
        value: stateName,
      })),
    });
  }, [data]);

  return (
    <SelectRoot
      collection={items}
      size="sm"
      width="320px"
      variant="outline"
      defaultValue={[emptyUSState]}
      onValueChange={(item) => setSelected(item.value[0])}
    >
      <SelectTrigger>
        <SelectValueText placeholder="Select state" />
      </SelectTrigger>
      <SelectContent>
        {items.items.map((item) => (
          <SelectItem
            item={item}
            key={item.value}
            className="hover:cursor-pointer hover:bg-gray-500"
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

export default USStateSelect;
