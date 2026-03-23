import { Navbar } from "@/components/layout/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Real implementation:
  // const session = await auth.api.getSession({ headers: await headers() })
  // if (!session) redirect("/sign-in")

  return (
    <>
      <Navbar isAuthenticated={true} />
      {children}
    </>
  );
}