import { createFileRoute } from "@tanstack/react-router";
import AnalyticsPage from "@/screens/AnalyticsPage";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Fleet Analytics | AgriRent" },
      { name: "description", content: "Machinery utilization rate, popular equipment, and seasonal telemetry." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = usePrototypeNavigate();
  return (
    <PrototypeShell>
      <AnalyticsPage onNavigate={navigate} />
    </PrototypeShell>
  );
}
