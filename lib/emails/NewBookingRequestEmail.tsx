import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface NewBookingRequestEmailProps {
  adminName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyName: string;
  unitName: string;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  totalAmount: string;
  requestedBy: string;
  requestUrl: string;
}

export function NewBookingRequestEmail({
  adminName = "Admin",
  guestName = "",
  guestEmail = "",
  guestPhone = "",
  propertyName = "",
  unitName = "",
  checkInDate = "",
  checkOutDate = "",
  totalNights = 0,
  totalAmount = "",
  requestedBy = "",
  requestUrl = "",
}: NewBookingRequestEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        New booking request - {guestName} at {propertyName}
      </Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#0077B6",
              },
            },
          },
        }}
      >
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-10 py-10 px-8 max-w-3xl rounded-lg">
            {/* Header */}
            <Section className="text-center w-full mb-4">
              <Heading
                as="h1"
                className="text-gray-900 font-bold text-2xl tracking-tight mb-4"
              >
                Rentals Manager
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="mb-4">
              <Heading
                as="h2"
                className="text-gray-800 font-semibold text-xl mb-4"
              >
                New Booking Request
              </Heading>

              <Text className="text-gray-700 text-base leading-7 mb-4">
                Hi {adminName},
              </Text>

              <Text className="text-gray-700 text-base leading-7 mb-4">
                A new booking request has been submitted by{" "}
                <strong>{requestedBy}</strong> and requires your review.
              </Text>
            </Section>

            {/* Guest Details Card */}
            <Section className="bg-gray-50 rounded-lg p-6 mb-4 border border-gray-200">
              <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">
                Guest Details
              </Text>

              <Text className="text-gray-700 text-base mb-2">
                <strong>Name:</strong> {guestName}
              </Text>
              <Text className="text-gray-700 text-base mb-2">
                <strong>Email:</strong> {guestEmail}
              </Text>
              <Text className="text-gray-700 text-base mb-0">
                <strong>Phone:</strong> {guestPhone}
              </Text>
            </Section>

            {/* Booking Details Card */}
            <Section className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
              <Text className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-4">
                Booking Details
              </Text>

              <Text className="text-gray-700 text-base mb-2">
                <strong>Property:</strong> {propertyName}
              </Text>
              <Text className="text-gray-700 text-base mb-2">
                <strong>Unit:</strong> {unitName}
              </Text>
              <Text className="text-gray-700 text-base mb-2">
                <strong>Check-in:</strong> {checkInDate}
              </Text>
              <Text className="text-gray-700 text-base mb-2">
                <strong>Check-out:</strong> {checkOutDate}
              </Text>
              <Text className="text-gray-700 text-base mb-2">
                <strong>Duration:</strong> {totalNights} night
                {totalNights !== 1 ? "s" : ""}
              </Text>
              <Text className="text-gray-700 text-base mb-0">
                <strong>Total Amount:</strong>{" "}
                <span className="text-green-600 font-semibold">
                  {totalAmount}
                </span>
              </Text>
            </Section>

            {/* Action Text */}
            <Section className="mb-4">
              <Text className="text-gray-700 text-base leading-7 mb-4">
                Please review this request and approve or reject it at your
                earliest convenience.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="text-center py-2 mb-4">
              <Button
                href={requestUrl}
                className="bg-brand text-white py-4 px-8 rounded-lg inline-block text-base font-bold"
              >
                Review Booking Request
              </Button>
            </Section>

            {/* Fallback Link */}
            <Section className="mb-4">
              <Text className="text-gray-700 text-sm leading-7 mb-2">
                Or copy and paste this link into your browser:
              </Text>
              <Text className="text-blue-600 text-sm break-all">
                {requestUrl}
              </Text>
            </Section>

            <Hr className="border-gray-200 my-5" />

            {/* Footer Note */}
            <Section className="mb-6">
              <Text className="text-gray-500 text-sm leading-6 mb-0">
                This is an automated notification from Rentals Manager. Please
                do not reply to this email.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-5" />

            {/* Footer */}
            <Section>
              <Text className="text-gray-400 text-xs text-center m-0">
                Rentals Manager &copy; {new Date().getFullYear()} - Property
                Management System
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
