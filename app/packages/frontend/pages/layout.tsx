import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return <div className="h-screen bg-gray">{children}</div>;
};

export default Layout;
