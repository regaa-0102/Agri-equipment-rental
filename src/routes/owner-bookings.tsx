import { createFileRoute } from "@tanstack/react-router";
import BookingRequestsPage from "@/screens/BookingRequestsPage";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/owner-bookings")({
  head: () => ({
    meta: [
      { title: "Booking Requests | AgriRent Owner" },
      { name: "description", content: "Approve or decline farmer equipment booking requests." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = usePrototypeNavigate();
  return (
    <PrototypeShell>
      <BookingRequestsPage onNavigate={navigate} />
    </PrototypeShell>
  );
}
