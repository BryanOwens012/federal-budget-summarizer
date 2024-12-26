"use client";

import { Card } from "@chakra-ui/react";
import classNames from "classnames";
import { useMemo } from "react";
import Elaboration from "./Elaboration";

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

  return (
    <Card.Root>
      <Card.Body gap="2">
        <Card.Title mt="2" className={textClassName}>
          {title}
        </Card.Title>
        <Card.Description>
          <div
            className={classNames("p-4 flex flex-col gap-y-2", textClassName)}
          >
            <p>{summary}</p>
            <Elaboration
              summary={summary}
              shouldShow={!!text}
              isSummaryFetching={isFetching}
            />
          </div>
        </Card.Description>
      </Card.Body>
    </Card.Root>
  );
};

export default Summary;
