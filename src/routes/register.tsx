import { createFileRoute } from "@tanstack/react-router";
import RegistrationPage from "@/screens/RegistrationPage";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account | AgriRent" },
      { name: "description", content: "Register as a farmer or equipment owner and start renting farm machinery on AgriRent." },
      { property: "og:title", content: "Create Account | AgriRent" },
      { property: "og:description", content: "Register as a farmer or equipment owner and start renting farm machinery on AgriRent." },
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
      <RegistrationPage onNavigate={navigate} />
    </PrototypeShell>
  );
}
