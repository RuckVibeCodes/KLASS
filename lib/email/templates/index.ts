import { ReactElement } from 'react';
import { FoundersWelcome } from './founders-welcome';
import { FoundersStory } from './founders-story';
import { FoundersCost } from './founders-cost';
import { FoundersSocialProof } from './founders-social-proof';
import { FoundersObjections } from './founders-objections';
import { FoundersUrgency } from './founders-urgency';
import { FoundersLastChance } from './founders-last-chance';

// Email template component type
export type EmailTemplateComponent = (props: Record<string, unknown>) => ReactElement<any, any>;

// Email template definitions
export interface EmailTemplate {
  key: string;
  name: string;
  subject: string;
  previewText: string;
  component: EmailTemplateComponent;
}

// All founder nurture email templates
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    key: 'welcome',
    name: 'Welcome + Lead Magnet',
    subject: 'Your Creator Community Checklist (+ something special)',
    previewText: 'Your Creator Community Checklist is here!',
    component: FoundersWelcome,
  },
  {
    key: 'value_story',
    name: 'The Story Behind KLASS',
    subject: 'Why I built KLASS (and quit paying $99/mo)',
    previewText: 'Why I built KLASS (and quit paying Skool $99/mo)',
    component: FoundersStory,
  },
  {
    key: 'pain_point',
    name: 'The Real Cost of Renting',
    subject: '$3,564 — that\'s what Skool costs over 3 years',
    previewText: '$3,564 — that\'s what Skool costs over 3 years',
    component: FoundersCost,
  },
  {
    key: 'social_proof',
    name: 'Creators Who Switched',
    subject: 'Creators switching from Skool — real stories',
    previewText: '"I moved 847 members from Skool in one weekend"',
    component: FoundersSocialProof,
  },
  {
    key: 'objection_handling',
    name: 'Objection Handling',
    subject: 'But I already have a community on Skool/Circle...',
    previewText: 'But I already have a community on Skool/Circle...',
    component: FoundersObjections,
  },
  {
    key: 'urgency',
    name: 'Urgency — Spots Going Fast',
    subject: '77 → 54 (founder spots going fast)',
    previewText: '77 spots left → why early matters',
    component: FoundersUrgency,
  },
  {
    key: 'last_chance',
    name: 'Last Chance',
    subject: 'Final reminder: $297 lifetime vs $79/mo forever',
    previewText: 'This is my last email about the founder deal',
    component: FoundersLastChance,
  },
];

// Map email key to template for quick lookup
export const EMAIL_TEMPLATE_MAP: Record<string, EmailTemplate> = 
  EMAIL_TEMPLATES.reduce((acc, template) => {
    acc[template.key] = template;
    return acc;
  }, {} as Record<string, EmailTemplate>);

// Props interface for each email
export interface EmailProps {
  welcome: { firstName?: string };
  value_story: { firstName?: string };
  pain_point: { firstName?: string };
  social_proof: { firstName?: string };
  objection_handling: { firstName?: string };
  urgency: { firstName?: string; spotsRemaining?: number };
  last_chance: { firstName?: string; spotsRemaining?: number };
}

// Default props for each email
export const DEFAULT_EMAIL_PROPS: Record<string, Record<string, unknown>> = {
  welcome: { firstName: '' },
  value_story: { firstName: '' },
  pain_point: { firstName: '' },
  social_proof: { firstName: '' },
  objection_handling: { firstName: '' },
  urgency: { firstName: '', spotsRemaining: 77 },
  last_chance: { firstName: '', spotsRemaining: 0 },
};

// Get template by email key
export function getTemplateByKey(key: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATE_MAP[key];
}

// Get all template keys
export function getTemplateKeys(): string[] {
  return EMAIL_TEMPLATES.map(t => t.key);
}

// Sequence definition for automation
export const FOUNDER_SEQUENCE = [
  { emailKey: 'welcome', delayHours: 0 },
  { emailKey: 'value_story', delayHours: 24 },
  { emailKey: 'pain_point', delayHours: 48 },
  { emailKey: 'social_proof', delayHours: 72 },
  { emailKey: 'objection_handling', delayHours: 96 },
  { emailKey: 'urgency', delayHours: 120 },
  { emailKey: 'last_chance', delayHours: 144 },
];
