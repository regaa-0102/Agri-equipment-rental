import { createFileRoute } from "@tanstack/react-router";
import BookingPage from "@/screens/BookingPage";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book Equipment | AgriRent" },
      { name: "description", content: "Choose rental dates, delivery address and payment method to confirm your booking." },
      { property: "og:title", content: "Book Equipment | AgriRent" },
      { property: "og:description", content: "Choose rental dates, delivery address and payment method to confirm your booking." },
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
      <BookingPage onNavigate={navigate} />
    </PrototypeShell>
  );
}
