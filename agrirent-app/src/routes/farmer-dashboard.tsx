import { createFileRoute } from "@tanstack/react-router";
import FarmerDashboard from "@/screens/FarmerDashboard";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/farmer-dashboard")({
  head: () => ({
    meta: [
      { title: "Farmer Dashboard | AgriRent" },
      { name: "description", content: "Track active rentals, bookings and payments from your AgriRent farmer dashboard." },
      { property: "og:title", content: "Farmer Dashboard | AgriRent" },
      { property: "og:description", content: "Track active rentals, bookings and payments from your AgriRent farmer dashboard." },
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
      <FarmerDashboard onNavigate={navigate} />
    </PrototypeShell>
  );
}
