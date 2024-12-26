"use client";

import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "@/components/ui/accordion";
import { Card } from "@chakra-ui/react";
import classNames from "classnames";
import { useMemo } from "react";
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

  const textClassName = classNames("text-left text-base whitespace-pre-line", {
    "text-gray-300": isFetching,
    "text-black": !isFetching,
  });

  return (
    <Card.Root className="border-2">
      <Card.Body gap="2">
        <Card.Title
          mt="2"
          className={classNames(textClassName, "px-6 font-semibold")}
        >
          {title}
        </Card.Title>
        <Card.Description>
          <div
            className={classNames(
              textClassName,
              "py-4 px-6 flex flex-col gap-y-2"
            )}
          >
            {summary}
          </div>
        </Card.Description>
        <Card.Footer className="justify-end">
          <AccordionRoot collapsible>
            <AccordionItem value="elaboration">
              <AccordionItemTrigger
                className={classNames(textClassName, "font-semibold")}
              >
                Learn more
              </AccordionItemTrigger>
              <AccordionItemContent>
                <div className="mt-4">
                  <Elaboration
                    summary={summary}
                    shouldShow={true}
                    isSummaryFetching={isFetching}
                  />
                </div>
              </AccordionItemContent>
            </AccordionItem>
          </AccordionRoot>
        </Card.Footer>
      </Card.Body>
    </Card.Root>
  );
};

export default Summary;
