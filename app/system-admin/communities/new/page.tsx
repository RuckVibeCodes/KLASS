import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewCommunityForm } from "./new-community-form";

export default function NewCommunityPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/system-admin/communities"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Communities
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Provision New Community</h1>
        <p className="text-muted-foreground">
          Create a new community with default modules and settings
        </p>
      </div>

      <NewCommunityForm />
    </div>
  );
}
