import { RequireAuth } from "@/components/RequireAuth";
import RequestsList from "@/components/requests/RequestsList";

export const metadata = { title: "Requests" };

export default function RequestsPage() {
  return (
    <RequireAuth>
      <RequestsList />
    </RequireAuth>
  );
}
