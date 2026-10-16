import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { getInventoryItemById, getItemHistory } from "@/lib/actions/inventory";
import { RestockDialog } from "@/components/RestockDialog";
import { InventoryAssignmentDialog } from "@/components/InventoryAssignmentDialog";
import { Footer } from "@/components/Footer";
import {
  ArrowLeft,
  ArrowRightLeft,
  PackagePlus,
  Package,
  CheckCircle2,
  Boxes,
  Tag,
  Wallet,
  TriangleAlert,
  Droplets,
  History,
  MapPin,
  Plus,
} from "lucide-react";
import { notFound } from "next/navigation";
import { formatDateInTimezone } from "@/lib/utils";
import { ReportIssueDialog } from "@/components/Reportissuedialog";
import { ResolveIssueDialog } from "@/components/Resolveissuedialog";
import { LogUsageDialog } from "@/components/Logusagedialog";
import Link from "next/link";

const TIMEZONE = "Africa/Nairobi";
const HISTORY_PER_PAGE = 15;

interface InventoryDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

/** Each history event type gets its own icon and colour. */
const EVENT_META: Record<
  string,
  { label: string; icon: typeof PackagePlus; className: string }
> = {
  restock: {
    label: "Restock",
    icon: PackagePlus,
    className: "text-green-600",
  },
  assignment: {
    label: "Assigned",
    icon: ArrowRightLeft,
    className: "text-blue-600",
  },
  issue: {
    label: "Issue",
    icon: TriangleAlert,
    className: "text-amber-600",
  },
  usage: {
    label: "Usage",
    icon: Droplets,
    className: "text-purple-600",
  },
};

