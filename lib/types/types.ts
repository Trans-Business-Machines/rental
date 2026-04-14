import { getBookingById, } from "@/lib/actions/bookings";
import { getInventoryItems, getInventoryAssignments } from "@/lib/actions/inventory"
import { getCheckoutReportById, getBookingsForCheckout, getInventoryAssignmentsForUnit } from "@/lib/actions/checkout";
import { getProperties, getPropertyNames, getPropertyById } from "@/lib/actions/properties";
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

export type UniqueProperty = NonNullable<Awaited<ReturnType<typeof getPropertyById>>>["property"]
export type PropertyPricings = NonNullable<Awaited<ReturnType<typeof getPropertyById>>>["pricings"]

type AssignmentResponse = Awaited<ReturnType<typeof getInventoryAssignments>>
export type Assignment = AssignmentResponse["assignments"][number]

type InvetoryItemResponse = Awaited<ReturnType<typeof getInventoryItems>>
export type InventoryItem = InvetoryItemResponse["items"][number]

export type BookingsForCheckout = NonNullable<Awaited<ReturnType<typeof getBookingsForCheckout>>>
export type InventoryAssignmentForUnit = NonNullable<Awaited<ReturnType<typeof getInventoryAssignmentsForUnit>>>
export type UnitTypePricing = NonNullable<Awaited<ReturnType<typeof getUnitPricingOptions>>>[number]

export type BookingStatus = "pending" | "reserved" | "checked_in" | "checked_out" | "cancelled"
export type UnitStatus = "booked" | "reserved" | "maintenance" | "available" | "occupied"
export type PriceDuration = "one_night" | "weekly" | "monthly" | "custom"

export type BadgeVariant = "dashboard" | "listing" | "details";

export type Role = "user" | "admin" | "superAdmin" | "agent"
export type VerificationStatus = "pending" | "verified" | "rejected"


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
    registeredBy?: string;
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
    registeredBy?: string;
}

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


/* ---------------- Interface Definitions ---------------- */
export interface BookingsTableAndCardsProps {
    bookings: Booking[];
    isAgent: boolean;
    handleClick: (bookingId: number) => void;
    setEditBooking: (booking: Booking) => void;
    setIsDialogOpen: (open: boolean) => void;
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
    pricingOptions: UnitTypePricing[]
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

type IdType = "national_id" | "passport"

export interface GuestUpdateFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string,
    nationality: string;
    idType: IdType,
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
    verificationStatus: VerificationStatus;
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
    priceDuration: PriceDuration;
    unitPrice: number;
    period: number;
    discountRate?: number | null;
    totalAmount: number;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfGuests: number;
    source: string;
    purpose: string;
    paymentCode: string;
    paymentMethod: string;
    specialRequests?: string;
    status: BookingStatus;
}

export interface GetBookingsParams {
    page?: number;
    search?: string;
    status?: string;
    propertyId?: string;
}

export interface UpdatedBookingData {
    checkInDate?: Date;
    checkOutDate?: Date;
    numberOfGuests?: number;
    totalAmount?: number;
    paymentMethod?: string;
    source?: string;
    purpose?: string;
    specialRequests?: string;
    status: BookingStatus;
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

export interface CreatePricingParams {
    unitType: string;
    duration: PriceDuration;
    price: number;
    nights?: number | null;
    fromDate?: Date | null;
    toDate?: Date | null;
    discountRate?: number | null;
    isActive?: boolean;
}

export interface UpdatePricingParams {
    id: number;
    unitType?: string;
    duration?: PriceDuration;
    price?: number;
    nights?: number | null;
    fromDate?: Date | null;
    toDate?: Date | null;
    discountRate?: number | null;
    isActive?: boolean;
}

export type UnitProperty = UnitDetailsResponse["property"];

export type UnitMedia = UnitDetailsResponse["media"][number];

export type UnitBooking = UnitDetailsResponse["bookings"][number];


export interface GetBookingRequestsParams {
    page?: number;
    status?: "pending" | "approved" | "rejected" | "cancelled";
    search?: string;
}

export interface UpdateBookingRequestParams {
    id: number;

