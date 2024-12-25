import { Spinner } from "@chakra-ui/react";
import { ReactNode, Suspense } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen bg-gray">
      <Suspense fallback={<Spinner />}>{children}</Suspense>
    </div>
  );
};

export default Layout;