export default async function InventoryDetailsPage({
  params,
  searchParams,
}: InventoryDetailsPageProps) {
  const { id } = await params;
  const { page = "1" } = await searchParams;

  // IDs are cuids now — Number(id) would be NaN and 404 every item.
  const currentPage = Number(page) || 1;

  const item = await getInventoryItemById(id);
  if (!item) return notFound();

  const history = await getItemHistory(id);

  // History is one merged feed rather than a paginated table, so it's
  // sliced here instead of in the query.
  const totalPages = Math.max(1, Math.ceil(history.length / HISTORY_PER_PAGE));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const pagedHistory = history.slice(
    (safePage - 1) * HISTORY_PER_PAGE,
    safePage * HISTORY_PER_PAGE,
  );

  const openIssues = item.issues.filter((issue) => issue.status === "open");

  const outstandingAssignments = item.assignments.filter(
    (a) => a.status === "active" || a.status === "partial",
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="default" asChild>
          <Link href="/inventory">
            <ArrowLeft className="mr-2 size-4" />
            Back to Inventory
          </Link>
        </Button>

        {/* Which actions apply is decided by category, same as the server */}
        <div className="flex flex-wrap gap-2">
          <RestockDialog item={item}>
            <Button className="cursor-pointer bg-green-800 text-white hover:bg-green-900">
              <PackagePlus className="mr-2 size-4" />
              Restock
            </Button>
          </RestockDialog>

          {item.rules.canReportIssue && (
            <ReportIssueDialog item={item} assignments={outstandingAssignments}>
              <Button className="cursor-pointer bg-red-700 text-white hover:bg-red-800">
                <TriangleAlert className="mr-2 size-4" />
                Report issue
              </Button>
            </ReportIssueDialog>
          )}

          {item.rules.canAssign && item.availableQuantity > 0 && (
            <InventoryAssignmentDialog
              preselectedItemId={item.id}
              preselectedPropertyId={item.propertyId}
              trigger={
                <Button variant="outline" className="cursor-pointer">
                  <Plus className="mr-2 size-4" />
                  Assign to unit
                </Button>
              }
            />
          )}

          {item.rules.canLogUsage && (
            <LogUsageDialog item={item}>
              <Button variant="outline" className="cursor-pointer">
                <Droplets className="mr-2 size-4" />
                Log usage
              </Button>
            </LogUsageDialog>
          )}
        </div>
      </header>

      {/* Hero */}
      <Card className="border border-gray-300 bg-gradient-to-tr from-muted/50 to-white shadow-lg">
        <CardContent className="py-4 md:py-5">
          <div className="mb-2 flex flex-col justify-center gap-2">
            <h1 className="text-3xl font-bold capitalize tracking-tight">
              {item.itemName}
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={item.status === "active" ? "default" : "secondary"}
                className="capitalize"
              >
                {item.status}
              </Badge>

              <Badge variant="outline" className="capitalize">
                {item.category.replace(/_/g, " ")}
              </Badge>

              <Badge variant="outline">{item.property.name}</Badge>

              {item.availableQuantity <= 0 ? (
                <Badge variant="destructive">Out of stock</Badge>
              ) : item.needsRestock ? (
                <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                  Needs restocking
                </Badge>
              ) : null}

              {openIssues.length > 0 && (
                <Badge variant="destructive">
                  {openIssues.length} open{" "}
                  {openIssues.length === 1 ? "issue" : "issues"}
                </Badge>
              )}
            </div>
          </div>

          {item.description && (
            <p className="my-4 text-lg text-muted-foreground">
              {item.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quantities — available + assigned = total, all derived */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <Package className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">In store</div>
            <div className="font-medium">
              {formatQty(item.availableQuantity)} {item.unitOfMeasure}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <ArrowRightLeft className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Out in units</div>
            <div className="font-medium">
              {item.rules.canAssign
                ? `${formatQty(item.assignedQuantity)} ${item.unitOfMeasure}`
                : "—"}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <Boxes className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Total owned</div>
            <div className="font-medium">
              {formatQty(item.totalOwned)} {item.unitOfMeasure}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <Tag className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">
              Restock threshold
            </div>
            <div className="font-medium">
              {formatQty(item.restockAt)} {item.unitOfMeasure}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <Wallet className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Unit cost</div>
            <div className="font-medium">
              {item.unitCost
                ? `KES ${item.unitCost.toLocaleString()}`
                : "Not specified"}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <Wallet className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Stock value</div>
            <div className="font-medium">
              {item.unitCost
                ? `KES ${Math.round(
                    item.unitCost * item.totalOwned,
                  ).toLocaleString()}`
                : "—"}
            </div>
          </div>
        </Card>
      </div>

      {/* Open issues — surfaced here because an unresolved repair keeps
          stock understated until someone closes it */}
      {openIssues.length > 0 && (
        <Card className="border-amber-200 shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TriangleAlert className="h-5 w-5 text-amber-600" />
              Open issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {openIssues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-md border border-border p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="destructive" className="capitalize">
                    {issue.issueType.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-sm font-medium">
                    {formatQty(issue.quantityAffected)} {item.unitOfMeasure}
                  </span>
                  {issue.assignment && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {issue.assignment.unit.name}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm">{issue.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reported by {issue.reportedBy.name} on{" "}
                  {formatDateInTimezone(new Date(issue.reportedAt), {
                    timeZone: TIMEZONE,
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </p>

                <div className="mt-3 flex justify-end">
                  <ResolveIssueDialog
                    issue={{
                      ...issue,
                      inventoryItem: {
                        itemName: item.itemName,
                        unitOfMeasure: item.unitOfMeasure,
                      },
                    }}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Resolve
                    </Button>
                  </ResolveIssueDialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Where this item currently sits */}
      {outstandingAssignments.length > 0 && (
        <Card className="shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              Currently in units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Still out</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingAssignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.unit.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatQty(a.outstandingQuantity)}{" "}
                      <span className="text-xs text-muted-foreground">
                        {item.unitOfMeasure}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.serialNumber || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateInTimezone(new Date(a.assignedAt), {
                        timeZone: TIMEZONE,
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.assignedBy.name}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Merged history: restocks, assignments, issues and usage in one feed */}
      <Card className="border-0 shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <History className="h-5 w-5 text-primary" />
            Stock history
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No stock movements recorded for this item yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full overflow-hidden rounded-lg border text-sm">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="p-3 text-left font-semibold">
                      Date
                    </TableHead>
                    <TableHead className="p-3 text-left font-semibold">
                      Event
                    </TableHead>
                    <TableHead className="p-3 text-right font-semibold">
                      Change
                    </TableHead>
                    <TableHead className="p-3 text-left font-semibold">
                      By
                    </TableHead>
                    <TableHead className="p-3 text-left font-semibold">
                      Detail
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pagedHistory.map((event, idx) => {
                    const meta = EVENT_META[event.type];
                    const EventIcon = meta?.icon ?? ArrowRightLeft;

                    return (
                      <TableRow
                        key={`${event.type}-${event.at.toISOString()}-${idx}`}
                        className={idx % 2 === 0 ? "bg-white" : "bg-muted/50"}
                      >
                        <TableCell className="whitespace-nowrap p-3">
                          {formatDateInTimezone(new Date(event.at), {
                            timeZone: TIMEZONE,
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </TableCell>

                        <TableCell className="whitespace-nowrap p-3">
                          <span className="flex items-center gap-1.5">
                            <EventIcon
                              className={`h-4 w-4 ${meta?.className ?? ""}`}
                            />
                            {meta?.label ?? event.type}
                          </span>
                        </TableCell>

                        {/* Positive = into the store, negative = out of it.
                            Assigned issues show 0 — the stock already left
                            when it was assigned. */}
                        <TableCell className="whitespace-nowrap p-3 text-right tabular-nums">
                          {event.quantity === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span
                              className={
                                event.quantity > 0
                                  ? "font-medium text-green-600"
                                  : "font-medium text-destructive"
                              }
                            >
                              {event.quantity > 0 ? "+" : ""}
                              {formatQty(event.quantity)}{" "}
                              <span className="text-xs font-normal text-muted-foreground">
                                {item.unitOfMeasure}
                              </span>
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="whitespace-nowrap p-3">
                          {event.actor}
                        </TableCell>

                        <TableCell className="p-3">
                          {event.detail || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > HISTORY_PER_PAGE && (
        <Footer
          currentPage={safePage}
          hasNext={safePage < totalPages}
          hasPrev={safePage > 1}
          totalPages={totalPages}
        />
      )}
    </section>
  );
}
