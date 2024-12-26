"use client";

import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@chakra-ui/react";
import classNames from "classnames";
import { useMemo, useRef, useState } from "react";
import { Elaboration } from "./Elaboration";

const titleDelimiter = "title>>";
const elaborationAccordionValue = "elaboration";

export const Summary = ({
  usState,
  text,
  isFetching,
}: {
  usState: string;
  text: string;
  isFetching: boolean;
}) => {
  const cardRootRef = useRef<HTMLDivElement>(null);
  const [shouldShowElaboration, setShouldShowElaboration] =
    useState<boolean>(false);

  const [summary, title] = useMemo(() => text.split(titleDelimiter), [text]);

  const textClassName = classNames("text-left text-base whitespace-pre-line", {
    "text-gray-300": isFetching,
    "text-black": !isFetching,
  });

  return (
    <Card.Root ref={cardRootRef} className="border-2 h-full">
      <Card.Body className="flex flex-col gap-2">
        <Card.Title
          className={classNames(textClassName, "mt-2 px-6 font-semibold")}
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
        <Card.Footer className="flex justify-end">
          <AccordionRoot
            collapsible
            value={shouldShowElaboration ? [elaborationAccordionValue] : []}
            onValueChange={(value) => {
              if (value.value.includes(elaborationAccordionValue)) {
                setShouldShowElaboration(true);
                return;
              }

              setShouldShowElaboration(false);
            }}
          >
            <AccordionItem value={elaborationAccordionValue}>
              <AccordionItemTrigger
                className={classNames(textClassName, "font-semibold")}
              >
                Learn more
              </AccordionItemTrigger>
              <AccordionItemContent>
                <div className="my-4">
                  <Elaboration
                    usState={usState}
                    summary={summary}
                    shouldShow={true}
                    isSummaryFetching={isFetching}
                  />
                </div>
                <div className="flex flex-row justify-end mr-4">
                  <Button
                    variant="surface"
                    className="px-4 hover:bg-gray-300"
                    onClick={() => {
                      setShouldShowElaboration(false);

                      cardRootRef.current?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }}
                  >
                    Close
                  </Button>
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
