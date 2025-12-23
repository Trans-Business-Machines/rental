import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface ResetPasswordEmailProps {
  name?: string;
  resetLink: string;
  expiresIn?: string;
}

export function ResetPasswordEmail({
  name = "there",
  resetLink,
  expiresIn = "1 hour",
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your RentManager password</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans p-6">
          <Container className="bg-white max-w-lg mx-auto my-10 p-8 rounded-xl shadow-lg">
            {/* Header */}
            <Section className="text-center mb-6">
              <Heading className="text-2xl font-bold text-gray-900 m-0">
                Password Reset Request
              </Heading>
            </Section>

            {/* Greeting */}
            <Text className="text-gray-700 text-base mb-4">Hi {name},</Text>

            {/* Main Content */}
            <Text className="text-gray-700 text-base mb-4">
              We received a request to reset your password for your RentManager
              account. Click the button below to create a new password.
            </Text>

            {/* CTA Button - Removed hover: class */}
            <Section className="text-center my-8">
              <Link
                href={resetLink}
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-base no-underline"
              >
                Reset Password
              </Link>
            </Section>

            {/* Expiry Notice */}
            <Text className="text-gray-600 text-sm mb-4">
              This link will expire in{" "}
              <span className="font-semibold">{expiresIn}</span>. If you
              didn&apos;t request a password reset, you can safely ignore this
              email — your password will remain unchanged.
            </Text>

            {/* Alternative Link */}
            <Section className="bg-gray-50 p-4 rounded-lg mt-6">
              <Text className="text-gray-600 text-xs m-0 mb-2">
                If the button doesn&apos;t work, copy and paste this link into
                your browser:
              </Text>
              <Text className="text-blue-600 text-xs m-0 break-all">
                {resetLink}
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-gray-200 mt-8 pt-6">
              <Text className="text-gray-500 text-xs text-center m-0">
                This email was sent by RentManager. If you have any questions,
                please contact our support team.
              </Text>
              <Text className="text-gray-400 text-xs text-center mt-2">
                © {new Date().getFullYear()} RentManager. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ResetPasswordEmail;
