import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | KLASS",
  description: "Terms of Service for the KLASS community platform",
};

export default function TermsOfServicePage() {
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

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 8, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using KLASS (&quot;the Platform&quot;), operated by Blockstone Labs LLC 
            (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service 
            (&quot;Terms&quot;) and our <Link href="/acceptable-use" className="text-primary hover:underline">Acceptable Use Policy</Link>. 
            If you do not agree to these Terms, do not use the Platform.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            KLASS is a community platform that enables creators to build, manage, and monetize 
            online communities. The Platform provides tools for content delivery, member management, 
            course creation, events, and community engagement.
          </p>

          <h2>3. Eligibility</h2>
          <p>
            You must be at least 18 years old to use KLASS. By using the Platform, you represent 
            and warrant that you meet this age requirement and have the legal capacity to enter 
            into these Terms.
          </p>

          <h2>4. Account Registration</h2>
          <p>
            To access certain features, you must create an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Promptly update any information to keep it accurate</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>

          <h2>5. Acceptable Use</h2>
          <p>
            Your use of KLASS is subject to our <Link href="/acceptable-use" className="text-primary hover:underline">Acceptable Use Policy</Link>, 
            which is incorporated into these Terms by reference. You agree not to use the Platform 
            to create, upload, share, or monetize any content that violates our Acceptable Use Policy, 
            including but not limited to:
          </p>
          <ul>
            <li><strong>Adult Content:</strong> Nudity, explicit sexual acts, pornographic material, 
            or adult services of any kind</li>
            <li><strong>Intellectual Property Infringement:</strong> Copyright-infringing content, 
            pirated materials, or content that violates others&apos; proprietary rights</li>
            <li><strong>Violent Extremism & Hate Speech:</strong> Content that promotes, encourages, 
            or celebrates unlawful violence or hatred toward any group based on race, religion, 
            disability, gender, sexual orientation, national origin, or other protected characteristics</li>
            <li><strong>Illegal Activities:</strong> Content promoting fraud, illegal substances, 
            weapons trafficking, or other unlawful conduct</li>
          </ul>

          <h2>6. Creator Responsibilities</h2>
          <p>
            If you create or manage a community on KLASS, you additionally agree to:
          </p>
          <ul>
            <li>Ensure all content in your community complies with these Terms and applicable laws</li>
            <li>Moderate your community to prevent prohibited content</li>
            <li>Respond promptly to reports of policy violations</li>
            <li>Not use the Platform to collect payments for prohibited content or services</li>
            <li>Comply with all applicable tax and business regulations</li>
          </ul>

          <h2>7. Payments and Fees</h2>
          <p>
            Certain features require payment. By making a purchase, you agree to pay all applicable 
            fees. Payments are processed through our third-party payment processors. Refund policies 
            are determined by individual community creators, subject to applicable consumer protection laws.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            You retain ownership of content you create. By posting content, you grant KLASS a 
            non-exclusive, worldwide, royalty-free license to host, display, and distribute your 
            content as necessary to operate the Platform. You represent that you have all necessary 
            rights to the content you post.
          </p>

          <h2>9. Content Moderation</h2>
          <p>
            We reserve the right to review, remove, or disable access to any content that violates 
            these Terms or our Acceptable Use Policy. We may suspend or terminate accounts that 
            repeatedly violate our policies or engage in severe violations.
          </p>

          <h2>10. Termination</h2>
          <p>
            We may suspend or terminate your access to KLASS at any time for violations of these 
            Terms or for any other reason at our sole discretion. You may terminate your account 
            at any time by contacting us.
          </p>

          <h2>11. Disclaimers</h2>
          <p>
            THE PLATFORM IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE 
            UNINTERRUPTED ACCESS OR ERROR-FREE OPERATION. WE ARE NOT RESPONSIBLE FOR USER-GENERATED 
            CONTENT OR THE ACTIONS OF OTHER USERS.
          </p>

          <h2>12. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLOCKSTONE LABS LLC SHALL NOT BE LIABLE FOR 
            ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM 
            YOUR USE OF THE PLATFORM.
          </p>

          <h2>13. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Blockstone Labs LLC from any claims, damages, 
            or expenses arising from your use of the Platform, your content, or your violation of 
            these Terms.
          </p>

          <h2>14. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify users of material changes 
            via email or prominent notice on the Platform. Continued use after changes constitutes 
            acceptance of the new Terms.
          </p>

          <h2>15. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Georgia, USA, without regard to 
            conflict of law principles.
          </p>

          <h2>16. Contact</h2>
          <p>
            For questions about these Terms, contact us at:
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
