import classNames from "classnames";
import Elaboration from "./Elaboration";

export const Summary = ({
  text,
  isFetching,
}: {
  text: string;
  isFetching: boolean;
}) => {
  return (
    <div
      className={classNames("text-left p-4 border-2 flex flex-col gap-y-2", {
        "border-gray-300 text-gray-300": isFetching,
        "border-black text-black": !isFetching,
      })}
    >
      <p className="whitespace-pre-line">{text}</p>
      <Elaboration
        summary={text}
        shouldShow={!!text}
        isSummaryFetching={isFetching}
      />
    </div>
  );
};

export default Summary;
