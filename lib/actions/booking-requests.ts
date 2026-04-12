"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/check-permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation"
import { LIMIT } from "@/lib/utils";
import { NewBookingRequestEmail } from "@/lib/emails/NewBookingRequestEmail";
import { formatPrice, formatDate, calculateTotalNights, formatDateInTimezone } from "@/lib/utils";
import resend from "@/lib/emailClient"
import { BookingRequestApprovedEmail } from "@/lib/emails/BookingApprovedEmail"
import { BookingRequestRejectedEmail } from "@/lib/emails/BookingRejectedEmail"
import type {
    GetBookingRequestsParams,
    UpdateBookingRequestParams,
    Role,
    PriceDuration,
    NotifyAdminsOfBookingRequestParams,
    CreateBookingRequestParams,
    ApproveMediaData,
    NotifyAgentApprovedParams,
    NotifyAgentRejectedParams
} from "@/lib/types/types";

// ----------------- SEND EMAIL FUNCTIONS -----------------
export async function notifyAdminsOfNewBookingRequest({
    requestId,
    guestFirstName,
    guestLastName,
    guestEmail,
    guestPhone,
    propertyName,
    unitName,
    checkInDate,
    checkOutDate,
    priceDuration,
    period,
    totalAmount,
    requestedByName,
}: NotifyAdminsOfBookingRequestParams) {
    try {
        // Get admins to notify
        const admins = await prisma.user.findMany({
            where: {
                role: {
                    in: ["admin"],
                },
                banned: false,
            },
            select: {
                name: true,
                email: true,
            },
            take: 40,
        });

        if (admins.length === 0) {
            console.log("No admins found to notify of booking request");
            return { success: true, notified: 0 };
        }

        // Build the request URL
        const requestUrl = `${process.env.NEXT_PUBLIC_APP_URL}/booking-requests/${requestId}`;

        // Calculate total nights
        const totalNights = calculateTotalNights(
            priceDuration as PriceDuration,
            period
        );

        // Format dates and amount
        const formattedCheckIn = formatDate(checkInDate);
        const formattedCheckOut = formatDate(checkOutDate);
        const formattedAmount = formatPrice(totalAmount);
        const guestName = `${guestFirstName} ${guestLastName}`;

        // Create email promises
        const emailPromises = admins.map((admin) => {
            return resend.emails.send({
                from:
                    process.env.EMAIL_FROM ||
                    "Rentals Manager <noreply@rentalsmanager.app>",
                to: admin.email,
                subject: `New Booking Request - ${guestName} at ${propertyName}`,
                react: NewBookingRequestEmail({
                    adminName: admin.name,
                    guestName,
                    guestEmail,
                    guestPhone,
                    propertyName,
                    unitName,
                    checkInDate: formattedCheckIn,
                    checkOutDate: formattedCheckOut,
                    totalNights,
                    totalAmount: formattedAmount,
                    requestedBy: requestedByName,
                    requestUrl,
                }),
            });
        });

        // Execute the promises
        const results = await Promise.allSettled(emailPromises);

        // Get the success count
        const successCount = results.filter(
            (result) => result.status === "fulfilled"
        ).length;

        // Log emails that failed
        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(
                    `Failed to notify admin ${admins[index].email} of booking request:`,
                    result.reason
                );
            }
        });

        return { success: true, notified: successCount };
    } catch (error) {
        console.error("Error notifying admins of booking request:", error);
        return { success: false, notified: 0 };
    }
}

