export const Summary = ({ text }: { text: string }) => {
  return (
    <div className="text-left p-4 border-black border-2">
      <p>{text}</p>
    </div>
  );
};

export default Summary;
