import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { returnInventoryAssignment } from "@/lib/actions/inventory";
import { toast } from "sonner";
import z from "zod";

interface ReturnNoteDialogProps {
  assignmentId: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
}

const NoteSchema = z.object({
  notes: z.string().max(1000, "Only 1000 characters are allowed!").optional(),
});

type NotesType = z.infer<typeof NoteSchema>;

function ReturnNoteDialog({
  assignmentId,
  children,
  open,
  setOpen,
}: ReturnNoteDialogProps) {
  // form handling using the use form hook from react hook form
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "all",
    resolver: zodResolver(NoteSchema),
  });

  const onSubmit: SubmitHandler<NotesType> = async (value) => {
    const note = value.notes || "Returned via web interface";

    try {
      await returnInventoryAssignment(assignmentId, note);

      toast.success("Item returned successfully");
    } catch (error) {
      console.error("Error returning assignment:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to return item";

      toast.error(errorMessage);
    } finally {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a return note (optional).</DialogTitle>
          <DialogDescription>
            &quot;Returned via web interface&quot; will be used by default.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <label
              htmlFor="notes"
              className="text-sm font-semibold text-muted-foreground mb-2"
            >
              Notes
            </label>
            <Textarea
              id="notes"
              placeholder="Type your assignment notes here..."
              className={cn(errors.notes && "border border-red-400")}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-sm text-red-400 mt-1">
                {errors.notes.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <Button type="submit" disabled={isSubmitting} className="px-6">
              {isSubmitting ? "Returning..." : "Return Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ReturnNoteDialog };
