import { createFileRoute } from "@tanstack/react-router";
import AddEquipment from "@/screens/AddEquipment";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/add-equipment")({
  head: () => ({
    meta: [
      { title: "Add Equipment | AgriRent" },
      { name: "description", content: "List your tractor or farm machinery for rent with photos, pricing and availability." },
      { property: "og:title", content: "Add Equipment | AgriRent" },
      { property: "og:description", content: "List your tractor or farm machinery for rent with photos, pricing and availability." },
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
      <AddEquipment onNavigate={navigate} />
    </PrototypeShell>
  );
}