export async function notifyAgentOfApproval({
    agentEmail,
    agentName,
    guestName,
    propertyName,
    unitName,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    totalAmount,
    bookingId,
}: NotifyAgentApprovedParams) {
    try {
        const { error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || "Rentals Manager <noreply@rentalsmanager.app>",
            to: agentEmail,
            subject: `Booking Approved - ${guestName} at ${propertyName}`,
            react: BookingRequestApprovedEmail({
                agentName,
                guestName,
                propertyName,
                unitName,
                checkInDate: formatDateInTimezone(checkInDate),
                checkOutDate: formatDateInTimezone(checkOutDate),
                numberOfGuests,
                totalAmount: formatPrice(totalAmount),
                bookingId,
            }),
        });

        if (error) {
            console.error("Failed to send approval email:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Error sending approval email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export async function notifyAgentOfRejection({
    agentEmail,
    agentName,
    guestName,
    propertyName,
    unitName,
    checkInDate,
    checkOutDate,
    rejectionReason,
}: NotifyAgentRejectedParams) {
    try {
        const { error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || "Rentals Manager <noreply@rentalsmanager.app>",
            to: agentEmail,
            subject: `Booking Request Rejected - ${guestName} at ${propertyName}`,
            react: BookingRequestRejectedEmail({
                agentName,
                guestName,
                propertyName,
                unitName,
                checkInDate: formatDateInTimezone(checkInDate),
                checkOutDate: formatDateInTimezone(checkOutDate),
                rejectionReason,
            }),
        });

        if (error) {
            console.error("Failed to send rejection email:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Error sending rejection email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// ----------------- BOOKING REQUESTS FUNCTIONS -----------------
export async function createBookingRequest(data: CreateBookingRequestParams) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized, You must be logged in!");
        }

        // Only agents can create booking requests
        if (session.user.role !== "agent") {
            throw new Error(
                "Unauthorized, Only agents can create booking requests!"
            );
        }

        // Validate based on guest type
        if (data.guestType === "existing") {
            if (!data.existingGuestId) {
                throw new Error("Please select a guest");
            }

            // Verify guest exists and has no active booking
            const guest = await prisma.guest.findUnique({
                where: { id: data.existingGuestId, deletedAt: null },
                include: {
                    bookings: {
                        where: {
                            status: { in: ["pending", "reserved", "checked_in"] },
                        },
                        take: 1,
                    },
                },
            });

            if (!guest) {
                throw new Error("Guest not found");
            }

            if (guest.bookings.length > 0) {
                throw new Error("This guest already has an active booking");
            }
        } else {
            if (
                !data.guestFirstName ||
                !data.guestLastName ||
                !data.guestEmail ||
                !data.guestPhone ||
                !data.guestDateOfBirth ||
                !data.guestNationality ||
                !data.guestIdType ||
                !data.idDocumentUrl
            ) {
                throw new Error("All guest details are required for new guests");
            }

            if (data.guestIdType === "national_id" && !data.guestIdNumber) {
                throw new Error("National ID number is required");
            }

            if (data.guestIdType === "passport" && !data.guestPassportNumber) {
                throw new Error("Passport number is required");
            }
        }

        // Verify property exists
        const property = await prisma.property.findUnique({
            where: { id: data.propertyId },
        });

        if (!property) {
            throw new Error("Property not found!");
        }

        // Verify unit exists and belongs to property
        const unit = await prisma.unit.findUnique({
            where: { id: data.unitId },
        });

        if (!unit) {
            throw new Error("Unit not found!");
        }

        if (unit.propertyId !== data.propertyId) {
            throw new Error("Unit does not belong to the selected property!");
        }

        // Build the create data object
        const createData: Parameters<typeof prisma.bookingRequest.create>[0]["data"] = {
            requestedById: session.user.id,

            // Guest - existing guest ID (null for new guests)
            existingGuestId:
                data.guestType === "existing" ? data.existingGuestId : null,

            // Booking details (always required)
            propertyId: data.propertyId,
            unitId: data.unitId,
            checkInDate: data.checkInDate,
            checkOutDate: data.checkOutDate,
            numberOfGuests: data.numberOfGuests,
            priceDuration: data.priceDuration as PriceDuration,
            unitPrice: data.unitPrice,
            period: data.period,
            discountRate: data.discountRate || null,
            totalAmount: data.totalAmount,
            paymentCode: data.paymentCode,
            paymentMethod: data.paymentMethod,
            purpose: data.purpose || null,
            specialRequests: data.specialRequests || null,
            status: "pending",
        };

        // Add guest details only for new guests
        if (data.guestType === "new") {
            createData.guestFirstName = data.guestFirstName;
            createData.guestLastName = data.guestLastName;
            createData.guestEmail = data.guestEmail;
            createData.guestPhone = data.guestPhone;
            createData.guestDateOfBirth = data.guestDateOfBirth;
            createData.guestNationality = data.guestNationality;
            createData.guestIdType = data.guestIdType;
            createData.guestIdNumber = data.guestIdNumber || null;
            createData.guestPassportNumber = data.guestPassportNumber || null;
            createData.guestNotes = data.guestNotes || null;
            createData.idDocumentFilename = data.idDocumentFilename;
            createData.idDocumentOriginalName = data.idDocumentOriginalName;
            createData.idDocumentMimeType = data.idDocumentMimeType;
            createData.idDocumentFileSize = data.idDocumentFileSize;
            createData.idDocumentUrl = data.idDocumentUrl;
        }

        // Create the booking request
        const bookingRequest = await prisma.bookingRequest.create({
            data: createData,
            include: {
                property: true,
                unit: true,
                existingGuest: true,
                requestedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Mark the unit as reserved
        await prisma.unit.update({
            where: {
                id: unit.id
            },
            data: {
                status: "reserved"
            }
        })

        // Increment property occupied count
        await prisma.property.update({
            where: { id: bookingRequest.propertyId },
            data: { occupied: { increment: 1 } },
        });

        revalidatePath("/booking-requests");
        revalidatePath("/dashboard");

        // Get guest info for email notification
        const guestFirstName =
            data.guestType === "existing"
                ? bookingRequest.existingGuest!.firstName
                : data.guestFirstName!;
        const guestLastName =
            data.guestType === "existing"
                ? bookingRequest.existingGuest!.lastName
                : data.guestLastName!;
        const guestEmail =
            data.guestType === "existing"
                ? bookingRequest.existingGuest!.email
                : data.guestEmail!;
        const guestPhone =
            data.guestType === "existing"
                ? bookingRequest.existingGuest!.phone
                : data.guestPhone!;

        // Notify admin of the request (fire and forget)
        notifyAdminsOfNewBookingRequest({
            requestId: bookingRequest.id,
            guestFirstName,
            guestLastName,
            guestEmail,
            guestPhone,
            propertyName: bookingRequest.property.name,
            unitName: unit.name,
            checkInDate: new Date(data.checkInDate),
            checkOutDate: new Date(data.checkOutDate),
            priceDuration: data.priceDuration,
            period: data.period,
            totalAmount: data.totalAmount,
            requestedByName: session.user.name,
        }).catch((error) => {
            console.error("Failed to send booking request notifications:", error);
        });

        return { success: true, bookingRequest };
    } catch (error) {
        console.error("Error creating booking request:", error);
        throw error;
    }
}

export async function approveBookingRequest(
    id: number,
    mediaData?: ApproveMediaData
) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const userRole = session.user.role as Role;

        if (!["user", "admin", "superAdmin"].includes(userRole)) {
            throw new Error("Unauthorized: Insufficient permissions!");
        }

        const bookingRequest = await prisma.bookingRequest.findUnique({
            where: { id },
            include: {
                property: true,
                unit: true,
                existingGuest: true,
                requestedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!bookingRequest) {
            throw new Error("Booking request not found");
        }

        if (bookingRequest.status !== "pending") {
            throw new Error("Only pending requests can be approved!");
        }

        // Determine if this is an existing guest or new guest
        const isExistingGuest = !!bookingRequest.existingGuestId;

        // Verify that the status of the existing guest is verified
        if (isExistingGuest) {
            if (bookingRequest.existingGuest?.verificationStatus === "pending") {
                throw new Error("Only verified guests are eligible for booking!");
            }

            if (bookingRequest.existingGuest?.verificationStatus === "rejected") {
                throw new Error("Rejected guests are not eligible for booking!");
            }
        }

        // Create everything in a transaction
        const result = await prisma.$transaction(async (tx) => {
            let guestId: number;
            let guestName: string;

            if (isExistingGuest) {
                // Use existing guest - no need to create guest or media
                guestId = bookingRequest.existingGuestId!;
                guestName = `${bookingRequest.existingGuest!.firstName} ${bookingRequest.existingGuest!.lastName}`;
            } else {
                // Validate required fields for new guest
                if (
                    !bookingRequest.guestFirstName ||
                    !bookingRequest.guestLastName ||
                    !bookingRequest.guestEmail ||
                    !bookingRequest.guestPhone ||
                    !bookingRequest.guestDateOfBirth ||
                    !bookingRequest.guestNationality
                ) {
                    throw new Error("Missing guest details for new guest request");
                }

                // Create new guest
                const guest = await tx.guest.create({
                    data: {
                        firstName: bookingRequest.guestFirstName,
                        lastName: bookingRequest.guestLastName,
                        email: bookingRequest.guestEmail,
                        phone: bookingRequest.guestPhone,
                        dateOfBirth: bookingRequest.guestDateOfBirth,
                        nationality: bookingRequest.guestNationality,
                        idType: bookingRequest.guestIdType || "national_id",
                        idNumber: bookingRequest.guestIdNumber,
                        passportNumber: bookingRequest.guestPassportNumber,
                        notes: bookingRequest.guestNotes,
                        verificationStatus: "verified",
                        registeredById: bookingRequest.requestedById,
                    },
                });

                guestId = guest.id;
                guestName = `${guest.firstName} ${guest.lastName}`;

                // Create media record with moved file data (only for new guests)
                if (mediaData) {
                    await tx.media.create({
                        data: {
                            guestId: guest.id,
                            filePath: mediaData.mediaUrl,
                            filename: mediaData.mediaFilename,
                            originalName: mediaData.mediaOriginalName,
                            mimeType: mediaData.mediaMimeType,
                            fileSize: mediaData.mediaSize,
                        },
                    });
                }
            }

            // Create booking
            const booking = await tx.booking.create({
                data: {
                    guestId,
                    propertyId: bookingRequest.propertyId,
                    unitId: bookingRequest.unitId,
                    checkInDate: bookingRequest.checkInDate,
                    checkOutDate: bookingRequest.checkOutDate,
                    numberOfGuests: bookingRequest.numberOfGuests,
                    priceDuration: bookingRequest.priceDuration,
                    unitPrice: bookingRequest.unitPrice,
                    period: bookingRequest.period,
                    discountRate: bookingRequest.discountRate,
                    totalAmount: bookingRequest.totalAmount,
                    paymentCode: bookingRequest.paymentCode,
                    paymentMethod: bookingRequest.paymentMethod,
                    purpose: bookingRequest.purpose || "personal",
                    specialRequests: bookingRequest.specialRequests,
                    source: "agent_request",
                    status: "reserved",
                    requestedById: bookingRequest.requestedById,
                    approvedById: session.user.id,
                    approvedAt: new Date(),
                },
            });

            // Update booking request status
            await tx.bookingRequest.update({
                where: { id },
                data: {
                    status: "approved",
                    reviewedById: session.user.id,
                    reviewedAt: new Date(),
                },
            });

            return { guestId, guestName, booking };
        });


        revalidatePath("/booking-requests");
        revalidatePath(`/booking-requests/${bookingRequest.id}`);

        // Notify agent of approval (fire and forget)
        notifyAgentOfApproval({
            agentEmail: bookingRequest.requestedBy.email,
            agentName: bookingRequest.requestedBy.name || "Agent",
            guestName: result.guestName,
            propertyName: bookingRequest.property.name,
            unitName: bookingRequest.unit.name,
            checkInDate: bookingRequest.checkInDate,
            checkOutDate: bookingRequest.checkOutDate,
            numberOfGuests: bookingRequest.numberOfGuests,
            totalAmount: bookingRequest.totalAmount,
            bookingId: result.booking.id,
        }).catch((error) => {
            console.error("Failed to send approval notification:", error);
        });

        return {
            success: true,
            guestId: result.guestId,
            bookingId: result.booking.id,
            isExistingGuest,
        };
    } catch (error) {
        console.error("Error approving booking request:", error);
        throw error;
    }
}

export async function getBookingRequests(params: GetBookingRequestsParams = {}) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized, You must be logged in!");
        }

        const { page = 1, status, search } = params;
        const skip = (page - 1) * LIMIT;

        // Build where clause based on role
        const whereClause: {
            requestedById?: string;
            status?: "pending" | "approved" | "rejected" | "cancelled";
            OR?: Array<Record<string, unknown>>;
        } = {};

        // Agents can only see their own requests
        if (session.user.role === "agent") {
            whereClause.requestedById = session.user.id;
        }

        // Filter by status if provided
        if (status) {
            whereClause.status = status;
        }

        // Search filter - search both new guest fields and existing guest relation
        if (search) {
            whereClause.OR = [
                // Search new guest fields
                { guestFirstName: { contains: search, mode: "insensitive" } },
                { guestLastName: { contains: search, mode: "insensitive" } },
                { guestEmail: { contains: search, mode: "insensitive" } },
                { guestPhone: { contains: search, mode: "insensitive" } },
                // Search existing guest relation
                {
                    existingGuest: {
                        firstName: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    existingGuest: {
                        lastName: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    existingGuest: {
                        email: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    existingGuest: {
                        phone: { contains: search, mode: "insensitive" },
                    },
                },
            ];
        }

        // Get total count
        const totalCount = await prisma.bookingRequest.count({
            where: whereClause,
        });

        // Get booking requests
        const bookingRequests = await prisma.bookingRequest.findMany({
            where: whereClause,
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                requestedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                reviewedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                existingGuest: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: [{ status: "asc" }, { createdAt: "desc" }],
            skip,
            take: LIMIT,
        });

        const totalPages = Math.ceil(totalCount / LIMIT);

        return {
            bookingRequests,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    } catch (error) {
        console.error("Error fetching booking requests:", error);
        throw error;
    }
}

export async function getBookingRequestById(id: number) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized, You must be logged in!");
        }

        const bookingRequest = await prisma.bookingRequest.findUnique({
            where: { id },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        type: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        bedrooms: true,
                        maxGuests: true,
                    },
                },
                requestedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                reviewedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                existingGuest: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        dateOfBirth: true,
                        nationality: true,
                        idType: true,
                        idNumber: true,
                        passportNumber: true,
                    },
                },
            },
        });

        if (!bookingRequest) {
            throw new Error("Booking request not found");
        }

        // Agents can only view their own requests
        if (
            session.user.role === "agent" &&
            bookingRequest.requestedById !== session.user.id
        ) {
            throw new Error("Unauthorized: You can only view your own requests");
        }

        return bookingRequest;
    } catch (error) {
        console.error("Error fetching booking request:", error);
        throw error;
    }
}

