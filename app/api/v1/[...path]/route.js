import { getAuthMode } from "@/lib/authConfig";
import { createMockAuthHandler } from "@/lib/mock/auth";

const handleMockAuth = createMockAuthHandler({ registered: process.env.MOCK_GOOGLE_REGISTERED === "true" });

async function handle(request, { params }) {
  if (getAuthMode() !== "mock") return new Response(null, { status: 404 });
  const { path } = await params;
  return handleMockAuth(request, path.join("/"));
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
