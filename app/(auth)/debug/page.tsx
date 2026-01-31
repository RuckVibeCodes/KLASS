import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DebugPage() {
  const { userId } = await auth();
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      <div className="bg-zinc-900 p-4 rounded-lg font-mono text-sm">
        <p><strong>Clerk User ID:</strong> {userId || "Not logged in"}</p>
        <p><strong>Email:</strong> {user?.emailAddresses?.[0]?.emailAddress || "N/A"}</p>
        <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
      </div>
      <p className="mt-4 text-zinc-400 text-sm">
        Share the Clerk User ID with Geoffrey to link your account.
      </p>
    </div>
  );
}
