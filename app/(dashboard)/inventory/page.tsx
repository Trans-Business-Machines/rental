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
  getInventoryItems,
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
    lowStock?: string;
    sortOrder?: "none" | "asc" | "desc";
  }>;
}

/* Fallbacks so a tab that isn't rendered costs nothing to query. */
type ItemsResponse = Awaited<ReturnType<typeof getInventoryItems>>;
type AssignmentsResponse = Awaited<ReturnType<typeof getInventoryAssignments>>;
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

const EMPTY_ITEMS: ItemsResponse = {
  items: [],
  totalPages: 0,
  currentPage: 1,
  hasNext: false,
  hasPrev: false,
};

const EMPTY_ASSIGNMENTS: AssignmentsResponse = {
  assignments: [],
  totalAssignments: 0,
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
  const assignmentStatus = (params.assignmentStatus ||
    "all") as AssignmentFilter;
  const category = params.category || "all";
  const propertyId = params.propertyId || "all";
  const unitId = params.unitId || "all";
  const lowStock = params.lowStock === "true";
  const sortOrder = params.sortOrder || "none";
  const issueStatus = (params.issueStatus || "open") as IssueFilter;
  const issueType = params.issueType || "all";

  // Only the visible tab hits the database.
  const inventoryItemsPromise: Promise<ItemsResponse> =
    tab === "inventory"
      ? getInventoryItems({
          page,
          search,
          status,
          category,
          // Items are property-scoped now, so this filter applies here too.
          propertyId: propertyId !== "all" ? Number(propertyId) : undefined,
          lowStockOnly: lowStock,
        })
      : Promise.resolve(EMPTY_ITEMS);

  const assignmentsPromise: Promise<AssignmentsResponse> =
    tab === "assignments"
      ? getInventoryAssignments({
          page,
          search,
          propertyId,
          unitId,
          status: assignmentStatus,
        })
      : Promise.resolve(EMPTY_ASSIGNMENTS);

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
        {/* {(userRole === "admin" || userRole === "superAdmin") && (
          <Button variant="outline" asChild>
            <Link href="/inventory/reconcile">Reconcile</Link>
          </Button>
        )} */}
      </header>

      {/* Statistics Cards */}
      <div className="flex justify-center px-4">
        <CategoryCarousel stats={categoryStatsResponse} />
      </div>

      {/* Tabs */}
      <Tabs value={tab} className="space-y-2">
        <TabsList className="md:w-xl lg:w-3xl">
          <TabsTrigger value="inventory" className="cursor-pointer" asChild>
            <Link href="/inventory?tab=inventory&page=1">Inventory Items</Link>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="cursor-pointer" asChild>
            <Link href="/inventory?tab=assignments&page=1">Assignments</Link>
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
            items={inventoryItemsResponse.items}
            properties={propertiesResponse}
            totalPages={inventoryItemsResponse.totalPages}
            hasNext={inventoryItemsResponse.hasNext}
            hasPrev={inventoryItemsResponse.hasPrev}
            currentPage={page}
            initialFilters={{
              search,
              status,
              category,
              propertyId,
              lowStock,
            }}
          />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <InventoryAssignments
            assignments={assignmentsResponse.assignments}
            properties={propertiesResponse}
            hasNext={assignmentsResponse.hasNext}
            hasPrev={assignmentsResponse.hasPrev}
            totalAssignments={assignmentsResponse.totalAssignments}
            totalPages={assignmentsResponse.totalPages}
            currentPage={page}
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
