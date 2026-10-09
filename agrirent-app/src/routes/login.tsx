import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/screens/LoginPage";
import PrototypeShell, { usePrototypeNavigate } from "@/components/PrototypeShell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In | AgriRent" },
      { name: "description", content: "Sign in to your AgriRent account to manage farm equipment rentals and bookings." },
      { property: "og:title", content: "Log In | AgriRent" },
      { property: "og:description", content: "Sign in to your AgriRent account to manage farm equipment rentals and bookings." },
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
      <LoginPage onNavigate={navigate} />
    </PrototypeShell>
  );
}
