import { Section, Text, Row, Column, Img, Hr } from '@react-email/components';
import { BaseEmail } from './base-email';

interface FoundersSocialProofProps {
  firstName?: string;
}

export const FoundersSocialProof = ({ firstName }: FoundersSocialProofProps) => (
  <BaseEmail firstName={firstName} previewText="Creators switching from Skool — real stories">
    <Section>
      <Text className="mb-6 text-gray-700">
        Real stories from creators who stopped renting and started owning.
      </Text>
      
      <Section className="my-6 rounded-lg border border-gray-200 p-6">
        <Row>
          <Column className="w-16 align-top">
            <Img
              src="https://klass.app/images/testimonials/sarah.jpg"
              width="48"
              height="48"
              alt="Sarah K."
              className="rounded-full"
            />
          </Column>
          <Column className="align-top">
            <Text className="m-0 text-base font-semibold text-gray-900">Sarah K.</Text>
            <Text className="m-0 text-sm text-gray-500">Course Creator</Text>
          </Column>
        </Row>
        <Hr className="my-4 border-gray-100" />
        <Text className="text-gray-700">
          "I moved 847 members from Skool in one weekend. KLASS made the migration stupid simple. Now my members see MY brand, not Skool's. And I saved $99/month."
        </Text>
      </Section>
      
      <Section className="my-6 rounded-lg border border-gray-200 p-6">
        <Row>
          <Column className="w-16 align-top">
            <Img
              src="https://klass.app/images/testimonials/marcus.jpg"
              width="48"
              height="48"
              alt="Marcus T."
              className="rounded-full"
            />
          </Column>
          <Column className="align-top">
            <Text className="m-0 text-base font-semibold text-gray-900">Marcus T.</Text>
            <Text className="m-0 text-sm text-gray-500">Community Builder</Text>
          </Column>
        </Row>
        <Hr className="my-4 border-gray-100" />
        <Text className="text-gray-700">
          "Built my first course outline using KLASS AI in 30 minutes. It actually understood what I was teaching and suggested a structure that made sense. Not just generic fluff."
        </Text>
      </Section>
      
      <Section className="my-6 rounded-lg border border-gray-200 p-6">
        <Row>
          <Column className="w-16 align-top">
            <Img
              src="https://klass.app/images/testimonials/jenna.jpg"
              width="48"
              height="48"
              alt="Jenna M."
              className="rounded-full"
            />
          </Column>
          <Column className="align-top">
            <Text className="m-0 text-base font-semibold text-gray-900">Jenna M.</Text>
            <Text className="m-0 text-sm text-gray-500">Coach</Text>
          </Column>
        </Row>
        <Hr className="my-4 border-gray-100" />
        <Text className="text-gray-700">
          "My members literally think I built KLASS myself. The white-label is that good. Zero branding from the parent company. This is what I've been looking for for 3 years."
        </Text>
      </Section>
      
      <Text className="mt-6 mb-4 text-gray-700">
        <strong>What these creators have in common:</strong> They stopped renting someone else's platform and started building their own brand equity.
      </Text>
      
      <Text className="text-gray-700">
        23 founders already in. <strong>77 spots left at $297 lifetime.</strong>
      </Text>
    </Section>
  </BaseEmail>
);

export default FoundersSocialProof;
