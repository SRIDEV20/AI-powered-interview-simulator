const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function getHealth() {
  const res = await fetch(`${baseUrl}/api/health`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json() as Promise<{ status: string; timestamp: string }>;
}