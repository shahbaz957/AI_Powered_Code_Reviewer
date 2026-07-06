import { Navbar } from "@/components/layout/Navbar";

export default async function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}