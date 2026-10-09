import { createFileRoute } from "@tanstack/react-router";
import AdminDashboard from "@/screens/AdminDashboard";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/admin-dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | AgriRent" },
      { name: "description", content: "Monitor platform revenue, verifications, disputes and state-wise performance." },
      { property: "og:title", content: "Admin Dashboard | AgriRent" },
      { property: "og:description", content: "Monitor platform revenue, verifications, disputes and state-wise performance." },
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
      <AdminDashboard onNavigate={navigate} />
    </PrototypeShell>
  );
}
