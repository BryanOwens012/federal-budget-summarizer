"use client";

import { Box, Image } from "@chakra-ui/react";
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
        alt="U.S. Capitol, where Congress meets"
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
            <h1 className="text-center text-4xl font-bold text-blue-500">
              {"What does the "}
              <Link href={budgetURL} target="_blank" className="underline">
                new federal budget
              </Link>
              {" mean for you?"}
            </h1>
            <p className="text-base whitespace-pre-line">{introParagraph}</p>
            <div>
              Select your state:
              <USStateSelect setSelected={setUSState} />
            </div>
            <Summaries usState={usState} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
