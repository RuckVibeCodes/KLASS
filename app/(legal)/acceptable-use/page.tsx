import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Acceptable Use Policy | KLASS",
  description: "Acceptable Use Policy for the KLASS community platform",
};

export default function AcceptableUsePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-2">Acceptable Use Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 8, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Overview</h2>
          <p>
            This Acceptable Use Policy (&quot;AUP&quot;) governs your use of KLASS and applies to all 
            users, including community creators, members, and visitors. This policy is incorporated 
            into and forms part of our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>.
          </p>
          <p>
            KLASS is committed to maintaining a safe, lawful, and respectful environment. The 
            following content and activities are strictly prohibited on our platform.
          </p>

          <h2>Prohibited Content</h2>

          <h3>1. Adult Content and Services</h3>
          <p>
            <strong>KLASS strictly prohibits</strong> the creation, upload, distribution, or 
            monetization of adult content, including but not limited to:
          </p>
          <ul>
            <li>Nudity or sexually explicit images, videos, or audio</li>
            <li>Pornographic or sexually suggestive content</li>
            <li>Adult live streaming or video chat services</li>
            <li>Subscriber-only nude or explicit content</li>
            <li>Sexual services or escort services</li>
            <li>Content depicting sexual acts or fetish content</li>
            <li>Sexually explicit written content or stories</li>
          </ul>

          <h3>2. Intellectual Property Infringement</h3>
          <p>
            <strong>KLASS strictly prohibits</strong> content that infringes on intellectual 
            property or proprietary rights, including:
          </p>
          <ul>
            <li>Pirated software, music, movies, books, or other copyrighted materials</li>
            <li>Leaked or stolen content (e.g., unreleased albums, private photos)</li>
            <li>Counterfeit goods or unauthorized reproductions</li>
            <li>Content that violates trademarks, patents, or trade secrets</li>
            <li>Unauthorized use of others&apos; creative works</li>
            <li>Tools or tutorials for circumventing copyright protections</li>
          </ul>

          <h3>3. Violent Extremism and Hate Speech</h3>
          <p>
            <strong>KLASS strictly prohibits</strong> content that engages in, encourages, promotes, 
            or celebrates:
          </p>
          <ul>
            <li>Unlawful violence or terrorism</li>
            <li>Hate speech or discrimination based on race, ethnicity, or national origin</li>
            <li>Hate speech or discrimination based on religion or religious beliefs</li>
            <li>Hate speech or discrimination based on gender or gender identity</li>
            <li>Hate speech or discrimination based on sexual orientation</li>
            <li>Hate speech or discrimination based on disability</li>
            <li>Hate speech or discrimination based on any other protected characteristic</li>
            <li>Extremist ideologies or terrorist organizations</li>
            <li>Incitement to violence against individuals or groups</li>
            <li>Glorification of mass violence or violent events</li>
          </ul>

          <h3>4. Harmful or Dangerous Content</h3>
          <p>The following content is also prohibited:</p>
          <ul>
            <li>Content that exploits, harms, or endangers minors</li>
            <li>Promotion of self-harm, suicide, or eating disorders</li>
            <li>Dangerous challenges or activities that could cause injury</li>
            <li>Graphic violence, gore, or gratuitously violent content</li>
            <li>Animal cruelty or abuse</li>
          </ul>

          <h3>5. Illegal Activities</h3>
          <p>The following activities and content are prohibited:</p>
          <ul>
            <li>Fraud, scams, or deceptive practices</li>
            <li>Sale or promotion of illegal drugs or controlled substances</li>
            <li>Weapons trafficking or sales of illegal weapons</li>
            <li>Money laundering or financial crimes</li>
            <li>Human trafficking or exploitation</li>
            <li>Hacking tools, malware, or instructions for illegal computer access</li>
            <li>Personal information of others without consent (doxxing)</li>
          </ul>

          <h3>6. Harassment and Abuse</h3>
          <p>The following behaviors are prohibited:</p>
          <ul>
            <li>Harassment, bullying, or intimidation of other users</li>
            <li>Stalking or unwanted contact</li>
            <li>Threats of violence or harm</li>
            <li>Impersonation of others</li>
            <li>Coordinated inauthentic behavior or brigading</li>
          </ul>

          <h3>7. Misinformation</h3>
          <p>The following content is prohibited:</p>
          <ul>
            <li>Dangerous health misinformation that could cause harm</li>
            <li>Election or voting misinformation</li>
            <li>Manipulated media intended to deceive</li>
          </ul>

          <h2>Enforcement</h2>
          <p>
            We take violations of this Acceptable Use Policy seriously. Upon discovering or 
            receiving reports of violations, we may take any of the following actions:
          </p>
          <ul>
            <li>Issue a warning to the user</li>
            <li>Remove or disable the violating content</li>
            <li>Temporarily suspend the user&apos;s account</li>
            <li>Permanently terminate the user&apos;s account</li>
            <li>Report illegal activity to law enforcement</li>
            <li>Withhold payments for content that violates this policy</li>
            <li>Terminate creator accounts and communities</li>
          </ul>
          <p>
            Severe violations, including child exploitation, terrorism, or imminent threats of 
            violence, will result in immediate account termination and may be reported to 
            appropriate authorities.
          </p>

          <h2>Reporting Violations</h2>
          <p>
            If you encounter content that violates this Acceptable Use Policy, please report it 
            immediately by contacting us at:
          </p>
          <p>
            Email: abuse@blockstonelabs.com
          </p>
          <p>
            We review all reports and take appropriate action in accordance with this policy.
          </p>

          <h2>Community Creator Responsibilities</h2>
          <p>
            Community creators are responsible for moderating their communities and ensuring 
            compliance with this policy. Creators must:
          </p>
          <ul>
            <li>Actively monitor their communities for prohibited content</li>
            <li>Remove violating content promptly upon discovery or report</li>
            <li>Not create communities centered around prohibited content</li>
            <li>Cooperate with KLASS in investigating policy violations</li>
          </ul>
          <p>
            Failure to moderate a community may result in the suspension or termination of the 
            community and the creator&apos;s account.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Acceptable Use Policy from time to time. We will notify users of 
            material changes. Continued use of KLASS after changes constitutes acceptance of the 
            updated policy.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about this Acceptable Use Policy, contact us at:
          </p>
          <p>
            Blockstone Labs LLC<br />
            Email: legal@blockstonelabs.com
          </p>
        </div>
      </div>
    </div>
  );
}
