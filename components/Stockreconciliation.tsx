"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  TriangleAlert,
  Wrench,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { recalculateItemBalance } from "@/lib/actions/inventory";

export interface ReconcileRow {
  id: string;
  itemName: string;
  category: string;
  unitOfMeasure: string;
  property: { id: number; name: string };
  recorded: number;
  expected: number;
  drift: number;
  reconciled: boolean;
  ledgerInvalid: boolean;
}

interface StockReconciliationProps {
  rows: ReconcileRow[];
}

function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

export function StockReconciliation({ rows }: StockReconciliationProps) {
  const [fixingId, setFixingId] = useState<string | null>(null);

  const drifted = rows.filter((r) => !r.reconciled);
  const broken = rows.filter((r) => r.ledgerInvalid);

  const handleFix = async (row: ReconcileRow) => {
    setFixingId(row.id);
    const result = await recalculateItemBalance(row.id);
    setFixingId(null);

    if (!result.success) {
      toast.error(result.message, { description: result.nextStep });
      return;
    }

    toast.success(result.message);
  };

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No active inventory items to reconcile.
        </CardContent>
      </Card>
    );
  }

  if (drifted.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-green-50 p-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="mb-1 font-semibold text-foreground">
            All {rows.length} items reconcile
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Every recorded balance matches the sum of its restocks,
            assignments, issues and usage logs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {broken.length > 0 && (
        <Card className="border-destructive/40">
          <CardContent className="flex gap-3 py-4">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="text-sm">
              <p className="font-medium">
                {broken.length}{" "}
                {broken.length === 1 ? "item has" : "items have"} an impossible
                ledger
              </p>
              <p className="text-muted-foreground">
                Their movements sum to a negative balance, which means a record
                is missing or wrong. Correcting the balance won&apos;t fix
                those — check the item&apos;s history first.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-amber-600" />
            Balances that don&apos;t match their ledger
          </CardTitle>
          <CardDescription>
            {drifted.length} of {rows.length}{" "}
            {rows.length === 1 ? "item" : "items"}. Expected is the sum of
            restocks, less what&apos;s out in units, written off, or used.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>Item</TableHead>
                <TableHead>Property</TableHead>
                <TableHead className="text-right">Recorded</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {drifted.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.ledgerInvalid ? "bg-destructive/5" : undefined}
                >
                  <TableCell>
                    <Link
                      href={`/inventory/${row.id}`}
                      className="font-medium capitalize hover:underline"
                    >
                      {row.itemName}
                    </Link>
                    <div className="text-xs capitalize text-muted-foreground">
                      {row.category.replace(/_/g, " ")}
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {row.property.name}
                  </TableCell>

                  <TableCell className="text-right tabular-nums">
                    {formatQty(row.recorded)}
                    <span className="ml-1 text-xs text-muted-foreground">
                      {row.unitOfMeasure}
                    </span>
                  </TableCell>

                  <TableCell className="text-right tabular-nums">
                    {formatQty(row.expected)}
                    <span className="ml-1 text-xs text-muted-foreground">
                      {row.unitOfMeasure}
                    </span>
                  </TableCell>

                  {/* Positive means the balance claims more stock than the
                      logs account for. */}
                  <TableCell className="text-right tabular-nums">
                    <span
                      className={
                        row.drift > 0
                          ? "font-medium text-amber-600"
                          : "font-medium text-destructive"
                      }
                    >
                      {row.drift > 0 ? "+" : ""}
                      {formatQty(row.drift)}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    {row.ledgerInvalid ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="destructive" className="cursor-default">
                            Needs review
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          The ledger sums to a negative balance. Fix the
                          movement records before correcting.
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleFix(row)}
                        disabled={fixingId !== null}
                      >
                        {fixingId === row.id ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Wrench className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Correct
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}