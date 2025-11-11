import React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

interface InviteUserDialogProps {
  children: React.ReactNode;
}

const userRoleSchema = z.object({
  name: z.string().min(3, "Name should have at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(["user", "admin"], {
    required_error: "Please select a role.",
    invalid_type_error: "Role must either be an admin or user.",
  }),
});

type UserRoleFields = z.infer<typeof userRoleSchema>;

function InviteUserDialog({ children }: InviteUserDialogProps) {
  // Define state to control the dialog open state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // React hook form management.
  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserRoleFields>({
    mode: "all",
    resolver: zodResolver(userRoleSchema),
    defaultValues: {
      role: "user",
    },
  });

  // watch the role value to control the select component
  const selectedRole = watch("role");

  const onSubmit: SubmitHandler<UserRoleFields> = async (values) => {
    try {
      await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      // Reset from and show toast upon successfull invitation
      reset();
      setInviteDialogOpen(false);
      toast.success("Invite sent successfully.");
    } catch (err: any) {
      toast.error(err.message);

      // Optionally show error
      console.error(err);
    }
  };

  return (
    <div className="flex space-x-2">
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Create a new user account with the specified role.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            {/* Name input */}
            <div>
              <Label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </Label>
              <Input
                id="name"
                type="text"
                className={cn(
                  "w-full border rounded",
                  errors.name && "border-red-400"
                )}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-400 ml-2">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email input */}
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className={cn(
                  "w-full border rounded",
                  errors.email && "border-red-400"
                )}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-400 ml-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Role Input */}
            <div>
              <Label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Role
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(value: "user" | "admin") =>
                  setValue("role", value, { shouldValidate: true })
                }
              >
                <SelectTrigger
                  className={cn(
                    "w-full rounded-sm",
                    errors.role && "border-red-400"
                  )}
                >
                  <SelectValue
                    className="px-3 py-2"
                    placeholder="please select a role."
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="ml-2 mt-1 text-sm text-red-400">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-2 pt-3">
              <Button
                type="button"
                variant="default"
                className="bg-chart-5 hover:bg-chart-5/90 px-3 cursor-pointer"
                onClick={() => {
                  reset();
                  setInviteDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
                className="bg-chart-1 hover:bg-chart-1/90 px-5 cursor-pointer"
              >
                {isSubmitting ? "Inviting user..." : " Invite User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { InviteUserDialog };