export async function getBookingRequestsStats() {
    try {
        const session = await getServerSession();
        const user = session?.user

        if (!user) {
            redirect("/login");
        }

        const isAgent = user.role === "agent";

        const total = await prisma.bookingRequest.count({
            where: {
                ...(isAgent && {
                    requestedById: user.id
                })
            }
        })

        const approved = await prisma.bookingRequest.count({
            where: {
                status: "approved",
                ...(isAgent && {
                    requestedById: user.id
                })
            }
        })

        const pending = await prisma.bookingRequest.count({
            where: {
                status: "pending",
                ...(isAgent && {
                    requestedById: user.id
                })
            }
        })

        const rejected = await prisma.bookingRequest.count({
            where: {
                status: "rejected",
                ...(isAgent && {
                    requestedById: user.id
                })
            }
        })


        return {
            total,
            approved,
            rejected,
            pending
        }

    } catch (error) {
        console.error("Error getting booking request stats: ", error);
        throw error
    }
}

export async function getBookingRequestFormData() {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized: You must be logged in");
        }

        // Only agents can access this form data
        if (session.user.role !== "agent") {
            throw new Error("Unauthorized: Only agents can create booking requests");
        }

        const properties = await prisma.property.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                units: {
                    where: {
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        maxGuests: true,
                        status: true,
                    },
                    orderBy: {
                        name: "asc",
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        // Get all active pricing options
        const pricingOptions = await prisma.unitTypePricing.findMany({
            where: {
                isActive: true,
            },
            orderBy: [{ unitType: "asc" }, { price: "asc" }],
        });

        // Map pricing options to each property's units based on unit type
        const propertiesWithPricing = properties.map((property) => ({
            ...property,
            units: property.units.map((unit) => ({
                ...unit,
                pricingOptions: pricingOptions.filter(
                    (pricing) => pricing.unitType === unit.type
                ),
            })),
        }));

        return {
            properties: propertiesWithPricing,
        };
    } catch (error) {
        console.error("Error fetching booking request form data:", error);
        throw error;
    }
}

