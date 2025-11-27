"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useCreateGuest } from "@/hooks/useGuests";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import z from "zod";

interface GuestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const GuestSchema = z.discriminatedUnion("idType", [
  z.object({
    firstName: z.string().min(3, "At least 3 characters are required."),
    lastName: z.string().min(3, "At least 3 characters are required."),
    email: z.string().email("Please enter a valid email address."),
    phone: z.string().min(10, "At least 10 digits."),
    nationality: z.string().min(1, "Nationality is needed."),
    idType: z.literal("national_id"),
    dateOfBirth: z
      .string()
      .refine(
        (dateString) => new Date(dateString) < new Date(),
        "Date of birth must be in the past."
      ),
    idNumber: z
      .string()
      .min(1, "National ID is needed.")
      .max(8, "At most 8 digits allowed."),
    passportNumber: z.string().optional(),
    notes: z.string().max(1000, "At most 1000 characters allowed.").optional(),
  }),
  z.object({
    firstName: z.string().min(3, "At least 3 characters are required."),
    lastName: z.string().min(3, "At least 3 characters are required."),
    email: z.string().email("Please enter a valid email address."),
    phone: z.string().min(10, "Enter atleast 10 digits."),
    dateOfBirth: z
      .string()
      .refine(
        (dateString) => new Date(dateString) < new Date(),
        "Date of birth must be in the past."
      ),
    nationality: z.string().min(1, "Nationality is needed."),
    idType: z.literal("passport"),
    idNumber: z.string().optional(),
    passportNumber: z.string().min(1, "Passport is needed."),
    notes: z.string().max(1000, "At most 1000 characters allowed.").optional(),
  }),
]);

type NewGuest = z.infer<typeof GuestSchema>;

type GuestIdTypes = Pick<NewGuest, "idType">["idType"];

export function GuestForm({ onCancel, onSuccess: closeModal }: GuestFormProps) {
  // Get the Guest mutation object from create guest hook.
  const createGuestMutation = useCreateGuest();

  // New guest form management
  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "all",
    resolver: zodResolver(GuestSchema),
    defaultValues: {
      idType: "national_id",
    },
  });

  // Watch the id type so that we can control the radio button group
  const idType = watch("idType");

  // Define the submit handler function
  const onSubmit: SubmitHandler<NewGuest> = async (values) => {
    // create the new guest
    await createGuestMutation.mutateAsync(values);

    // reset the form
    reset();

    // close modal
    closeModal();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* First and Last Names */}
      <article className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="First name"
            className={cn(errors.firstName && "border border-red-400")}
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-sm mt-1 text-red-400">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last name"
            className={cn(errors.lastName && "border border-red-400")}
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-sm mt-1 text-red-400">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </article>

      {/* Email and phone */}
      <article className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email address"
            className={cn(errors.email && "border border-red-400")}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm mt-1 text-red-400">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Mobile No.</Label>
          <Input
            id="phone"
            placeholder="Mobile number"
            className={cn(errors.phone && "border border-red-400")}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm mt-1 text-red-400">{errors.phone.message}</p>
          )}
        </div>
      </article>

      {/* ID type and identification */}
      <article>
        <div className="space-y-2 mb-2">
          <Label>Choose ID type</Label>
          <RadioGroup
            value={idType}
            onValueChange={(value: GuestIdTypes) => setValue("idType", value)}
            className="flex"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="national_id" id="national_id_radio_btn" />
              <Label htmlFor="national_id_radio_btn" className="cursor-pointer">
                National ID
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem value="passport" id="passport_radio_btn" />
              <Label htmlFor="passport_radio_btn" className="cursor-pointer">
                Passport Number
              </Label>
            </div>
          </RadioGroup>
        </div>

        {idType === "national_id" ? (
          <>
            <Input
              id="national_id"
              type="text"
              placeholder="National ID"
              className={cn(errors.idNumber && "border border-red-400")}
              {...register("idNumber")}
            />
            {errors.idNumber && (
              <p className="text-sm mt-1 text-red-400">
                {errors.idNumber.message}
              </p>
            )}
          </>
        ) : (
          <>
            <Input
              id="passport"
              type="text"
              placeholder="Passport number"
              className={cn(errors.passportNumber && "border border-red-400")}
              {...register("passportNumber")}
            />
            {errors.passportNumber && (
              <p className="text-sm mt-1 text-red-400">
                {errors.passportNumber.message}
              </p>
            )}
          </>
        )}
      </article>

      {/* Date of Birth and nationality */}
      <article className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            className={cn(errors.dateOfBirth && "border border-red-400")}
            {...register("dateOfBirth")}
          />
          {errors.dateOfBirth && (
            <p className="text-sm mt-1 text-red-400">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            type="text"
            placeholder="Nationality (e.g Kenyan) . . ."
            className={cn(errors.nationality && "border border-red-400")}
            {...register("nationality")}
          />
          {errors.nationality && (
            <p className="text-sm mt-1 text-red-400">
              {errors.nationality.message}
            </p>
          )}
        </div>
      </article>

      {/* Additional notes  */}
      <article className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          rows={4}
          placeholder="Additional notes about the guest"
          className={cn(errors.notes && "border border-red-400")}
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm mt-1 text-red-400">{errors.notes.message}</p>
        )}
      </article>

      {/* Action buttons */}
      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={createGuestMutation.isPending}
          className="bg-chart-1 w-1/3 hover:bg-chart-1/90 cursor-pointer"
        >
          {createGuestMutation.isPending ? "Creating..." : "Create Guest"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            className="bg-chart-5 w-1/4 hover:bg-chart-5/90 cursor-pointer"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
