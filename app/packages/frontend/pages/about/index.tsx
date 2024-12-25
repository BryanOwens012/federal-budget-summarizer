import Link from "next/link";
import React from "react";

const resumeLink =
  "https://drive.google.com/file/d/1FU8IAKn2pmwVPjDIe6C4B-aPEHB7_T4M/view?usp=drive_link";

const About: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-red-500">About Bryan Owens</h1>
      <p className="text-lg mt-4 text-gray-600">
        <Link href={resumeLink} target="_blank">
          <span className="mt-4 text-blue-500 underline">Resume</span>
        </Link>
      </p>
    </div>
  );
};

export default About;
