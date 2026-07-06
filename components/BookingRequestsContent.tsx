"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/Pagination";
import { CancelRequestDialog } from "@/components/CancelRequestDialog";
import { DebouncedSearch } from "@/components/DebouncedSearch";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Ban,
  Loader2,
  FileText,
  Calendar,
} from "lucide-react";
import {
  useBookingRequests,
  useCancelBookingRequest,
} from "@/hooks/useBookingRequests";
import { formatPrice, cn, maskPhone, maskEmail } from "@/lib/utils";
import { format } from "date-fns";
import type {
  BookingRequestStatus,
  BookingRequestListItem,
  Role,
} from "@/lib/types/types";

export function BookingRequestsContent({ userRole }: { userRole: Role }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BookingRequestStatus | "all">("all");
  const [search, setSearch] = useState("");

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<BookingRequestListItem | null>(null);

  const isAgent = userRole === "agent";
  const canApproveReject = ["user", "admin", "superAdmin"].includes(userRole);

  const cancelMutation = useCancelBookingRequest();

  const { data, isLoading, error, refetch } = useBookingRequests({
    page,
    status: status === "all" ? undefined : status,
    search: search || undefined,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as BookingRequestStatus | "all");
    setPage(1);
  };

  const openCancelDialog = (request: BookingRequestListItem) => {
    setSelectedRequest(request);
    setCancelDialogOpen(true);
  };

  if (isLoading) {
    return (
      <section className="min-h-[50vh] grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading booking requests...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-[50vh] grid place-items-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">
            Failed to load booking requests
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  const requests = data?.bookingRequests || [];
  const totalPages = data?.pagination.totalPages || 1;

  return (
    <section className="space-y-3">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center my-3">
        <DebouncedSearch
          value={search}
          onSearch={handleSearch}
          placeholder="Search by guest name, email, or phone..."
          debounceMs={500}
          className="flex-1 md:max-w-xl"
        />

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {requests.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <FileText className="size-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No booking requests found
          </h3>
          <p className="text-muted-foreground mb-4">
            {search
              ? "No results match your search criteria."
              : isAgent
                ? "You haven't submitted any booking requests yet."
                : "There are no booking requests to review."}
          </p>
          {isAgent && !search && (
            <Button asChild>
              <Link href="/booking-requests/new">
                <Plus className="size-4 mr-2" />
                Create Your First Request
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 py-2 hover:bg-muted/50">
                  <TableHead className="font-semibold">Guest</TableHead>
                  <TableHead className="font-semibold">Property</TableHead>
                  <TableHead className="font-semibold">Phone</TableHead>
                  <TableHead className="font-semibold">Check-in</TableHead>
                  <TableHead className="font-semibold">Total</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  {!isAgent && (
                    <TableHead className="font-semibold">
                      Requested By
                    </TableHead>
                  )}
                  <TableHead className="font-semibold text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const status = request.status;
                  const isPending = request.status === "pending";
                  const guest = request.guest;

                  return (
                    <TableRow key={request.id}>
                      {/* Guest */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">
                              {guest.firstName} {guest.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {maskEmail(guest.email, userRole)}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Property / Unit */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">
                              {request.property.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {request.unit.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="text-night">
                        {maskPhone(guest.phone, userRole)}
                      </TableCell>

                      {/* Check-in */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-muted-foreground" />
                          <span>
                            {format(request.checkInDate, "dd/MM/yyyy")}
                          </span>
                        </div>
                      </TableCell>

                      {/* Total */}
                      <TableCell className="font-medium">
                        {formatPrice(request.totalAmount)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          className={cn(
                            "capitalize border py-1",
                            status === "pending" &&
                              "border-princeton-orange bg-princeton-orange/10 text-princeton-orange",
                            status === "cancelled" &&
                              "border-lipstick-red bg-lipstick-red/10 text-lipstick-red",
                            status === "rejected" &&
                              "border-red-500 bg-red-500/10 text-red-500",
                            status === "approved" &&
                              "border-medium-jungle bg-medium-jungle/10 text-medium-jungle",
                          )}
                        >
                          {status}
                        </Badge>
                      </TableCell>

                      {/* Requested By (only for non-agents) */}
                      {!isAgent && (
                        <TableCell>
                          <p className="text-sm">{request.requestedBy.name}</p>
                        </TableCell>
                      )}

                      {/* Actions */}
                      <TableCell className="text-center">
                        {canApproveReject ? (
                          <Button
                            size="lg"
                            variant="ghost"
                            className="group gap-2 cursor-pointer"
                            onClick={() =>
                              router.push(`/booking-requests/${request.id}`)
                            }
                          >
                            <Eye className="size-4 group-hover:text-azure" />
                            <span className="group-hover:text-azure">
                              View Details
                            </span>
                          </Button>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              className="cursor-pointer"
                            >
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal
                                  className={cn(
                                    "size-4 rotate-90",
                                    request.status === "pending" &&
                                      "text-princeton-orange",
                                  )}
                                />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/booking-requests/${request.id}`)
                                }
                              >
                                <Eye className="size-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {isAgent && isPending && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => openCancelDialog(request)}
                                    className="text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 group"
                                  >
                                    <Ban className="size-4 mr-2 group-hover:text-destructive" />
                                    Cancel Request
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              handlePageChange={setPage}
              hasNext={data?.pagination.hasNext ?? false}
              hasPrev={data?.pagination.hasPrev ?? false}
            />
          )}
        </>
      )}

      {/* Cancel Dialog */}
      {selectedRequest && (
        <CancelRequestDialog
          requestId={selectedRequest.id}
          open={cancelDialogOpen}
          onOpenChange={(open) => {
            if (!cancelMutation.isPending) {
              setCancelDialogOpen(open);
              if (!open) setSelectedRequest(null);
            }
          }}
          mutation={cancelMutation}
        />
      )}
    </section>
  );
}