export async function updateBookingRequest(data: UpdateBookingRequestParams) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized: You must be logged in");
        }

        // Get existing booking request
        const existingRequest = await prisma.bookingRequest.findUnique({
            where: { id: data.id },
        });

        if (!existingRequest) {
            throw new Error("Booking request not found");
        }

        // Only agents can update their own requests
        if (session.user.role !== "agent") {
            throw new Error("Unauthorized, Only agents can update booking requests!");
        }

        // Agents can only update their own requests
        if (existingRequest.requestedById !== session.user.id) {
            throw new Error("Unauthorized, You can only update your own requests!");
        }

        // Can only update pending requests
        if (existingRequest.status !== "pending") {
            throw new Error(
                `Cannot update a ${existingRequest.status} request. Only pending requests can be updated.`
            );
        }

        // If property or unit is being changed, validate them
        if (data.propertyId) {
            const property = await prisma.property.findUnique({
                where: { id: data.propertyId },
            });

            if (!property) {
                throw new Error("Property not found");
            }
        }

        if (data.unitId) {
            const unit = await prisma.unit.findUnique({
                where: { id: data.unitId },
            });

            if (!unit) {
                throw new Error("Unit not found");
            }

            // Verify unit belongs to the property
            const propertyId = data.propertyId || existingRequest.propertyId;
            if (unit.propertyId !== propertyId) {
                throw new Error("Unit does not belong to the selected property");
            }
        }

        // Build update data (only include provided fields)
        const updateData: Record<string, unknown> = {};

        // Guest details
        if (data.guestFirstName !== undefined)
            updateData.guestFirstName = data.guestFirstName;
        if (data.guestLastName !== undefined)
            updateData.guestLastName = data.guestLastName;
        if (data.guestEmail !== undefined) updateData.guestEmail = data.guestEmail;
        if (data.guestPhone !== undefined) updateData.guestPhone = data.guestPhone;
        if (data.guestDateOfBirth !== undefined)
            updateData.guestDateOfBirth = data.guestDateOfBirth;
        if (data.guestNationality !== undefined)
            updateData.guestNationality = data.guestNationality;
        if (data.guestIdType !== undefined)
            updateData.guestIdType = data.guestIdType;
        if (data.guestIdNumber !== undefined)
            updateData.guestIdNumber = data.guestIdNumber;
        if (data.guestPassportNumber !== undefined)
            updateData.guestPassportNumber = data.guestPassportNumber;
        if (data.guestNotes !== undefined) updateData.guestNotes = data.guestNotes;

        // ID Document (if replacing)
        if (data.idDocumentFilename !== undefined)
            updateData.idDocumentFilename = data.idDocumentFilename;
        if (data.idDocumentOriginalName !== undefined)
            updateData.idDocumentOriginalName = data.idDocumentOriginalName;
        if (data.idDocumentMimeType !== undefined)
            updateData.idDocumentMimeType = data.idDocumentMimeType;
        if (data.idDocumentFileSize !== undefined)
            updateData.idDocumentFileSize = data.idDocumentFileSize;

        // Booking details
        if (data.propertyId !== undefined) updateData.propertyId = data.propertyId;
        if (data.unitId !== undefined) updateData.unitId = data.unitId;
        if (data.checkInDate !== undefined)
            updateData.checkInDate = data.checkInDate;
        if (data.checkOutDate !== undefined)
            updateData.checkOutDate = data.checkOutDate;
        if (data.numberOfGuests !== undefined)
            updateData.numberOfGuests = data.numberOfGuests;
        if (data.priceDuration !== undefined)
            updateData.priceDuration = data.priceDuration;
        if (data.unitPrice !== undefined) updateData.unitPrice = data.unitPrice;
        if (data.period !== undefined) updateData.period = data.period;
        if (data.discountRate !== undefined)
            updateData.discountRate = data.discountRate;
        if (data.totalAmount !== undefined)
            updateData.totalAmount = data.totalAmount;
        if (data.purpose !== undefined) updateData.purpose = data.purpose;
        if (data.specialRequests !== undefined)
            updateData.specialRequests = data.specialRequests;

        // Update the booking request
        const updatedRequest = await prisma.bookingRequest.update({
            where: { id: data.id },
            data: updateData,
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                requestedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        revalidatePath("/booking-requests");
        revalidatePath(`/booking-requests/${data.id}`);

        return { success: true, bookingRequest: updatedRequest };
    } catch (error) {
        console.error("Error updating booking request:", error);
        throw error;
    }
}

