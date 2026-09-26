import { createFileRoute } from "@tanstack/react-router";
import NotificationsPage from "@/screens/NotificationsPage";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Center | AgriRent" },
      { name: "description", content: "View equipment booking alerts, payment statuses, and verification updates." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = usePrototypeNavigate();
  return (
    <PrototypeShell>
      <NotificationsPage onNavigate={navigate} />
    </PrototypeShell>
  );
}
