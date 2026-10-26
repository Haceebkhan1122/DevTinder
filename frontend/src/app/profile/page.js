import { RequireAuth } from "@/components/RequireAuth";
import ProfileEditor from "@/components/profile/ProfileEditor";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileEditor />
    </RequireAuth>
  );
}
