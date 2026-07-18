import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface UpcomingCheckout {
  guestName: string;
  guestPhone: string;
  propertyName: string;
  unitName: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: string;
  bookingId: number;
}

interface OverstayedBooking {
  guestName: string;
  guestPhone: string;
  propertyName: string;
  unitName: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: string;
  daysOverstayed: number;
  bookingId: number;
}

interface UpcomingCheckoutsEmailProps {
  adminName: string;
  upcomingCheckouts: UpcomingCheckout[];
  overstayedBookings: OverstayedBooking[];
  reportDate: string;
}

export default function UpcomingCheckoutsEmail({
  adminName,
  upcomingCheckouts,
  overstayedBookings,
  reportDate,
}: UpcomingCheckoutsEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto max-w-[600px] rounded-lg overflow-hidden">
            {/* Header */}
            <Section className="bg-[#1a1a2e] px-8 py-6">
              <Heading className="text-white text-xl font-bold m-0">
                Daily Checkout Report
              </Heading>
              <Text className="text-gray-400 text-[13px] mt-1 mb-0">
                {reportDate}
              </Text>
            </Section>

            <Section className="px-8 py-6">
              <Text className="text-[15px] text-[#1a1a2e] mb-1 mt-0">
                Hi {adminName},
              </Text>
              <Text className="text-sm text-gray-600 leading-relaxed mt-0 mb-4">
                Here is your daily checkout summary.{" "}
                {upcomingCheckouts.length > 0 &&
                  `${upcomingCheckouts.length} checkout(s) expected today.`}{" "}
                {overstayedBookings.length > 0 &&
                  `${overstayedBookings.length} booking(s) are overstayed.`}
              </Text>

              {/* Overstayed Section */}
              {overstayedBookings.length > 0 && (
                <>
                  <Hr className="border-gray-200 my-5" />
                  <Heading as="h3" className="text-base text-red-600 mb-1 mt-0">
                    Overstayed Bookings ({overstayedBookings.length})
                  </Heading>
                  <Text className="text-[13px] text-gray-500 mt-0 mb-3">
                    These guests have passed their checkout date and are still
                    checked in.
                  </Text>

                  {overstayedBookings.map((booking) => (
                    <Section
                      key={booking.bookingId}
                      className="bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-2.5"
                    >
                      <Row>
                        <Column>
                          <Text className="text-[11px] text-gray-400 uppercase tracking-wide m-0">
                            Guest
                          </Text>
                          <Text className="text-sm text-[#1a1a2e] font-medium mt-0.5 mb-0">
                            {booking.guestName}
                          </Text>
                        </Column>
                        <Column>
                          <Text className="text-[11px] text-gray-400 uppercase tracking-wide m-0">
                            Phone
                          </Text>
                          <Text className="text-sm text-[#1a1a2e] font-medium mt-0.5 mb-0">
                            {booking.guestPhone}
                          </Text>
                        </Column>
                      </Row>
                      <Row className="mt-2">
                        <Column>
                          <Text className="text-[11px] text-gray-400 uppercase tracking-wide m-0">
                            Property
                          </Text>
                          <Text className="text-sm text-[#1a1a2e] font-medium mt-0.5 mb-0">
                            {booking.propertyName} - {booking.unitName}
                          </Text>
                        </Column>
                      </Row>
                      <Row className="mt-2 relative">
                        <Column>
                          <Text className="text-[11px] text-gray-400 uppercase tracking-wide m-0">
                            Was due
                          </Text>
                          <Text className="text-sm text-[#1a1a2e] font-medium mt-0.5 mb-0">
                            {booking.checkOutDate}
                          </Text>
                        </Column>
                        <Column>
                          <Text className="text-xs text-red-600 font-semibold bg-red-100 px-2 py-1 rounded inline-block mb-0">
                            {booking.daysOverstayed} day
                            {booking.daysOverstayed !== 1 ? "s" : ""} overdue
                          </Text>
                        </Column>
                      </Row>
                    </Section>
                  ))}
                </>
              )}

              {/* Upcoming Checkouts Section */}
              {upcomingCheckouts.length > 0 && (
                <>
                  <Hr className="border-gray-200 my-5" />
                  <Heading
                    as="h3"
                    className="text-base text-[#1a1a2e] mb-1 mt-0"
                  >
                    Today&apos;s Checkouts ({upcomingCheckouts.length})
                  </Heading>
                  <Text className="text-[13px] text-gray-500 mt-0 mb-3">
                    These guests are expected to check out today by 6:00 PM.
                  </Text>

                  {upcomingCheckouts.map((booking) => (
                    <Section
                      key={booking.bookingId}
                      className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3 mb-2.5"
                    >
                      <Row>
                        <Column>
                          <Text className="text-[11px] text-gray-400 uppercase tracking-wide m-0">
                            Guest
                          </Text>
                          <Text className="text-sm text-[#1a1a2e] font-medium mt-0.5 mb-0">
                            {booking.guestName}
                          </Text>
                        </Column>
                        <Column>
                          <Text className="text-[11px] text-gray-400 uppercase tracking-wide m-0">
                            Phone
                          </Text>
                          <Text className="text-sm text-[#1a1a2e] font-medium mt-0.5 mb-0">
                            {booking.guestPhone}
                          </Text>
                        </Column>
                      </Row>
                      <Row className="mt-2">
                        <Column>
                          <Text className="text-[11px] text-gray-400 uppercase tracking-wide m-0">
                            Property
                          </Text>
                          <Text className="text-sm text-[#1a1a2e] font-medium mt-0.5 mb-0">
                            {booking.propertyName} - {booking.unitName}
                          </Text>
                        </Column>
                      </Row>
                      <Row className="mt-2">
                        <Column>
                          <Text className="text-[11px] text-gray-400 uppercase tracking-wide m-0">
                            Check-in
                          </Text>
                          <Text className="text-sm text-[#1a1a2e] font-medium mt-0.5 mb-0">
                            {booking.checkInDate}
                          </Text>
                        </Column>
                        <Column>
                          <Text className="text-[11px] text-gray-400 uppercase tracking-wide m-0">
                            Check-out
                          </Text>
                          <Text className="text-sm text-[#1a1a2e] font-medium mt-0.5 mb-0">
                            {booking.checkOutDate}
                          </Text>
                        </Column>
                      </Row>
                    </Section>
                  ))}
                </>
              )}

              <Hr className="border-gray-200 my-5" />
              <Text className="text-xs text-gray-400 text-center m-0">
                This is an automated daily report from Rentals Manager. Sent at
                4:00 AM EAT.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
