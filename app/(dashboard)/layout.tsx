import { Layout } from "@/components/Layout";
import TableModeContext from "@/components/TableModeContext";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout>
      <TableModeContext>{children}</TableModeContext>
    </Layout>
  );
}
