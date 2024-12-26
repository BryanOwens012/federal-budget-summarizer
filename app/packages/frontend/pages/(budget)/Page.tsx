"use client";

import { Box, Card, Image } from "@chakra-ui/react";
import classNames from "classnames";
import Link from "next/link";
import { useState } from "react";
import { Summaries } from "./Summaries";
import USStateSelect, { emptyUSState } from "./USStateSelect";

const budgetURL =
  "https://www.congress.gov/bill/118th-congress/house-bill/10545/text";

const introParagraph =
  "The latest federal budget, signed on December 21, 2024, extends government funding until March 14, 2025.";

const CapitolImage = () => {
  return (
    <Box position="relative" width="100vw" height="100%" overflow="visible">
      <Image
        src="capitol_building.webp"
        alt="U.S. Capitol, where Congress meets. Source: https://www.aoc.gov/explore-capitol-campus/buildings-grounds/capitol-building"
        width="100%"
        height="100%"
        objectFit="cover"
        objectPosition="center"
        css={{
          maskImage:
            "linear-gradient(to bottom, transparent, black, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black, transparent)",
        }}
      />
    </Box>
  );
};

const GitHubImage = () => {
  return (
    <Link
      href="https://github.com/BryanOwens012/federal-budget-summarizer"
      target="_blank"
    >
      <Box position="relative" width="5" height="100%" overflow="visible">
        <Image
          src="github_logo.png"
          alt="GitHub logo. Source: https://www.flaticon.com/free-icon/github_2111432"
          width="100%"
          height="100%"
          objectFit="cover"
          objectPosition="center"
        />
      </Box>
    </Link>
  );
};

export const Page = () => {
  const [usState, setUSState] = useState(emptyUSState);

  return (
    <>
      <div className="flex justify-center absolute z-0">
        <CapitolImage />
      </div>
      <div className="m-10 max-w-full md:max-w-4/5 lg:max-w-3/4 xl:max-w-2/3 z-10 relative">
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col gap-y-10 items-center">
            <h1 className="text-center text-4xl font-bold text-blue-600">
              {"What does the "}
              <Link href={budgetURL} target="_blank" className="underline">
                new federal budget
              </Link>
              {" mean for you?"}
            </h1>

            <div className="text-base whitespace-pre-line text-blue-600 font-semibold">
              {introParagraph}
            </div>

            <Card.Root className="border-2 h-full opacity-95">
              <Card.Body className="flex flex-col gap-2">
                <Card.Title className={classNames("mt-2 px-6 font-semibold")}>
                  Select your state, and then ChatGPT will describe how the
                  budget affects you:
                </Card.Title>
                <div className="flex flex-col items-center mt-4">
                  <USStateSelect setSelected={setUSState} />
                </div>
              </Card.Body>
            </Card.Root>

            <Summaries usState={usState} />
          </div>
        </div>
      </div>

      <div className="h-[100px] bg-blue-700 opacity-80 flex items-center justify-center">
        <div className="flex flex-col gap-y-2 text-center text-white text-sm">
          <div>© 2024 Bryan Owens</div>
          <div className="inline-flex gap-x-2">
            <div>Code is open source here: </div>
            <GitHubImage />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
