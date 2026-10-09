import { createFileRoute } from "@tanstack/react-router";
import OwnerDashboard from "@/screens/OwnerDashboard";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/owner-dashboard")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard | AgriRent" },
      { name: "description", content: "Manage listings, booking requests and revenue as an AgriRent equipment owner." },
      { property: "og:title", content: "Owner Dashboard | AgriRent" },
      { property: "og:description", content: "Manage listings, booking requests and revenue as an AgriRent equipment owner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = usePrototypeNavigate();
  return (
    <PrototypeShell>
      <OwnerDashboard onNavigate={navigate} />
    </PrototypeShell>
  );
}
