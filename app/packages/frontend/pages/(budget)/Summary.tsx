"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@chakra-ui/react";
import classNames from "classnames";
import { useMemo, useState } from "react";
import { Elaboration } from "./Elaboration";

const titleDelimiter = "title>>";

export const Summary = ({
  text,
  isFetching,
}: {
  text: string;
  isFetching: boolean;
}) => {
  const [summary, title] = useMemo(() => text.split(titleDelimiter), [text]);

  const textClassName = classNames("text-left whitespace-pre-line", {
    "text-gray-300": isFetching,
    "text-black": !isFetching,
  });

  const [shouldShowElaboration, setShouldShowElaboration] =
    useState<boolean>(false);

  return (
    <Card.Root className="border-2">
      <Card.Body gap="2">
        <Card.Title
          mt="2"
          className={classNames(textClassName, "pl-4 font-semibold")}
        >
          {title}
        </Card.Title>
        <Card.Description>
          <div
            className={classNames(textClassName, "p-4 flex flex-col gap-y-2")}
          >
            {summary}
          </div>
        </Card.Description>
        <Card.Footer justifyContent="flex-end">
          <div className="flex flex-col gap-y-12">
            <Button
              onClick={() =>
                setShouldShowElaboration((shouldShow) => !shouldShow)
              }
            >
              Learn more
            </Button>

            <Elaboration
              summary={summary}
              shouldShow={shouldShowElaboration}
              isSummaryFetching={isFetching}
            />
          </div>
        </Card.Footer>
      </Card.Body>
    </Card.Root>
  );
};

export default Summary;
