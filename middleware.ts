import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that don't require authentication to access
const isPublicRoute = createRouteMatcher([
  "/",
  "/founders",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/demo(.*)",
  "/offline",
  "/terms",
  "/privacy",
  "/acceptable-use",
  "/redirect",
]);

// System admin routes require master admin access
const isSystemAdminRoute = createRouteMatcher(["/system-admin(.*)"]);

// Master admin IDs from environment variable
function getMasterAdminIds(): string[] {
  const ids = process.env.MASTER_ADMIN_IDS || "";
  return ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export default clerkMiddleware(async (auth, req) => {
  // Protect non-public routes - this also initializes auth context for all routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // System admin routes require master admin access
  if (isSystemAdminRoute(req)) {
    const { userId } = await auth();
    const masterAdminIds = getMasterAdminIds();

    if (!userId || !masterAdminIds.includes(userId)) {
      // Redirect non-master-admins to home
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
