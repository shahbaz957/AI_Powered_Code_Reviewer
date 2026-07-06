import { Navbar } from "@/components/layout/Navbar";

export default async function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}