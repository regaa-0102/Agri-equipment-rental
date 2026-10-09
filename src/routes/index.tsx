import { createFileRoute } from "@tanstack/react-router";
import HomePage from "@/screens/HomePage";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriRent — Rent Farm Equipment Near You" },
      { name: "description", content: "Book tractors, harvesters and farm tools from verified owners across India, in English or Tamil." },
      { property: "og:title", content: "AgriRent — Rent Farm Equipment Near You" },
      { property: "og:description", content: "Book tractors, harvesters and farm tools from verified owners across India, in English or Tamil." },
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
      <HomePage onNavigate={navigate} />
    </PrototypeShell>
  );
}
