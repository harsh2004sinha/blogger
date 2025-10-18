import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-700">
      <div className="pt-32 pl-[37%]">
        <SignUp />
      </div>
    </div>
  );
}
