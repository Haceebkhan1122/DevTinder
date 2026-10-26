import { RequireAuth } from "@/components/RequireAuth";
import ConnectionsGrid from "@/components/connections/ConnectionsGrid";

export const metadata = { title: "Connections" };

export default function ConnectionsPage() {
  return (
    <RequireAuth>
      <ConnectionsGrid />
    </RequireAuth>
  );
}
