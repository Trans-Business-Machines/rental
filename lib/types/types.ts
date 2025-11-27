import { getBookingById } from "@/lib/actions/bookings";
import { getInventoryItems, getInventoryAssignments } from "@/lib/actions/inventory"
import { getCheckoutReportById } from "@/lib/actions/checkout";
import { getProperties, getPropertyNames } from "@/lib/actions/properties";
import { getGuests } from "@/lib/actions/guests";

/* ---------------- Type Definitions ---------------- */
export type Booking = NonNullable<Awaited<ReturnType<typeof getBookingById>>>
export type CheckoutReport = NonNullable<Awaited<ReturnType<typeof getCheckoutReportById>>>

export type PropertyNames = Awaited<ReturnType<typeof getPropertyNames>>
export type GuestsResponse = Awaited<ReturnType<typeof getGuests>>
export type Guest = GuestsResponse["guests"][number]
export type sortTypes = "none" | "asc" | "desc"

type PropertyResponse = Awaited<ReturnType<typeof getProperties>>
export type Property = PropertyResponse["properties"][number]

type AssignmentResponse = Awaited<ReturnType<typeof getInventoryAssignments>>
export type Assignment = AssignmentResponse["assignments"][number]

type InvetoryItemResponse = Awaited<ReturnType<typeof getInventoryItems>>
export type InventoryItem = InvetoryItemResponse["items"][number]


export type CreateNewGuest = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    idNumber: string;
    nationality: string;
    idType: "national_id";
    passportNumber?: string | undefined;
    notes?: string | undefined;
} | {
    idType: "passport";
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
    idNumber?: string | undefined;
    notes?: string | undefined;
}


/* ---------------- Interface Definitions ---------------- */
export interface BookingsTableAndCardsProps {
    bookings: Booking[];
    setEditBooking: (booking: Booking) => void;
    setIsDialogOpen: (open: boolean) => void;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    banned: boolean;
    banReason?: string;
    banExpires?: string;
    createdAt: string;
    emailVerified: boolean;
}

export interface UsersResponse {
    totalPages: number,
    currentPage: number,
    users: User[],
    hasNext: boolean,
    hasPrev: boolean,
}

export interface UsersTableAndCardsProps {
    users: User[];
    userRoleMutationPending: boolean;
    revokeSessionsMutationPending: boolean;
    unbanUserMutationPending: boolean;
    deleteUserMutationPending: boolean;
    handleSetRole: (userId: string, role: "user" | "admin") => void;
    handleRevokeAllSessions: (userId: string) => void;
    handleUnbanUser: (userId: string) => void;
    handleDeleteUser: (userId: string) => void;
    setSelectedUser: (user: User) => void;
    setBanDialogOpen: (open: boolean) => void


}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
}

export interface BanUserData {
    userId: string;
    reason?: string;
    expiresIn: number;
}

export interface GuestUpdateFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string,
    nationality: string;
    idType: "national_id" | "passport",
    idNumber: string | null;
    passportNumber: string | null;
    notes?: string;
    address?: string;
    city?: string;
    country?: string;
    occupation?: string;
    employer?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    verificationStatus: string;
}

export interface Invitation {
    name: string;
    email: string;
    role: "user" | "admin",
    acceptedAt: string | null;
}

export interface InvitationResponse {
    totalPages: number,
    currentPage: number,
    invitations: Invitation[],
    hasNext: boolean,
    hasPrev: boolean
}

export interface InvitationCardAndTableProps {
    invitations: Invitation[],
    handleResendInvite: (email: string) => void
}

