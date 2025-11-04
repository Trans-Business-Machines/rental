import { getBookings } from "@/lib/actions/bookings";
import { getInventoryItems, getInventoryAssignments } from "@/lib/actions/inventory"
import { getCheckoutReports } from "@/lib/actions/checkout";
import { getProperties, getAllPropertiesWithUnits } from "@/lib/actions/properties";

/* ---------------- Type Definitions ---------------- */
export type Booking = Awaited<ReturnType<typeof getBookings>>[number]
export type InvetoryItem = Awaited<ReturnType<typeof getInventoryItems>>[number]
export type CheckoutReport = Awaited<ReturnType<typeof getCheckoutReports>>[number]
export type Property = Awaited<ReturnType<typeof getProperties>>[number]
export type PropertyWithUnits = Awaited<ReturnType<typeof getAllPropertiesWithUnits>>[number]
export type Assignment = Awaited<ReturnType<typeof getInventoryAssignments>>[number]
export type sortTypes = "none" | "asc" | "desc"

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

export interface Guest {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality?: string | null;
    idType?: string | null;
    idNumber?: string | null;
    passportNumber?: string | null;
    dateOfBirth?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    occupation?: string | null;
    employer?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactRelation?: string | null;
    notes?: string | null;
    verificationStatus?: string | null;
    blacklisted?: boolean | null;
    totalStays?: number | null;
    totalNights?: number | null;
    totalSpent?: number | null;
    lastStay?: Date | null;
    rating?: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface CreateGuestData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idNumber?: string;
    passportNumber?: string;
    notes?: string;
}

export interface Invitation {
    name: string;
    email: string;
    acceptedAt: string | null;
}

export interface Invitation {
    name: string;
    email: string;
    role: "user" | "admin",
    acceptedAt: string | null;
}

export interface InvitationCardAndTableProps {
    invitations: Invitation[],
    handleResendInvite: (email: string) => void
}