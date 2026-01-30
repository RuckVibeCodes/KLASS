"use client";

import { useRouter } from "next/navigation";
import { CreatorOnboardingChecklist } from "@/components/admin/creator-onboarding-checklist";
import { dismissOnboarding, type OnboardingStatus } from "@/actions/onboarding";

interface Props {
  communitySlug: string;
  communityId: string;
  status: OnboardingStatus;
}

export function OnboardingChecklistWrapper({
  communitySlug,
  communityId,
  status,
}: Props) {
  const router = useRouter();

  const handleDismiss = async () => {
    await dismissOnboarding(communityId, communitySlug);
    router.refresh();
  };

  return (
    <CreatorOnboardingChecklist
      communitySlug={communitySlug}
      communityId={communityId}
      status={status}
      onDismiss={handleDismiss}
    />
  );
}