    // Guest Details (all optional for partial updates)
    guestFirstName?: string;
    guestLastName?: string;
    guestEmail?: string;
    guestPhone?: string;
    guestDateOfBirth?: string;
    guestNationality?: string;
    guestIdType?: IdType;
    guestIdNumber?: string | null;
    guestPassportNumber?: string | null;
    guestNotes?: string | null;

    // ID Document (optional - only if replacing)
    idDocumentFilename?: string;
    idDocumentOriginalName?: string;
    idDocumentMimeType?: string;
    idDocumentFileSize?: number;

    // Booking Details
    propertyId?: number;
    unitId?: number;
    checkInDate?: Date;
    checkOutDate?: Date;
    numberOfGuests?: number;
    priceDuration?: PriceDuration;
    unitPrice?: number;
    period?: number;
    discountRate?: number | null;
    totalAmount?: number;
    purpose?: string | null;
    specialRequests?: string | null;
}

export interface CreateBookingRequestParams {
    // Guest type
    guestType: "existing" | "new";

    // For existing guest
    existingGuestId?: number;

    // For new guest (optional when guestType is "existing")
    guestFirstName?: string;
    guestLastName?: string;
    guestEmail?: string;
    guestPhone?: string;
    guestDateOfBirth?: string; // Changed from Date to string
    guestNationality?: string;
    guestIdType?: "national_id" | "passport";
    guestIdNumber?: string | null;
    guestPassportNumber?: string | null;
    guestNotes?: string | null;
    idDocumentFilename?: string;
    idDocumentOriginalName?: string;
    idDocumentMimeType?: string;
    idDocumentFileSize?: number;
    idDocumentUrl?: string;

    // Booking details (always required)
    propertyId: number;
    unitId: number;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfGuests: number;
    priceDuration: string;
    unitPrice: number;
    period: number;
    discountRate?: number | null;
    totalAmount: number;
    paymentMethod: string;
    paymentCode: string;
    purpose?: string | null;
    specialRequests?: string | null;
}

export interface ApproveMediaData {
    mediaUrl: string;
    mediaFilename: string;
    mediaOriginalName: string;
    mediaMimeType: string;
    mediaSize: number;
}

export interface NotifyAgentApprovedParams {
    agentEmail: string;
    agentName: string;
    guestName: string;
    propertyName: string;
    unitName: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfGuests: number;
    totalAmount: number;
    bookingId: number;
}

export interface NotifyAgentRejectedParams {
    agentEmail: string;
    agentName: string;
    guestName: string;
    propertyName: string;
    unitName: string;
    checkInDate: Date;
    checkOutDate: Date;
    rejectionReason: string;
}

export type BookingRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface BookingRequestListItem {
    id: number;
    // For existing guests
    existingGuestId: number | null;
    existingGuest: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    } | null;
    // For new guests (optional when existingGuestId is set)
    guestFirstName: string | null;
    guestLastName: string | null;
    guestEmail: string | null;
    guestPhone: string | null;
    status: BookingRequestStatus;
    checkInDate: Date;
    checkOutDate: Date;
    totalAmount: number;
    createdAt: Date;
    // ID document fields (optional - only for new guests)
    idDocumentFilename: string | null;
    idDocumentOriginalName: string | null;
    idDocumentMimeType: string | null;
    idDocumentFileSize: number | null;
    idDocumentUrl: string | null;
    property: {
        id: number;
        name: string;
    };
    unit: {
        id: number;
        name: string;
    };
    requestedBy: {
        id: string;
        name: string;
    };
}

export interface NotifyAdminsOfBookingRequestParams {
    requestId: number;
    guestFirstName: string;
    guestLastName: string;
    guestEmail: string;
    guestPhone: string;
    propertyName: string;
    unitName: string;
    checkInDate: Date;
    checkOutDate: Date;
    priceDuration: string;
    period: number;
    totalAmount: number;
    requestedByName: string;
}

export interface GuestSearchResult {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    activeBookingStatus: "pending" | "reserved" | "checked_in" | null;
    activeBookingUnit: string | null;
}