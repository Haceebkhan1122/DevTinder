import { LogoMark } from "@/components/Icons";

// Shared centered layout for login / signup / forgot / reset pages
export default function AuthLayout({ children }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-6 flex justify-center">
          <LogoMark className="size-12 drop-shadow-[0_10px_25px_rgb(184_41_63/0.45)]" />
        </div>
        {children}
      </div>
    </div>
  );
}
