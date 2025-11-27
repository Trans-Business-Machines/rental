"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { updateUnitStatus } from "@/lib/actions/dashboard";
import type { Unit } from "./unit-availability-table";
import { toast } from "sonner";

interface UnitEditDialogProps {
  unit: Unit;
  children: React.ReactNode;
}

export function UnitEditDialog({ unit, children }: UnitEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [rent, setRent] = useState(unit.rent.toString());

  const handleSave = async () => {
    const sanitizedValues = {
      rent: Number(rent),
    };

    const unitId = unit.id;

    const result = await updateUnitStatus(unitId, sanitizedValues);

    if (result) {
      toast.success(`${unit.name} updated successfully.`);
    } else {
      toast.error(`Update failed, try again!`);
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Unit - {unit.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Unit ID</Label>
              <Input value={unit.name} disabled className="bg-muted" />
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <Input value={unit.type} disabled className="bg-muted" />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Property</Label>
            <Input value={unit.property} disabled className="bg-muted" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Input value={unit.status} disabled className="bg-muted" />
            </div>
            <div>
              <Label className="text-sm font-medium">Monthly Rent ($)</Label>
              <Input
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1 cursor-pointer">
              Save Changes
            </Button>
            <Button
              onClick={() => setOpen(false)}
              className="flex-1 bg-chart-5 hover:bg-chart-5/90 cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
