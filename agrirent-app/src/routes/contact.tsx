import { createFileRoute } from "@tanstack/react-router";
import ContactPage from "@/screens/ContactPage";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact AgriRent | AgriRent" },
      {
        name: "description",
        content:
          "Have a question about equipment rentals, bookings, or your account? We're here to help. Contact AgriRent Founder Regaa G and support.",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = usePrototypeNavigate();
  return (
    <PrototypeShell>
      <ContactPage onNavigate={navigate} />
    </PrototypeShell>
  );
}