export async function rejectBookingRequest(id: number, rejectionReason: string) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized: You must be logged in");
        }

        const userRole = session.user.role as Role;

        // Only user, admin, superAdmin can reject
        if (!["user", "admin", "superAdmin"].includes(userRole)) {
            throw new Error(
                "Unauthorized: You don't have permission to reject requests"
            );
        }

        // Validate rejection reason
        if (!rejectionReason || rejectionReason.trim().length === 0) {
            throw new Error("Rejection reason is required");
        }

        // Get the booking request with all needed data
        const bookingRequest = await prisma.bookingRequest.findUnique({
            where: { id },
            include: {
                property: {
                    select: {
                        name: true,
                    },
                },
                unit: {
                    select: {
                        name: true,
                    },
                },
                existingGuest: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                requestedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!bookingRequest) {
            throw new Error("Booking request not found");
        }

        // Can only reject pending requests
        if (bookingRequest.status !== "pending") {
            throw new Error(
                `Cannot reject a ${bookingRequest.status} request. Only pending requests can be rejected.`
            );
        }

        const result = await prisma.$transaction((async (tx) => {

            const updatedRequest = await tx.bookingRequest.update({
                where: { id },
                data: {
                    status: "rejected",
                    rejectionReason: rejectionReason.trim(),
                    reviewedById: session.user.id,
                    reviewedAt: new Date(),
                },
            })

            await prisma.unit.update({
                where: {
                    id: updatedRequest.unitId
                },
                data: {
                    status: "available"
                }
            })

            await tx.property.update({
                where: { id: updatedRequest.propertyId },
                data: { occupied: { decrement: 1 } },
            })

            return updatedRequest
        }))




        revalidatePath("/booking-requests");
        revalidatePath(`/booking-requests/${id}`);

        // Determine guest name
        const guestName = bookingRequest.existingGuest
            ? `${bookingRequest.existingGuest.firstName} ${bookingRequest.existingGuest.lastName}`
            : `${bookingRequest.guestFirstName} ${bookingRequest.guestLastName}`;

        // Notify agent of rejection (fire and forget)
        notifyAgentOfRejection({
            agentEmail: bookingRequest.requestedBy.email,
            agentName: bookingRequest.requestedBy.name || "Agent",
            guestName,
            propertyName: bookingRequest.property.name,
            unitName: bookingRequest.unit.name,
            checkInDate: bookingRequest.checkInDate,
            checkOutDate: bookingRequest.checkOutDate,
            rejectionReason: rejectionReason.trim(),
        }).catch((error) => {
            console.error("Failed to send rejection notification:", error);
        });

        return {
            success: true,
            bookingRequest: result,
            fileToDelete: bookingRequest.idDocumentFilename,
        };
    } catch (error) {
        console.error("Error rejecting booking request:", error);
        throw error;
    }
}

