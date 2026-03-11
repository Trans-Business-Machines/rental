import { getBookingById } from "@/lib/actions/bookings";
import { getInventoryItems, getInventoryAssignments } from "@/lib/actions/inventory"
import { getCheckoutReportById, getBookingsForCheckout, getInventoryAssignmentsForUnit } from "@/lib/actions/checkout";
import { getProperties, getPropertyNames, getCachedProperty } from "@/lib/actions/properties";
import { getGuests, } from "@/lib/actions/guests";
import { getUnitPricingOptions } from "@/lib/actions/pricing"

/* ---------------- Type Definitions ---------------- */
export type Booking = NonNullable<Awaited<ReturnType<typeof getBookingById>>>
export type CheckoutReport = NonNullable<Awaited<ReturnType<typeof getCheckoutReportById>>>

export type PropertyNames = Awaited<ReturnType<typeof getPropertyNames>>
export type GuestsResponse = Awaited<ReturnType<typeof getGuests>>
export type Guest = GuestsResponse["guests"][number]
export type sortTypes = "none" | "asc" | "desc"

type PropertyResponse = Awaited<ReturnType<typeof getProperties>>
export type Property = PropertyResponse["properties"][number]
export type Media = Property["media"][number]

export type UniqueProperty = NonNullable<Awaited<ReturnType<typeof getCachedProperty>>>["property"]
export type PropertyPricings = NonNullable<Awaited<ReturnType<typeof getCachedProperty>>>["pricings"]

type AssignmentResponse = Awaited<ReturnType<typeof getInventoryAssignments>>
export type Assignment = AssignmentResponse["assignments"][number]

type InvetoryItemResponse = Awaited<ReturnType<typeof getInventoryItems>>
export type InventoryItem = InvetoryItemResponse["items"][number]

export type BookingsForCheckout = NonNullable<Awaited<ReturnType<typeof getBookingsForCheckout>>>
export type InventoryAssignmentForUnit = NonNullable<Awaited<ReturnType<typeof getInventoryAssignmentsForUnit>>>
export type UnitTypePricing = NonNullable<Awaited<ReturnType<typeof getUnitPricingOptions>>>[number]

interface IdDocumentData {
    filename: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    filePath: string;
}

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
    idDocument?: IdDocumentData;
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
    idDocument?: IdDocumentData;
}

export type BookingStatus = "pending" | "reserved" | "checked_in" | "checked_out" | "cancelled"
export type UnitStatus = "booked" | "reserved" | "maintenance" | "available" | "occupied"
export type PriceDuration = "one_night" | "weekly"

export type BadgeVariant =
    | "dashboard"
    | "listing"
    | "details";

export type Role = "user" | "admin" | "superAdmin"

/* ---------------- Interface Definitions ---------------- */
export interface BookingsTableAndCardsProps {
    bookings: Booking[];
    handleClick: (bookingId: number) => void;
    setEditBooking: (booking: Booking) => void;
    setIsDialogOpen: (open: boolean) => void;
}

export interface UpdatePricingParams {
    id: number;
    duration: PriceDuration;
    price: number;
    nights: number;
}


export interface GuestsTableAndCardsProps {
    guests: Guest[];
    isArchivePending: boolean,
    setIsDialogOpen: (open: boolean) => void;
    setEditGuest: (guest: Guest) => void;
    handleClick: (guestId: number) => void
}

interface UnitPricingOptions {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    unitType: string;
    duration: PriceDuration,
    price: number;
    nights: number;
}

export interface Unit {
    name: string;
    id: number;
    createdAt: Date;
    updatedAt: Date;
    propertyId: number;
    type: string;
    status: UnitStatus;
    bedrooms: number;
    bathrooms: number | null
    maxGuests: number | null;
    property: {
        name: string;
        id: number;
    },
    media: Media[],
    pricingOptions: UnitPricingOptions[]
}

export interface User {
    name: string;
    id: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: string;
    banned: boolean;
    banReason: string | null;
    banExpires: Date | null;
    createdAt: Date;
    updatedAt: Date;
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
    unbanUserMutationPending: boolean;
    handleUnBanUserClick: (userId: string) => void;
    handleClick: ({ userId, role }: { userId: string, role: Role }) => void;
    setSelectedUser: (user: User) => void;
    setBanDialogOpen: (open: boolean) => void
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role: Role;
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
    role: Role,
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
    resendEmail: string,
    isResendPending: boolean,
    setResendEmail: (email: string) => void,
    handleResendInvite: (email: string) => Promise<void>
}

export interface CreateBookingData {
    guestId: number;
    propertyId: number;
    unitId: number;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfGuests: number;
    totalAmount: number;
    unitPrice: number;
    source: string;
    purpose: string;
    paymentMethod: string;
    status: BookingStatus
    specialRequests?: string;

}

export type UnitDetailsResponse = {
    id: number;
    name: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    status: UnitStatus;
    propertyId: number;
    createdAt: Date;
    updatedAt: Date;
    pricingOptions: UnitPricingOptions[],
    property: {
        id: number;
        name: string;
    };
    media: Array<{
        id: string;
        filename: string;
        filePath: string;
        originalName: string;
    }>;
    bookings: Array<{
        id: number;
        checkInDate: Date;
        checkOutDate: Date;
        status: string;
        guest: {
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
        };
    }>;
};

export type UnitProperty = UnitDetailsResponse["property"];

export type UnitMedia = UnitDetailsResponse["media"][number];

export type UnitBooking = UnitDetailsResponse["bookings"][number];

export type GroupedAssigments = {
    inventoryItemId: number;
    itemName: string;
    category: string;
    quantity: number;
}[];

export type CategoryItemStats = {
    category: string;
    totalItems: number;
    assigned: number;
    available: number;
}[]


