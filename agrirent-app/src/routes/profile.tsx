import { createFileRoute } from "@tanstack/react-router";
import ProfilePage from "@/screens/ProfilePage";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "User Profile & Verification | AgriRent" },
      { name: "description", content: "Manage farmer/owner profile and view Aadhaar-prototype identity verification status." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = usePrototypeNavigate();
  return (
    <PrototypeShell>
      <ProfilePage onNavigate={navigate} />
    </PrototypeShell>
  );
}
