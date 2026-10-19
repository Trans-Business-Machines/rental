"use client";

import { InventoryAssignmentDialog } from "@/components/InventoryAssignmentDialog";
import { InventoryEditDialog } from "@/components/InventoryEditDialog";
import { RestockDialog } from "@/components/RestockDialog";
import { ReportIssueDialog } from "@/components/Reportissuedialog";
import { LogUsageDialog } from "@/components/Logusagedialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Droplets,
  Edit,
  Eye,
  MoreVertical,
  PackagePlus,
  Plus,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { InventoryItem } from "@/lib/types/types";

type ActionDialog = "edit" | "restock" | "assign" | "issue" | "usage" | null;

interface InventoryActionsProps {
  item: InventoryItem;
}

export function InventoryActions({ item }: InventoryActionsProps) {
  const [openDialog, setOpenDialog] = useState<ActionDialog>(null);

  const dialogProps = (name: Exclude<ActionDialog, null>) => ({
    open: openDialog === name,
    onOpenChange: (open: boolean) => setOpenDialog(open ? name : null),
  });

  const itemClassName = "cursor-pointer hover:bg-primary/30 focus:bg-primary/30";

  return (
    <>
      {/* Non-modal so closing the menu doesn't fight the dialog it opens
          over pointer-events on <body>. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer data-[state=open]:bg-accent"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Actions for {item.itemName}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild className={itemClassName}>
            <Link href={`/inventory/${item.id}`}>
              <Eye className="mr-2 size-4" />
              View history
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setOpenDialog("edit")}
            className={itemClassName}
          >
            <Edit className="mr-2 size-4" />
            Edit item
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setOpenDialog("restock")}
            className={itemClassName}
          >
            <PackagePlus
              className={`mr-2 size-4 ${item.needsRestock ? "text-amber-600" : ""}`}
            />
            Record stock received
          </DropdownMenuItem>

          {/* Which actions apply is decided by category, same as the server */}
          {item.rules.canAssign && item.availableQuantity > 0 && (
            <DropdownMenuItem
              onSelect={() => setOpenDialog("assign")}
              className={itemClassName}
            >
              <Plus className="mr-2 size-4" />
              Assign to unit
            </DropdownMenuItem>
          )}

          {item.rules.canReportIssue && (
            <DropdownMenuItem
              onSelect={() => setOpenDialog("issue")}
              className={itemClassName}
            >
              <TriangleAlert className="mr-2 size-4" />
              Report issue
            </DropdownMenuItem>
          )}

          {item.rules.canLogUsage && (
            <DropdownMenuItem
              onSelect={() => setOpenDialog("usage")}
              className={itemClassName}
            >
              <Droplets className="mr-2 size-4" />
              Log usage
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <InventoryEditDialog item={item} {...dialogProps("edit")} />
      <RestockDialog item={item} {...dialogProps("restock")} />

      {item.rules.canAssign && (
        <InventoryAssignmentDialog
          preselectedItemId={item.id}
          preselectedPropertyId={item.propertyId}
          {...dialogProps("assign")}
        />
      )}

      {item.rules.canReportIssue && (
        <ReportIssueDialog
          item={item}
          assignments={item.assignments}
          {...dialogProps("issue")}
        />
      )}

      {item.rules.canLogUsage && (
        <LogUsageDialog item={item} {...dialogProps("usage")} />
      )}
    </>
  );
}
