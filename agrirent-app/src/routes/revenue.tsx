import { createFileRoute } from "@tanstack/react-router";
import RevenuePage from "@/screens/RevenuePage";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/revenue")({
  head: () => ({
    meta: [
      { title: "Revenue & Settlements | AgriRent" },
      { name: "description", content: "Fleet earnings, escrow payout schedules, and bank settlements." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = usePrototypeNavigate();
  return (
    <PrototypeShell>
      <RevenuePage onNavigate={navigate} />
    </PrototypeShell>
  );
}
