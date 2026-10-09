import { createFileRoute } from "@tanstack/react-router";
import HelpSupportPage from "@/screens/HelpSupportPage";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support | AgriRent" },
      { name: "description", content: "24/7 farmer hotline, equipment emergency repair, and dispute resolution." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = usePrototypeNavigate();
  return (
    <PrototypeShell>
      <HelpSupportPage onNavigate={navigate} />
    </PrototypeShell>
  );
}
