import { createFileRoute } from "@tanstack/react-router";
import MyBookings from "@/screens/MyBookings";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings | AgriRent" },
      { name: "description", content: "View active, completed and cancelled farm equipment rentals in one place." },
      { property: "og:title", content: "My Bookings | AgriRent" },
      { property: "og:description", content: "View active, completed and cancelled farm equipment rentals in one place." },
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
      <MyBookings onNavigate={navigate} />
    </PrototypeShell>
  );
}
