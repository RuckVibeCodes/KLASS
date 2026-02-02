import { Resend } from 'resend';
import { render } from '@react-email/components';
import { EMAIL_TEMPLATES, EmailTemplate, FOUNDER_SEQUENCE } from './templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string;
  emailKey: string;
  props: Record<string, unknown>;
}

/**
 * Send an email using the template system
 */
export async function sendEmail({ to, emailKey, props }: SendEmailParams) {
  const template = EMAIL_TEMPLATES.find(t => t.key === emailKey);
  
  if (!template) {
    throw new Error(`Unknown email template: ${emailKey}`);
  }

  const emailComponent = template.component(props as any);
  const html = await render(emailComponent);
  const text = await render(emailComponent, { plainText: true });

  const result = await resend.emails.send({
    from: 'KLASS Founders <founders@klass.app>',
    to,
    subject: template.subject,
    html,
    text,
    tags: [
      { name: 'email_key', value: emailKey },
      { name: 'sequence', value: 'founders_nurture' },
    ],
  });

  return result;
}

/**
 * Get the delay in hours for a specific email in the sequence
 */
export function getEmailDelayHours(emailKey: string): number {
  const step = FOUNDER_SEQUENCE.find(s => s.emailKey === emailKey);
  return step?.delayHours ?? 0;
}

/**
 * Get template info by email key
 */
export function getTemplate(emailKey: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find(t => t.key === emailKey);
}

/**
 * Get all templates in sequence order
 */
export function getSequenceTemplates(): EmailTemplate[] {
  return FOUNDER_SEQUENCE.map(step => {
    const template = getTemplate(step.emailKey);
    if (!template) throw new Error(`Template not found: ${step.emailKey}`);
    return { ...template, delayHours: step.delayHours };
  });
}
