import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";


const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.rentalsmanager.app";

interface BookingRequestRejectedEmailProps {
  agentName: string;
  guestName: string;
  propertyName: string;
  unitName: string;
  checkInDate: string;
  checkOutDate: string;
  rejectionReason: string;
}


export function BookingRequestRejectedEmail({
  agentName,
  guestName,
  propertyName,
  unitName,
  checkInDate,
  checkOutDate,
  rejectionReason,
}: BookingRequestRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Booking Request Rejected - {guestName} at {propertyName}
      </Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#0077B6",
                "brand-dark": "#005f8f",
              },
            },
          },
        }}
      >
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-xl">
            {/* Header */}
            <Section className="bg-red-600 rounded-t-lg px-8 py-6 text-center">
              <Heading className="text-white text-2xl font-bold m-0">
                Booking Request Rejected
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="bg-white px-8 py-6">
              <Text className="text-gray-700 text-base leading-6">
                Hi {agentName},
              </Text>

              <Text className="text-gray-700 text-base leading-6">
                Unfortunately, your booking request has been{" "}
                <strong className="text-red-600">rejected</strong>. Please
                review the reason below and feel free to submit a new request
                if applicable.
              </Text>

              {/* Rejection Reason */}
              <Section className="bg-red-50 border border-red-200 rounded-lg p-4 my-6">
                <Text className="text-red-800 text-sm font-semibold m-0 mb-2">
                  Reason for Rejection:
                </Text>
                <Text className="text-red-700 text-sm m-0">
                  {rejectionReason}
                </Text>
              </Section>

              {/* Request Details */}
              <Section className="bg-gray-50 rounded-lg p-6 my-6">
                <Heading className="text-gray-800 text-lg font-semibold mt-0 mb-4">
                  Request Details
                </Heading>

                <Row className="mb-3">
                  <Column className="w-1/3">
                    <Text className="text-gray-500 text-sm m-0">Guest</Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-gray-800 text-sm font-medium m-0">
                      {guestName}
                    </Text>
                  </Column>
                </Row>

                <Row className="mb-3">
                  <Column className="w-1/3">
                    <Text className="text-gray-500 text-sm m-0">Property</Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-gray-800 text-sm font-medium m-0">
                      {propertyName}
                    </Text>
                  </Column>
                </Row>

                <Row className="mb-3">
                  <Column className="w-1/3">
                    <Text className="text-gray-500 text-sm m-0">Unit</Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-gray-800 text-sm font-medium m-0">
                      {unitName}
                    </Text>
                  </Column>
                </Row>

                <Hr className="border-gray-200 my-3" />

                <Row className="mb-3">
                  <Column className="w-1/3">
                    <Text className="text-gray-500 text-sm m-0">Check-in</Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-gray-800 text-sm font-medium m-0">
                      {checkInDate}
                    </Text>
                  </Column>
                </Row>

                <Row>
                  <Column className="w-1/3">
                    <Text className="text-gray-500 text-sm m-0">Check-out</Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-gray-800 text-sm font-medium m-0">
                      {checkOutDate}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* CTA Button */}
              <Section className="text-center my-6">
                <Link
                  href={`${baseUrl}/booking-requests/new`}
                  className="bg-brand text-white text-sm font-semibold px-6 py-3 rounded-lg no-underline inline-block"
                >
                  Submit New Request
                </Link>
              </Section>

              <Text className="text-gray-600 text-sm leading-6">
                If you believe this was a mistake or have questions, please
                contact the admin team.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 rounded-b-lg px-8 py-6 text-center">
              <Text className="text-gray-500 text-xs m-0">
                © {new Date().getFullYear()} Rentals Manager. All rights
                reserved.
              </Text>
              <Link
                href={baseUrl}
                className="text-brand text-xs no-underline mt-2 inline-block"
              >
                www.rentalsmanager.app
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}