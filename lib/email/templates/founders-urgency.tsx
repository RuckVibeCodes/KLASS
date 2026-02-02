import { Section, Text } from '@react-email/components';
import { BaseEmail } from './base-email';

interface FoundersUrgencyProps {
  firstName?: string;
  spotsRemaining?: number;
}

export const FoundersUrgency = ({ 
  firstName, 
  spotsRemaining = 77 
}: FoundersUrgencyProps) => (
  <BaseEmail firstName={firstName} previewText="77 → 54 (founder spots going fast)">
    <Section>
      <Text className="mb-4 text-gray-700">
        Quick update: <strong>{spotsRemaining} spots left</strong> in the Founding Member program.
      </Text>
      
      <Text className="mb-6 text-gray-700">
        {spotsRemaining < 50 && "That's less than half remaining. The clock is ticking."}
      </Text>
      
      <Section className="my-6 rounded-lg bg-green-50 p-6">
        <Text className="mb-4 text-lg font-bold text-green-900">
          What Founding Members get that Pro users never will:
        </Text>
        
        <Text className="mb-2 text-green-800">✓ Lifetime access — no monthly fees ever</Text>
        <Text className="mb-2 text-green-800">✓ All future features included</Text>
        <Text className="mb-2 text-green-800">✓ Founding Member badge on your profile</Text>
        <Text className="mb-2 text-green-800">✓ Priority support + direct line to me</Text>
        <Text className="mb-2 text-green-800">✓ Shape the product roadmap</Text>
        <Text className="mb-4 text-green-800">✓ Your name in the Founding Members hall of fame</Text>
        
        <Text className="text-sm text-green-700">
          Once 100 spots fill, this deal is gone. No extensions. No grandfathering for late joiners.
        </Text>
      </Section>
      
      <Text className="mb-4 text-gray-700">
        After spot #100, KLASS goes to <strong>$79/month</strong> ($948/year) for the exact same thing.
      </Text>
      
      <Text className="mb-6 text-gray-700">
        <strong>That's a $5,748 difference</strong> over 6 years. For the exact same platform.
      </Text>
      
      <Text className="text-lg font-semibold text-gray-900">
        The math is simple. The window is closing.
      </Text>
    </Section>
  </BaseEmail>
);

export default FoundersUrgency;
