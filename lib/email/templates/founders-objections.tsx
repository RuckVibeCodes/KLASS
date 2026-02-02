import { Section, Text } from '@react-email/components';
import { BaseEmail } from './base-email';

interface FoundersObjectionsProps {
  firstName?: string;
}

export const FoundersObjections = ({ firstName }: FoundersObjectionsProps) => (
  <BaseEmail firstName={firstName} previewText="But I already have a community on Skool/Circle...">
    <Section>
      <Text className="mb-4 text-gray-700">
        I hear you. "I'm already on Skool/Circle/Discord. I've built something there."
      </Text>
      
      <Text className="mb-6 text-lg font-semibold italic text-gray-800">
        Here's the truth: That's not loyalty. That's the sunk cost fallacy.
      </Text>
      
      <Text className="mb-4 text-gray-700">
        You're not losing what you built. Your members, your content, your community — <strong>it all comes with you.</strong>
      </Text>
      
      <Text className="mb-4 text-gray-700">
        The question isn't "should I switch?"
      </Text>
      
      <Text className="mb-6 text-xl font-bold text-gray-900">
        The question is: Do I want to own my brand, or keep paying monthly to rent someone else's?
      </Text>
      
      <Section className="my-6 rounded-lg bg-gray-50 p-6">
        <Text className="mb-3 font-semibold text-gray-900">Common concerns, answered:</Text>
        
        <Text className="mb-2 text-gray-700">
          <strong>"Migration sounds hard"</strong>
        </Text>
        <Text className="mb-4 text-sm text-gray-600">
          We help. KLASS has migration tools and we personally walk you through it. It's easier than you think.
        </Text>
        
        <Text className="mb-2 text-gray-700">
          <strong>"I already paid for this month"</strong>
        </Text>
        <Text className="mb-4 text-sm text-gray-600">
          No problem. Lock in the founder price now, migrate when your current subscription ends. You don't lose anything.
        </Text>
        
        <Text className="mb-2 text-gray-700">
          <strong>"What if I change my mind?"</strong>
        </Text>
        <Text className="text-sm text-gray-600">
          30-day money-back guarantee. Zero risk.
        </Text>
      </Section>
      
      <Text className="mb-4 text-gray-700">
        Every month you wait is another <strong>$99 gone</strong> — and another month building <strong>their</strong> brand instead of yours.
      </Text>
      
      <Text className="text-gray-700">
        Lock in now. Migrate when ready. The founder deal won't wait forever.
      </Text>
    </Section>
  </BaseEmail>
);

export default FoundersObjections;
