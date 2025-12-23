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
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  userInvitationSchema,
  type UserInvitationType,
} from "@/lib/schemas/invitations";
import { authClient } from "@/lib/auth-client";

interface InviteUserDialogProps {
  children: React.ReactNode;
}

function InviteUserDialog({ children }: InviteUserDialogProps) {
  // Define state to control the dialog open state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Get hold of the currently logged in user session
  const { data: session, error, isPending, refetch } = authClient.useSession();

  // React hook form management.
  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserInvitationType>({
    mode: "all",
    resolver: zodResolver(userInvitationSchema),
    defaultValues: {
      role: "user",
      invitedById: session?.user.id || "",
    },
  });

  // Show a loading state
  if (isPending) {
    <div className="flex flex-col gap-4">
      <div className="h-6 w-full animate-pulse rounded-lg" />
      <div className="h-12 w-full animate-pulse rounded-lg" />
      <div className="h-12 w-full animate-pulse rounded-lg" />
      <div className="h-12 w-full animate-pulse rounded-lg" />
    </div>;
  }

  if (error && error.message) {
    return (
      <div className="bg-red-50 p-10">
        <p className="text-sm md:text-base text-red-400 font-semibold">
          {error.message}
        </p>
        <Button size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  // watch the role value to control the select component
  const selectedRole = watch("role");

  const onSubmit: SubmitHandler<UserInvitationType> = async (values) => {
    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Invite failed!");
      }

      const result = await response.json();

      if (!result.success) {
        console.log(result);
        throw new Error("Invite failed, try again!");
      }

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
