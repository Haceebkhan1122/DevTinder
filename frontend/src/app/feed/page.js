import { RequireAuth } from "@/components/RequireAuth";
import FeedDeck from "@/components/feed/FeedDeck";

export const metadata = { title: "Discover" };

export default function FeedPage() {
  return (
    <RequireAuth>
      <FeedDeck />
    </RequireAuth>
  );
}
