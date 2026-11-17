import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

export interface GuestCheckoutEmailProps {
  guestFirstName: string;
  propertyName: string;
  unitName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  /** Damaged/missing items found at inspection; empty when all was in order. */
  chargedItems: { itemName: string; damaged: number; missing: number }[];
  /** Pre-formatted (both currencies); null when there's nothing to charge. */
  damageTotal: string | null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Row className="mb-3">
      <Column className="w-1/3">
        <Text className="text-gray-500 text-sm m-0">{label}</Text>
      </Column>
      <Column className="w-2/3">
        <Text className="text-gray-800 text-sm font-medium m-0">{value}</Text>
      </Column>
    </Row>
  );
}

function describeCounts(damaged: number, missing: number) {
  return [damaged > 0 && `${damaged} damaged`, missing > 0 && `${missing} missing`]
    .filter(Boolean)
    .join(", ");
}

export function GuestCheckoutEmail({
  guestFirstName,
  propertyName,
  unitName,
  checkInDate,
  checkOutDate,
  nights,
  chargedItems,
  damageTotal,
}: GuestCheckoutEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        You&apos;ve been checked out of {propertyName}. Thank you for staying with us.
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
            <Section className="bg-brand rounded-t-lg px-8 py-6 text-center">
              <Heading className="text-white text-2xl font-bold m-0">
                Thank you for staying with us
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="bg-white px-8 py-6">
              <Text className="text-gray-700 text-base leading-6">Hi {guestFirstName},</Text>

              <Text className="text-gray-700 text-base leading-6">
                You&apos;ve been checked out of <strong>{unitName}</strong> at{" "}
                <strong>{propertyName}</strong>. We hope you enjoyed your stay.
              </Text>

              {/* Stay summary */}
              <Section className="bg-gray-50 rounded-lg p-6 my-6">
                <Heading className="text-gray-800 text-lg font-semibold mt-0 mb-4">
                  Your stay
                </Heading>

                <DetailRow label="Property" value={propertyName} />
                <DetailRow label="Unit" value={unitName} />
                <Hr className="border-gray-200 my-3" />
                <DetailRow label="Check-in" value={checkInDate} />
                <DetailRow label="Check-out" value={checkOutDate} />
                <DetailRow label="Length of stay" value={`${nights} ${nights === 1 ? "night" : "nights"}`} />
              </Section>

              {/* Damage & replacement charges: only when something was charged */}
              {damageTotal && (
                <Section className="bg-amber-50 border border-solid border-amber-200 rounded-lg p-6 my-6">
                  <Heading className="text-amber-900 text-lg font-semibold mt-0 mb-2">
                    Damage &amp; replacement charges
                  </Heading>
                  <Text className="text-amber-900 text-sm leading-6 mt-0">
                    {chargedItems.length > 0
                      ? "During the checkout inspection, the following items were found damaged or missing:"
                      : "During the checkout inspection, damage was found in the unit that carries a charge."}
                  </Text>

                  {chargedItems.map((item) => (
                    <Row key={item.itemName} className="mb-2">
                      <Column className="w-1/2">
                        <Text className="text-gray-800 text-sm m-0">{item.itemName}</Text>
                      </Column>
                      <Column className="w-1/2">
                        <Text className="text-gray-600 text-sm m-0 text-right">
                          {describeCounts(item.damaged, item.missing)}
                        </Text>
                      </Column>
                    </Row>
                  ))}

                  <Hr className="border-amber-200 my-3" />

                  <Row>
                    <Column className="w-1/2">
                      <Text className="text-gray-800 text-sm font-semibold m-0">Total charge</Text>
                    </Column>
                    <Column className="w-1/2">
                      <Text className="text-amber-900 text-lg font-bold m-0 text-right">
                        {damageTotal}
                      </Text>
                    </Column>
                  </Row>

                  <Text className="text-amber-900 text-sm leading-6 mb-0">
                    Our team will contact you shortly regarding settlement of this amount.
                  </Text>
                </Section>
              )}

              {/* Welcome back */}
              <Section className="bg-blue-50 rounded-lg p-6 my-6 text-center">
                <Heading className="text-brand text-lg font-semibold mt-0 mb-2">
                  We&apos;d love to host you again
                </Heading>
                <Text className="text-gray-700 text-sm leading-6 m-0">
                  Thank you for choosing {propertyName}. Whenever you&apos;re next in town, our
                  doors are open. We look forward to welcoming you back.
                </Text>
              </Section>

              <Text className="text-gray-600 text-sm leading-6">
                Warm regards,
                <br />
                The {propertyName} team
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 rounded-b-lg px-8 py-6 text-center">
              <Text className="text-gray-500 text-xs m-0">
                © {new Date().getFullYear()} {propertyName}. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}


export default GuestCheckoutEmail;
