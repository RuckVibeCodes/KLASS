import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface BaseEmailProps {
  firstName?: string;
  children: React.ReactNode;
  previewText?: string;
}

export const BaseEmail = ({
  firstName,
  children,
  previewText = 'Welcome to KLASS - The founder community awaits',
}: BaseEmailProps) => {
  const userName = firstName || 'there';

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: {
                  50: '#f0fdf4',
                  100: '#dcfce7',
                  500: '#22c55e',
                  600: '#16a34a',
                  700: '#15803d',
                  900: '#14532d',
                },
              },
              fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
              },
            },
          },
        }}
      >
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto max-w-[600px] py-8">
            {/* Logo Header */}
            <Section className="mb-6 text-center">
              <Img
                src="https://klass.app/logo.png"
                width="40"
                height="40"
                alt="KLASS"
                className="mx-auto"
              />
              <Text className="mt-3 text-xl font-bold text-gray-900">
                KLASS
              </Text>
            </Section>

            {/* Main Content */}
            <Container className="rounded-lg bg-white p-8 shadow-sm">
              <Text className="mb-6 text-lg text-gray-700">
                Hey {userName},
              </Text>
              {children}
            </Container>

            {/* CTA Button */}
            <Section className="mt-6 text-center">
              <Button
                href="https://klass.app/founders"
                className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-base font-semibold text-white no-underline"
              >
                Claim Your Founder Spot
              </Button>
            </Section>

            {/* Footer */}
            <Hr className="my-8 border-gray-200" />

            <Section className="text-center">
              <Text className="text-sm text-gray-500">
                KLASS - The White-Label Creator Platform
              </Text>
              <Text className="mt-2 text-xs text-gray-400">
                You're receiving this because you signed up for creator
                updates.{' '}
                <Link
                  href="https://klass.app/unsubscribe"
                  className="text-gray-400 underline"
                >
                  Unsubscribe
                </Link>{' '}
                anytime.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BaseEmail;
