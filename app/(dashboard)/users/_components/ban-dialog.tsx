import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBanUser } from "@/hooks/useUsers";
import { Loader } from "lucide-react";
import type { User } from "@/lib/types/types";

interface BanDialogProps {
  banDialogOpen: boolean;
  selectedUser: User | null;
  setBanDialogOpen: (open: boolean) => void;
  setSelectedUser: (user: User | null) => void;
}

function BanDialog({
  banDialogOpen,
  setBanDialogOpen,
  selectedUser,
  setSelectedUser,
}: BanDialogProps) {
  const banUserMutation = useBanUser();

  // Ban form state
  const [banForm, setBanForm] = useState({
    reason: "",
    expiresIn: "7", // days
  });

  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const expiresIn = parseInt(banForm.expiresIn) * 24 * 60 * 60; // Convert days to seconds

    banUserMutation.mutate(
      {
        userId: selectedUser.id,
        reason: banForm.reason || undefined,
        expiresIn,
      },
      {
        onSuccess: () => {
          setBanDialogOpen(false);
          setBanForm({ reason: "", expiresIn: "7" });
          setSelectedUser(null);
        },
      }
    );
  };

  return (
    <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Ban {selectedUser?.name} from accessing the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleBanUser} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Ban Reason (Optional)</Label>
            <Input
              id="reason"
              value={banForm.reason}
              onChange={(e) =>
                setBanForm((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="Enter reason for ban..."
              disabled={banUserMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresIn">Ban Duration</Label>
            <Select
              value={banForm.expiresIn}
              onValueChange={(value) =>
                setBanForm((prev) => ({ ...prev, expiresIn: value }))
              }
              disabled={banUserMutation.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBanDialogOpen(false)}
              disabled={banUserMutation.isPending}
               className="w-1/3 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={banUserMutation.isPending}
              className="w-1/3 cursor-pointer"
            >
              {banUserMutation.isPending ? (
                <span className="flex items-center gap-2">
                  {" "}
                  <Loader className="animate-spin" /> Banning user
                </span>
              ) : (
                "Ban User"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { BanDialog };
