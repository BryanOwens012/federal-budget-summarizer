import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="m-10 overflow-auto max-w-full md:max-w-4/5 lg:max-w-3/4 xl:max-w-2/3 bg-gray-50 h-screen">
      <div className="flex justify-center items-center">{children}</div>
    </div>
  );
};

export default Layout;
