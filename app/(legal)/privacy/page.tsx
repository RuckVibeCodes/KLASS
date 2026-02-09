import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | KLASS",
  description: "Privacy Policy for the KLASS community platform",
};

export default function PrivacyPolicyPage() {
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

        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 8, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Blockstone Labs LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates KLASS 
            (&quot;the Platform&quot;). This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you use our Platform.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, password, profile picture</li>
            <li><strong>Payment Information:</strong> Billing address, payment method details (processed by Stripe)</li>
            <li><strong>Content:</strong> Posts, comments, messages, files, and other content you create</li>
            <li><strong>Communications:</strong> Messages you send to us or other users</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Platform</li>
            <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
            <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
            <li><strong>Cookies:</strong> Session cookies and persistent cookies for functionality and analytics</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide, maintain, and improve the Platform</li>
            <li>Process transactions and send related information</li>
            <li>Send administrative messages, updates, and security alerts</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, prevent, and address fraud, abuse, and technical issues</li>
            <li>Personalize and improve your experience</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Information Sharing</h2>
          <p>We may share your information in the following circumstances:</p>
          <ul>
            <li><strong>With Community Creators:</strong> When you join a community, the creator may see your profile information and activity within their community</li>
            <li><strong>With Service Providers:</strong> Third-party vendors who perform services on our behalf (hosting, payment processing, analytics)</li>
            <li><strong>For Legal Reasons:</strong> When required by law or to protect our rights, privacy, safety, or property</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            <li><strong>With Your Consent:</strong> When you have given us permission to share</li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide 
            you services. We may retain certain information as required by law or for legitimate 
            business purposes.
          </p>

          <h2>6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your information 
            against unauthorized access, alteration, disclosure, or destruction. However, no method 
            of transmission over the Internet is 100% secure.
          </p>

          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Delete your personal information</li>
            <li>Object to or restrict certain processing</li>
            <li>Data portability</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p>
            To exercise these rights, contact us at privacy@blockstonelabs.com.
          </p>

          <h2>8. Cookies</h2>
          <p>
            We use cookies and similar technologies to collect information and improve the Platform. 
            You can control cookies through your browser settings. Disabling cookies may limit your 
            ability to use certain features.
          </p>

          <h2>9. Third-Party Links</h2>
          <p>
            The Platform may contain links to third-party websites. We are not responsible for the 
            privacy practices of these sites. We encourage you to review their privacy policies.
          </p>

          <h2>10. Children&apos;s Privacy</h2>
          <p>
            KLASS is not intended for users under 18 years of age. We do not knowingly collect 
            personal information from children under 18. If we learn we have collected such 
            information, we will delete it promptly.
          </p>

          <h2>11. International Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. 
            We take steps to ensure adequate protection for international transfers.
          </p>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material 
            changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            For questions about this Privacy Policy, contact us at:
          </p>
          <p>
            Blockstone Labs LLC<br />
            Email: privacy@blockstonelabs.com
          </p>
        </div>
      </div>
    </div>
  );
}
