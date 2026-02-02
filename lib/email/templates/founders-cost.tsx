import { Section, Text } from '@react-email/components';
import { BaseEmail } from './base-email';

interface FoundersCostProps {
  firstName?: string;
}

export const FoundersCost = ({ firstName }: FoundersCostProps) => (
  <BaseEmail firstName={firstName} previewText="$3,564 — that's what Skool costs over 3 years">
    <Section>
      <Text className="mb-6 text-gray-700">
        Let's do some math. I promise it won't hurt.
      </Text>
      
      <Section className="my-6 rounded-lg bg-gray-100 p-6">
        {/* Skool Row */}
        <div className="flex justify-between pb-3">
          <span className="text-gray-600">Skool ($99/mo)</span>
          <span className="font-semibold">$1,188/year</span>
        </div>
        <div className="border-t border-gray-300 py-2 text-center text-sm text-gray-500">
          Over 3 years: <span className="font-bold text-red-600">$3,564</span>
        </div>
        
        {/* Circle Row */}
        <div className="mt-6 flex justify-between pb-3">
          <span className="text-gray-600">Circle ($89/mo)</span>
          <span className="font-semibold">$1,068/year</span>
        </div>
        <div className="border-t border-gray-300 py-2 text-center text-sm text-gray-500">
          Over 3 years: <span className="font-bold text-red-600">$3,204</span>
        </div>
        
        {/* KLASS Row */}
        <div className="mt-6 flex justify-between border-t border-gray-300 pt-4">
          <span className="text-xl font-bold text-green-700">KLASS Founding Member</span>
          <span className="text-xl font-bold text-green-700">$297</span>
        </div>
        <div className="py-2 text-center text-sm font-medium text-green-600">
          Total. Forever. No monthly fees.
        </div>
      </Section>
      
      <Text className="mb-4 text-2xl font-bold text-gray-900">
        Save $2,907+ over 3 years.
      </Text>
      
      <Text className="mb-4 text-gray-700">
        But here's the thing — <strong>cost isn't even the real problem.</strong>
      </Text>
      
      <Text className="mb-4 text-lg font-semibold text-gray-800">
        The real problem: Your members see THEIR brand, not yours.
      </Text>
      
      <Text className="mb-4 text-gray-700">
        White-label isn't a "nice to have" feature. It's <strong>respect for what you're building.</strong>
      </Text>
      
      <Text className="mb-4 text-gray-700">
        Every month you rent, you're building equity for someone else's company — not yours.
      </Text>
      
      <Text className="text-gray-700">
        $297 once. Or $3,564 every 3 years. The math is simple.
      </Text>
    </Section>
  </BaseEmail>
);

export default FoundersCost;
