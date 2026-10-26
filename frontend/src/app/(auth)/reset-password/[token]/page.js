import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { PageLoader } from "@/components/Spinner";

export const metadata = { title: "Reset password" };

// The token is only known at request time, so useParams() needs a Suspense boundary (cacheComponents)
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
