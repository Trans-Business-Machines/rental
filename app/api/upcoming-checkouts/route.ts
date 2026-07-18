import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import resend from "@/lib/emailClient";
import { formatPrice, formatDateKE } from "@/lib/utils";
import { UpcomingCheckoutsEmail } from "@/lib/emails/UpcomingCheckoutsEmail";
import {
    startOfDay,
    setHours,
    differenceInCalendarDays,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

const EAT_TIMEZONE = "Africa/Nairobi";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;


        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }


        const now = new Date();

        // Get current time in EAT, then derive today's boundaries
        const nowEAT = toZonedTime(now, EAT_TIMEZONE);
        const todayStartEAT = startOfDay(nowEAT);
        const todaySixPMEAT = setHours(todayStartEAT, 18);

        // Convert back to UTC for Prisma queries
        const sixPMEATinUTC = new Date(
            todaySixPMEAT.getTime() -
            (nowEAT.getTime() - now.getTime()),
        );

        // 1. Upcoming checkouts today (checkout between now and 6PM EAT)
        const upcomingCheckouts = await prisma.booking.findMany({
            where: {
                status: "checked_in",
                checkOutDate: {
                    gte: now,
                    lte: sixPMEATinUTC,
                },
                deletedAt: null,
            },
            include: {
                guest: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                property: { select: { name: true } },
                unit: { select: { name: true } },
            },
            orderBy: { checkOutDate: "asc" },
        });

        // 2. Overstayed bookings (checkout date passed, still checked_in)
        const overstayedBookings = await prisma.booking.findMany({
            where: {
                status: "checked_in",
                checkOutDate: { lt: now },
                deletedAt: null,
            },
            include: {
                guest: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                property: { select: { name: true } },
                unit: { select: { name: true } },
            },
            orderBy: { checkOutDate: "asc" },
        });

        const totalUpcoming = upcomingCheckouts.length;
        const totalOverstayed = overstayedBookings.length;

        if (totalUpcoming === 0 && totalOverstayed === 0) {
            return NextResponse.json({
                success: true,
                message: "No upcoming checkouts or overstays found.",
                upcoming: 0,
                overstayed: 0,
            });
        }

        // 3. Get all admins to notify
        const admins = await prisma.user.findMany({
            where: {
                role: { in: ["admin"] },
                banned: false,
            },
            select: { name: true, email: true },
        });

        if (admins.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No admins to notify.",
                upcoming: totalUpcoming,
                overstayed: totalOverstayed,
            });
        }

        // 4. Format booking data for the email
        const upcomingData = upcomingCheckouts.map((booking) => ({
            guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
            guestPhone: booking.guest.phone,
            propertyName: booking.property.name,
            unitName: booking.unit.name,
            checkInDate: formatDateKE(booking.checkInDate),
            checkOutDate: formatDateKE(booking.checkOutDate),
            totalAmount: formatPrice(booking.totalAmount),
            bookingId: booking.id,
        }));

        const overstayedData = overstayedBookings.map((booking) => ({
            guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
            guestPhone: booking.guest.phone,
            propertyName: booking.property.name,
            unitName: booking.unit.name,
            checkInDate: formatDateKE(booking.checkInDate),
            checkOutDate: formatDateKE(booking.checkOutDate),
            totalAmount: formatPrice(booking.totalAmount),
            daysOverstayed: differenceInCalendarDays(now, booking.checkOutDate),
            bookingId: booking.id,
        }));

        // 5. Send emails to all admins
        const emailPromises = admins.map((admin) =>
            resend.emails.send({
                from:
                    `RentalsManager <${process.env.EMAIL_FROM}>` ||
                    "Rentals Manager <noreply@rentalsmanager.app>",
                to: admin.email,
                subject: `Daily Checkout Report — ${totalUpcoming} upcoming, ${totalOverstayed} overstayed`,
                react: UpcomingCheckoutsEmail({
                    adminName: admin.name,
                    upcomingCheckouts: upcomingData,
                    overstayedBookings: overstayedData,
                    reportDate: formatDateKE(now),
                }),
            }),
        );

        const results = await Promise.allSettled(emailPromises);

        const successCount = results.filter(
            (r) => r.status === "fulfilled",
        ).length;

        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(
                    `Failed to notify admin ${admins[index].email}:`,
                    result.reason,
                );
            }
        });

        return NextResponse.json({
            success: true,
            message: `Notified ${successCount}/${admins.length} admins.`,
            upcoming: totalUpcoming,
            overstayed: totalOverstayed,
        });
    } catch (error) {
        console.error("Checkout cron job failed:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            },
            { status: 500 },
        );
    }
}