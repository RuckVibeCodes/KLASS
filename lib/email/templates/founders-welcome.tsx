import { Section, Text, Img, Row, Column, Link } from '@react-email/components';
import { BaseEmail } from './base-email';

interface FoundersWelcomeProps {
  firstName?: string;
}

export const FoundersWelcome = ({ firstName }: FoundersWelcomeProps) => (
  <BaseEmail firstName={firstName} previewText="Your Creator Community Checklist is here!">
    <Section>
      <Text className="mb-4 text-gray-700">
        Thanks for joining — you're clearly serious about building something real.
      </Text>
      
      <Text className="mb-4 text-gray-700">
        Here's your <strong>Creator Community Launch Checklist</strong> — your 50-point guide to launching a paid community that actually pays.
      </Text>
      
      <Section className="my-6 rounded-lg bg-gray-50 p-6 text-center">
        <Img
          src="https://klass.app/images/creator-checklist.png"
          width="120"
          height="160"
          alt="Creator Community Launch Checklist"
          className="mx-auto"
        />
        <Text className="mt-4 text-sm font-medium text-gray-700">
          📄 Creator Community Launch Checklist
        </Text>
        <Link
          href="https://klass.app/downloads/creator-checklist.pdf"
          className="mt-2 inline-block text-sm text-brand-600 underline"
        >
          Download PDF
        </Link>
      </Section>
      
      <Text className="mb-4 text-gray-700">
        Quick intro to KLASS: We're building the <strong>first white-label creator platform</strong> that actually respects your brand. No "Powered by Skool" badges. No monthly rent. Just your community, your brand, your rules.
      </Text>
      
      <Text className="mb-4 text-gray-700">
        <strong>The Founding Member deal:</strong> 77/100 spots remaining at <strong>$297 lifetime access</strong>. No monthly fees. Ever.
      </Text>
      
      <Text className="mb-4 text-gray-700">
        Over the next week, I'll share:
      </Text>
      
      <Row>
        <Column className="w-6 text-center">✓</Column>
        <Column className="pb-2 text-sm text-gray-700">Why I built KLASS (and quit paying $99/mo)</Column>
      </Row>
      <Row>
        <Column className="w-6 text-center">✓</Column>
        <Column className="pb-2 text-sm text-gray-700">The real cost of renting your platform</Column>
      </Row>
      <Row>
        <Column className="w-6 text-center">✓</Column>
        <Column className="pb-2 text-sm text-gray-700">Stories from creators who switched</Column>
      </Row>
      <Row>
        <Column className="w-6 text-center">✓</Column>
        <Column className="pb-2 text-sm text-gray-700">Why early adopters win big</Column>
      </Row>
      
      <Text className="mt-6 text-gray-700">
        P.S. — Reply and tell me what you're building. I read every email.
      </Text>
    </Section>
  </BaseEmail>
);

export default FoundersWelcome;
