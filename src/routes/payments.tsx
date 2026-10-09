import { createFileRoute } from "@tanstack/react-router";
import PaymentsPage from "@/screens/PaymentsPage";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments & Escrow | AgriRent" },
      { name: "description", content: "View transaction receipts, refund logs, and AgriSafe™ escrow status." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = usePrototypeNavigate();
  return (
    <PrototypeShell>
      <PaymentsPage onNavigate={navigate} />
    </PrototypeShell>
  );
}
