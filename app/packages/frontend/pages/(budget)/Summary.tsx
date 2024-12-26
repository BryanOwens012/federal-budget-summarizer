import classNames from "classnames";

export const Summary = ({
  text,
  isFetching,
}: {
  text: string;
  isFetching: boolean;
}) => {
  return (
    <div
      className={classNames("text-left p-4 border-2", {
        "border-gray-300 text-gray-300": isFetching,
        "border-black text-black": !isFetching,
      })}
    >
      <p>{text}</p>
    </div>
  );
};

export default Summary;
