import { createFileRoute } from "@tanstack/react-router";
import PaymentSuccess from "@/screens/PaymentSuccess";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/payment-success")({
  head: () => ({
    meta: [
      { title: "Booking Confirmed | AgriRent" },
      { name: "description", content: "Your AgriRent payment succeeded and your equipment booking is confirmed." },
      { property: "og:title", content: "Booking Confirmed | AgriRent" },
      { property: "og:description", content: "Your AgriRent payment succeeded and your equipment booking is confirmed." },
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
      <PaymentSuccess onNavigate={navigate} />
    </PrototypeShell>
  );
}
