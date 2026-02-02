import { Section, Text } from '@react-email/components';
import { BaseEmail } from './base-email';

interface FoundersStoryProps {
  firstName?: string;
}

export const FoundersStory = ({ firstName }: FoundersStoryProps) => (
  <BaseEmail firstName={firstName} previewText="Why I built KLASS (and quit paying $99/mo)">
    <Section>
      <Text className="mb-4 text-gray-700">
        I built communities on Skool. Paid thousands. Loved the product.
      </Text>
      
      <Text className="mb-4 text-gray-700">
        But something always bothered me...
      </Text>
      
      <Text className="mb-4 text-lg italic text-gray-800">
        Every time a new member joined, they saw <strong>someone else's logo</strong> at the top of the screen.
      </Text>
      
      <Text className="mb-4 text-gray-700">
        Not my logo. Not my brand. Someone else's platform, running on their infrastructure, with their name on it — and me paying $99/month for the privilege.
      </Text>
      
      <Text className="mb-4 text-gray-700">
        I was building <strong>their</strong> brand. My members were <strong>their</strong> users. And every month, another $99 disappeared.
      </Text>
      
      <Text className="mb-4 text-gray-700">
        So I asked: What if there was a platform that:
      </Text>
      
      <Text className="mb-2 pl-4 text-gray-700">• Actually let you white-label everything</Text>
      <Text className="mb-2 pl-4 text-gray-700">• Had AI that genuinely helped, not just buzzwords</Text>
      <Text className="mb-2 pl-4 text-gray-700">• Let you keep 100% of what you earn</Text>
      <Text className="mb-6 pl-4 text-gray-700">• Charged once, not forever</Text>
      
      <Text className="mb-4 text-gray-700">
        So I built KLASS. And now I'm sharing it with 100 creators who get it — Founding Members who want to own their community instead of renting it.
      </Text>
      
      <Text className="mb-4 text-gray-700">
        <strong>You're either early and paying $297 once...</strong>
      </Text>
      
      <Text className="text-gray-700">
        ...or you're paying $99/month forever to someone else. The choice is yours.
      </Text>
    </Section>
  </BaseEmail>
);

export default FoundersStory;
