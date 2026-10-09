import { createFileRoute } from "@tanstack/react-router";
import EquipmentDetails from "@/screens/EquipmentDetails";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/equipment-details")({
  head: () => ({
    meta: [
      { title: "Equipment Details | AgriRent" },
      { name: "description", content: "See specifications, availability, pricing and reviews before booking farm equipment." },
      { property: "og:title", content: "Equipment Details | AgriRent" },
      { property: "og:description", content: "See specifications, availability, pricing and reviews before booking farm equipment." },
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
      <EquipmentDetails onNavigate={navigate} />
    </PrototypeShell>
  );
}