export async function cancelBookingRequest(id: number) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized: You must be logged in");
        }

        // Get the booking request
        const bookingRequest = await prisma.bookingRequest.findUnique({
            where: { id },
        });

        if (!bookingRequest) {
            throw new Error("Booking request not found");
        }

        // Only the agent who created the request can cancel it
        if (bookingRequest.requestedById !== session.user.id) {
            throw new Error("Unauthorized: You can only cancel your own requests");
        }

        // Can only cancel pending requests
        if (bookingRequest.status !== "pending") {
            throw new Error(
                `Cannot cancel a ${bookingRequest.status} request. Only pending requests can be cancelled.`
            );
        }

        const result = await prisma.$transaction((async (tx) => {
            const updatedRequest = await tx.bookingRequest.update({
                where: { id },
                data: {
                    status: "cancelled",
                },
            })

            await prisma.unit.update({
                where: {
                    id: updatedRequest.unitId
                },
                data: {
                    status: "available"
                }
            })

            await tx.property.update({
                where: { id: updatedRequest.propertyId },
                data: { occupied: { decrement: 1 } },
            })

            return updatedRequest
        }))


        revalidatePath("/booking-requests");
        revalidatePath(`/booking-requests/${id}`);

        return {
            success: true,
            bookingRequest: result,
            fileToDelete: bookingRequest.idDocumentFilename,
        };
    } catch (error) {
        console.error("Error cancelling booking request:", error);
        throw error;
    }
}
