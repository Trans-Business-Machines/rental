import { getCheckoutReports } from "@/lib/actions/checkout";
import { getPropertyNames } from "@/lib/actions/properties";
import { InventoryDialog } from "@/components/InventoryDialog";
import { InventoryAssignmentDialog } from "@/components/InventoryAssignmentDialog";
import { InventoryAssignments } from "@/components/InventoryAssignments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { InventoryItems } from "@/components/InventoryItems";
import { InventortyCheckoutReports } from "@/components/InventortyCheckoutReports";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { UnauthorizedUI } from "./unauthorized-ui";
import {
  getInventoryAssignments,
  getInventoryItemsBatch,
  getInventoryStatsByCategory,
  getItemIssues,
  getIssueStats,
  type AssignmentFilter,
  type IssueFilter,
} from "@/lib/actions/inventory";
import { InventoryIssues } from "@/components/Inventoryissues";
import Link from "next/link";
import type { Role } from "@/lib/types/types";

interface InventoryPageSearchParams {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    search?: string;
    issueStatus?: string;
    issueType?: string;
    status?: string;
    assignmentStatus?: string;
    category?: string;
    propertyId?: string;
    unitId?: string;
    sortOrder?: "none" | "asc" | "desc";
  }>;
}

/* Fallbacks so a tab that isn't rendered costs nothing to query. */
type ItemsBatch = Awaited<ReturnType<typeof getInventoryItemsBatch>>;
type AssignmentsBatch = Awaited<ReturnType<typeof getInventoryAssignments>>;
type ReportsResponse = Awaited<ReturnType<typeof getCheckoutReports>>;
type IssuesResponse = Awaited<ReturnType<typeof getItemIssues>>;

const EMPTY_ISSUES: IssuesResponse = {
  issues: [],
  totalIssues: 0,
  totalPages: 0,
  currentPage: 1,
  hasNext: false,
  hasPrev: false,
};

export default async function InventoryPage({
  searchParams,
}: InventoryPageSearchParams) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const userRole = user.role as Role;

  if (userRole === "agent") {
    return <UnauthorizedUI />;
  }

  const params = await searchParams;

  const tab = params.tab || "inventory";
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const status = params.status || "all";
  // Assignments open on what's out in units; "all" has to be asked for.
  const assignmentStatus = (params.assignmentStatus ||
    "outstanding") as AssignmentFilter;
  const category = params.category || "all";
  const propertyId = params.propertyId || "all";
  const unitId = params.unitId || "all";
  const sortOrder = params.sortOrder || "none";
  const issueStatus = (params.issueStatus || "open") as IssueFilter;
  const issueType = params.issueType || "all";

  // Only the visible tab hits the database. Items and assignments scroll
  // infinitely; the server renders the first batch and the client fetches
  // the rest. On failure the client retries instead of the page erroring.
  const inventoryItemsPromise: Promise<ItemsBatch | null> =
    tab === "inventory"
      ? getInventoryItemsBatch({
          search,
          status,
          category,
          // Items are property-scoped now, so this filter applies here too.
          propertyId: propertyId !== "all" ? Number(propertyId) : undefined,
        }).catch(() => null)
      : Promise.resolve(null);

  const assignmentsPromise: Promise<AssignmentsBatch | null> =
    tab === "assignments"
      ? getInventoryAssignments({
          search,
          propertyId,
          unitId,
          status: assignmentStatus,
        }).catch(() => null)
      : Promise.resolve(null);

  const checkoutReportsPromise: Promise<ReportsResponse> =
    tab === "checkout"
      ? getCheckoutReports({ page, search, sortOrder })
      : Promise.resolve({
          reports: [],
          totalPages: 0,
          currentPage: 1,
          hasNext: false,
          hasPrev: false,
        } as ReportsResponse);

  const issuesPromise: Promise<IssuesResponse> =
    tab === "issues"
      ? getItemIssues({
          page,
          search,
          status: issueStatus,
          issueType,
          propertyId,
        })
      : Promise.resolve(EMPTY_ISSUES);

  const issueStatsPromise = getIssueStats();

  // Always needed: the carousel is above the tabs, and the Add Item
  // dialog needs a property to file the item under.
  const propertiesPromise = getPropertyNames();
  const categoryStatsPromise = getInventoryStatsByCategory();

  const [
    inventoryItemsResponse,
    checkoutReportsResponse,
    assignmentsResponse,
    issuesResponse,
    propertiesResponse,
    categoryStatsResponse,
    issueStatsResponse,
  ] = await Promise.all([
    inventoryItemsPromise,
    checkoutReportsPromise,
    assignmentsPromise,
    issuesPromise,
    propertiesPromise,
    categoryStatsPromise,
    issueStatsPromise,
  ]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Manage property inventory and guest checkout inspections
          </p>
        </div>
        <div className="flex space-x-2">
          {tab === "assignments" ? (
            <InventoryAssignmentDialog />
          ) : (
            <InventoryDialog properties={propertiesResponse} />
          )}
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="flex justify-center px-4">
        <CategoryCarousel stats={categoryStatsResponse} />
      </div>

      {/* Tabs */}
      <Tabs value={tab} className="space-y-2">
        <TabsList className="md:w-xl lg:w-3xl">
          <TabsTrigger value="inventory" className="cursor-pointer" asChild>
            <Link href="/inventory?tab=inventory">Inventory Items</Link>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="cursor-pointer" asChild>
            <Link href="/inventory?tab=assignments">Assignments</Link>
          </TabsTrigger>

          <TabsTrigger value="issues" className="cursor-pointer" asChild>
            <Link href="/inventory?tab=issues&page=1">
              Issues
              {issueStatsResponse.open > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 text-xs text-white">
                  {issueStatsResponse.open}
                </span>
              )}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="checkout" className="cursor-pointer" asChild>
            <Link href="/inventory?tab=checkout&page=1">Checkout Reports</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryItems
            properties={propertiesResponse}
            initialBatch={inventoryItemsResponse}
            initialFilters={{
              search,
              status,
              category,
              propertyId,
            }}
          />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <InventoryAssignments
            properties={propertiesResponse}
            initialBatch={assignmentsResponse}
            initialFilters={{
              search,
              propertyId,
              unitId,
              status: assignmentStatus,
            }}
          />
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <InventoryIssues
            issues={issuesResponse.issues}
            properties={propertiesResponse}
            totalIssues={issuesResponse.totalIssues}
            totalPages={issuesResponse.totalPages}
            hasNext={issuesResponse.hasNext}
            hasPrev={issuesResponse.hasPrev}
            currentPage={page}
            initialFilters={{
              search,
              status: issueStatus,
              issueType,
              propertyId,
            }}
          />
        </TabsContent>

        <TabsContent value="checkout" className="space-y-4">
          <InventortyCheckoutReports
            reports={checkoutReportsResponse.reports}
            hasNext={checkoutReportsResponse.hasNext}
            hasPrev={checkoutReportsResponse.hasPrev}
            totalPages={checkoutReportsResponse.totalPages}
            currentPage={page}
            initialFilters={{ search, sortOrder }}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
