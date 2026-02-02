import { Section, Text } from '@react-email/components';
import { BaseEmail } from './base-email';

interface FoundersLastChanceProps {
  firstName?: string;
  spotsRemaining?: number;
}

export const FoundersLastChance = ({ 
  firstName, 
  spotsRemaining 
}: FoundersLastChanceProps) => (
  <BaseEmail firstName={firstName} previewText="Final reminder: $297 lifetime vs $79/mo forever">
    <Section>
      <Text className="mb-4 text-lg font-semibold text-gray-900">
        This is it. My last email about the Founding Member deal.
      </Text>
      
      <Text className="mb-6 text-gray-700">
        I've shared the story, the math, the social proof, and the urgency. Now it's up to you.
      </Text>
      
      <Section className="my-6 rounded-lg bg-gray-100 p-6 text-center">
        <Text className="mb-2 text-3xl font-bold text-gray-900">$297</Text>
        <Text className="mb-4 text-gray-600">one-time payment</Text>
        
        <Text className="text-lg text-gray-800">VS</Text>
        
        <Text className="mt-4 mb-2 text-3xl font-bold text-gray-900">$79/month</Text>
        <Text className="text-gray-600">forever</Text>
        
        <Text className="mt-4 text-sm text-gray-500">
          ($948/year × 6 years = $5,688)
        </Text>
      </Section>
      
      <Text className="mb-4 text-gray-700">
        <strong>Quick recap:</strong>
      </Text>
      
      <Text className="mb-2 text-gray-700">• Lifetime access to KLASS platform</Text>
      <Text className="mb-2 text-gray-700">• Unlimited members (no per-member pricing)</Text>
      <Text className="mb-2 text-gray-700">• Full white-label branding</Text>
      <Text className="mb-2 text-gray-700">• All AI features included</Text>
      <Text className="mb-2 text-gray-700">• All future updates included</Text>
      <Text className="mb-6 text-gray-700">• Priority support</Text>
      
      <Text className="mb-6 text-gray-700">
        After today, this offer disappears. When 100 spots fill, <strong>everyone pays $79/month</strong> for the same thing.
      </Text>
      
      <Section className="my-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
        <Text className="m-0 text-sm font-medium text-red-800">
          P.S. — 30-day money-back guarantee. No questions asked. Zero risk.
        </Text>
      </Section>
      
      <Text className="text-gray-700">
        Either way, I appreciate you being here. Building something takes courage. I hope you build it on KLASS.
      </Text>
    </Section>
  </BaseEmail>
);

export default FoundersLastChance;
