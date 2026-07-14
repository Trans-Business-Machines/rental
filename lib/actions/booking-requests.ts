"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/check-permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LIMIT, normalizeCheckOutTo10amEAT } from "@/lib/utils";
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
                    in: ["superAdmin"],
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
            console.log("No Super Admins found to notify of booking request");
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
                    `Rentals Manager <${process.env.EMAIL_FROM}>` ||
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
                    `Failed to notify Super Admin ${admins[index].email} of booking request:`,
                    result.reason
                );
            }
        });

        return { success: true, notified: successCount };
    } catch (error) {
        console.error("Error notifying Super Admin of booking request:", error);
        return { success: false, notified: 0 };
    }
};

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
            from: `Rentals Manager <${process.env.EMAIL_FROM}>` || "Rentals Manager <noreply@rentalsmanager.app>",
            to: agentEmail,
            subject: `Booking Approved - ${guestName} at ${propertyName}`,
            react: BookingRequestApprovedEmail({
                agentName,
                guestName,
                propertyName,
                unitName,
                checkInDate: formatDate(checkInDate),
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
            from: `Rentals Manager <${process.env.EMAIL_FROM}>` || "Rentals Manager <noreply@rentalsmanager.app>",
            to: agentEmail,
            subject: `Booking Request Rejected - ${guestName} at ${propertyName}`,
            react: BookingRequestRejectedEmail({
                agentName,
                guestName,
                propertyName,
                unitName,
                checkInDate: formatDate(checkInDate),
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
export async function getPendingBookingRequestCount() {
    try {
        const count = await prisma.bookingRequest.count({
            where: {
                status: "pending",
            },
        });
        return count;
    } catch (error) {
        console.error("Error fetching pending booking request count:", error);
        return 0;
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
                guest: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                }
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
                guest: true,
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

export async function createBookingRequest(data: CreateBookingRequestParams) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            return {
                success: false,
                message: "Unauthorized, You must be logged in!",
            };
        }

        if (session.user.role !== "agent") {
            return {
                success: false,
                message: "Unauthorized, Only agents can create booking requests!",
            };
        }

        // Validate the unit exists, belongs to the property, and is available
        const unit = await prisma.unit.findFirst({
            where: {
                id: data.unitId,
                propertyId: data.propertyId,
            },
        });

        if (!unit) {
            return { success: false, message: "Unit not found!" };
        }

        if (unit.status !== "available") {
            return {
                success: false,
                message: "This unit is not available for booking!",
            };
        }

        // Validate the guest exists
        const guest = await prisma.guest.findUnique({
            where: { id: data.guestId },
        });

        if (!guest) {
            return { success: false, message: "Guest not found!" };
        }

        // Check for duplicate payment code
        const existingPaymentCode = await prisma.booking.findFirst({
            where: { paymentCode: data.paymentCode },
        });

        const existingRequestCode = await prisma.bookingRequest.findFirst({
            where: {
                paymentCode: data.paymentCode,
                status: { in: ["pending", "approved"] },
            },
        });

        if (existingPaymentCode || existingRequestCode) {
            return {
                success: false,
                message: "This payment code already exists and can't be reused!",
            };
        }

        const bookingRequest = await prisma.bookingRequest.create({
            data: {
                requestedById: session.user.id,
                guestId: data.guestId,
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
            },
            include: {
                property: true,
                unit: true,
                guest: true,
                requestedBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        await prisma.unit.update({
            where: { id: unit.id },
            data: { status: "booked" },
        });

        await prisma.property.update({
            where: { id: bookingRequest.propertyId },
            data: { occupied: { increment: 1 } },
        });

        revalidatePath("/booking-requests");
        revalidatePath("/dashboard");

        // Fire-and-forget email notification
        notifyAdminsOfNewBookingRequest({
            requestId: bookingRequest.id,
            guestFirstName: guest.firstName,
            guestLastName: guest.lastName,
            guestEmail: guest.email,
            guestPhone: guest.phone,
            propertyName: bookingRequest.property.name,
            unitName: unit.name,
            checkInDate: data.checkInDate,
            checkOutDate: data.checkOutDate,
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

        const message =
            error instanceof Error
                ? error.message
                : "Failed to create booking request!";

        return { success: false, message };
    }
}

export async function approveBookingRequest(id: number) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized" };
        }

        const userRole = session.user.role as Role;

        if (!["superAdmin"].includes(userRole)) {
            return {
                success: false,
                message: "Only a super admin can approve a booking request.",
            };
        }

        const bookingRequest = await prisma.bookingRequest.findUnique({
            where: { id },
            include: {
                property: true,
                unit: true,
                guest: true,
                requestedBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!bookingRequest) {
            return { success: false, message: "Booking request not found" };
        }

        if (bookingRequest.status !== "pending") {
            return {
                success: false,
                message: "Only pending requests can be approved!",
            };
        }

        // Check for duplicate payment code (could have been used since request was created)
        const existingPaymentCode = await prisma.booking.findFirst({
            where: { paymentCode: bookingRequest.paymentCode },
        });

        if (existingPaymentCode) {
            return {
                success: false,
                message:
                    "This payment code already exists in a booking. The request cannot be approved.",
            };
        }

        const guest = bookingRequest.guest;
        const guestName = `${guest.firstName} ${guest.lastName}`;

        const result = await prisma.$transaction(async (tx) => {

            // 1. Update guest verification status to verified
            if (guest.verificationStatus !== "verified") {
                await tx.guest.update({
                    where: { id: guest.id },
                    data: { verificationStatus: "verified" },
                });
            }

            // 2. Create the booking
            const checkOutAt10amEAT = normalizeCheckOutTo10amEAT(
                bookingRequest.checkOutDate
            );

            const booking = await tx.booking.create({
                data: {
                    guestId: guest.id,
                    propertyId: bookingRequest.propertyId,
                    unitId: bookingRequest.unitId,
                    priceDuration: bookingRequest.priceDuration,
                    unitPrice: bookingRequest.unitPrice,
                    period: bookingRequest.period,
                    discountRate: bookingRequest.discountRate,
                    totalAmount: bookingRequest.totalAmount,
                    checkInDate: bookingRequest.checkInDate,
                    checkOutDate: checkOutAt10amEAT,
                    numberOfGuests: bookingRequest.numberOfGuests,
                    source: "agent",
                    purpose: bookingRequest.purpose || "accommodation",
                    paymentCode: bookingRequest.paymentCode,
                    paymentMethod: bookingRequest.paymentMethod,
                    specialRequests: bookingRequest.specialRequests,
                    status: "reserved",
                    requestedById: bookingRequest.requestedById,
                    approvedById: session.user.id,
                    approvedAt: new Date(),
                },
            });

            // 3. Mark request as approved
            await tx.bookingRequest.update({
                where: { id },
                data: {
                    status: "approved",
                    reviewedById: session.user.id,
                    reviewedAt: new Date(),
                },
            });

            return { booking, guestName };
        }, { timeout: 15000, maxWait: 5000, isolationLevel: "ReadCommitted" });

        revalidatePath("/booking-requests");
        revalidatePath("/bookings");
        revalidatePath("/dashboard");
        revalidatePath("/guests");

        // Fire-and-forget approval email to agent
        notifyAgentOfApproval({
            agentEmail: bookingRequest.requestedBy.email,
            agentName: bookingRequest.requestedBy.name,
            guestName: result.guestName,
            propertyName: bookingRequest.property.name,
            unitName: bookingRequest.unit.name,
            checkInDate: bookingRequest.checkInDate,
            checkOutDate: bookingRequest.checkOutDate,
            numberOfGuests: bookingRequest.numberOfGuests,
            totalAmount: bookingRequest.totalAmount,
            bookingId: result.booking.id,
        }).catch((error) => {
            console.error("Failed to send approval email:", error);
        });

        return { success: true, message: "Booking request approved successfully" };
    } catch (error) {
        console.error("Error approving booking request:", error);

        const message =
            error instanceof Error
                ? error.message
                : "Failed to approve booking request!";

        return { success: false, message };
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

export async function rejectBookingRequest(
    id: number,
    rejectionReason: string,
) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized" };
        }

        const userRole = session.user.role as Role;

        if (!["superAdmin"].includes(userRole)) {
            return {
                success: false,
                message: "Only a super admin can reject a booking request.",
            };
        }

        const bookingRequest = await prisma.bookingRequest.findUnique({
            where: { id },
            include: {
                property: true,
                unit: true,
                guest: true,
                requestedBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!bookingRequest) {
            return { success: false, message: "Booking request not found" };
        }

        if (bookingRequest.status !== "pending") {
            return {
                success: false,
                message: "Only pending requests can be rejected!",
            };
        }

        const guest = bookingRequest.guest;
        const guestName = `${guest.firstName} ${guest.lastName}`;

        await prisma.$transaction(async (tx) => {

            // 1. If the guest is still pending, mark as rejected
            if (guest.verificationStatus === "pending") {
                await tx.guest.update({
                    where: { id: guest.id },
                    data: { verificationStatus: "rejected" },
                });
            }

            // 2. Mark request as rejected
            await tx.bookingRequest.update({
                where: { id },
                data: {
                    status: "rejected",
                    rejectionReason,
                    reviewedById: session.user.id,
                    reviewedAt: new Date(),
                },
            });

            // 3. Free up the unit
            await tx.unit.update({
                where: { id: bookingRequest.unitId },
                data: { status: "available" },
            });

            // 4. Decrement property occupancy
            await tx.property.update({
                where: { id: bookingRequest.propertyId },
                data: { occupied: { decrement: 1 } },
            });
        });

        revalidatePath("/booking-requests");
        revalidatePath("/dashboard");
        revalidatePath("/guests");

        // Fire-and-forget rejection email
        notifyAgentOfRejection({
            agentEmail: bookingRequest.requestedBy.email,
            agentName: bookingRequest.requestedBy.name,
            guestName,
            propertyName: bookingRequest.property.name,
            unitName: bookingRequest.unit.name,
            checkInDate: bookingRequest.checkInDate,
            checkOutDate: bookingRequest.checkOutDate,
            rejectionReason,
        }).catch((error) => {
            console.error("Failed to send rejection email:", error);
        });

        return { success: true, message: "Booking request rejected" };
    } catch (error) {
        console.error("Error rejecting booking request:", error);

        const message = "Failed to reject booking request, try again.";

        return { success: false, message };
    }
}

export async function cancelBookingRequest(id: number, reason: string) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized: You must be logged in");
        }

        const bookingRequest = await prisma.bookingRequest.findUnique({
            where: { id },
        });

        if (!bookingRequest) {
            throw new Error("Booking request not found");
        }

        if (bookingRequest.requestedById !== session.user.id) {
            throw new Error(
                "Unauthorized: You can only cancel your own requests",
            );
        }

        if (bookingRequest.status !== "pending") {
            throw new Error(
                `Cannot cancel a ${bookingRequest.status} request. Only pending requests can be cancelled.`,
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const updatedRequest = await tx.bookingRequest.update({
                where: { id },
                data: {
                    status: "cancelled",
                    cancelReason: reason,
                    reviewedById: session.user.id,
                    reviewedAt: new Date(),
                },
            });

            await tx.unit.update({
                where: { id: updatedRequest.unitId },
                data: { status: "available" },
            });

            await tx.property.update({
                where: { id: updatedRequest.propertyId },
                data: { occupied: { decrement: 1 } },
            });

            return updatedRequest;
        });

        revalidatePath("/booking-requests");
        revalidatePath(`/booking-requests/${id}`);

        return {
            success: true,
            bookingRequest: result,
        };
    } catch (error) {
        console.error("Error cancelling booking request:", error);
        throw error;
    }
}


