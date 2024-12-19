import React from "react";
import Link from "next/link";

const About: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-green-600">About Us</h1>
      <p className="text-lg mt-4 text-gray-600">
        Welcome to the About page of our Next.js app.
      </p>
      <Link href="/">
        <span className="mt-4 text-blue-500 underline">Go back to Home</span>
      </Link>
    </div>
  );
};

export default About;
