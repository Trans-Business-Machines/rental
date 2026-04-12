import { getBookingRequestsStats } from "@/lib/actions/booking-requests";
import { getServerSession } from "@/lib/check-permissions";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { StatCards, type StatCardsProps } from "@/components/StatCards";

export async function Statistics() {
  const session = await getServerSession();
  const isAgent = session?.user?.role === "agent";

  const stats = await getBookingRequestsStats();

  const subtitleSuffix = isAgent ? "by you" : "from all agents";

  const statsInfo: StatCardsProps[] = [
    {
      title: "Total Requests",
      value: stats.total,
      subtitle: `All requests ${subtitleSuffix}`,
      icon: FileText,
      color: "blue",
    },
    {
      title: "Pending",
      value: stats.pending,
      subtitle: `Awaiting review`,
      icon: Clock,
      color: "orange",
    },
    {
      title: "Approved",
      value: stats.approved,
      subtitle: `Successfully approved`,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      subtitle: `Declined requests`,
      icon: XCircle,
      color: "red",
    },
  ];

  return (
    <div className="my-2">
      <StatCards stats={statsInfo} />
    </div>
  );
}