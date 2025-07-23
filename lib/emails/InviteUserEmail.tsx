import { Body, Container, Html, Link, Tailwind, Text } from '@react-email/components';

export function InviteUserEmail({ name, inviteLink, invitedByName }: { name: string; inviteLink: string; invitedByName: string }) {
  return (
    <Html>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white max-w-lg mx-auto my-10 p-8 rounded-xl shadow">
            <Text className="text-2xl font-bold mb-2 text-gray-900">You are invited to join RentManager</Text>
            <Text className="mb-4 text-gray-700">Hi {name},</Text>
            <Text className="mb-4 text-gray-700">{invitedByName} has invited you to join RentManager. Click the button below to set your password and activate your account.</Text>
            <div className="my-6 text-center">
              <Link href={inviteLink} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg">
                Accept Invitation
              </Link>
            </div>
            <Text className="text-gray-500 text-xs mt-8">If you did not expect this invitation, you can safely ignore this email.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
} 