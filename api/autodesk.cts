import { fetchAccessToken } from "./autodesk_helpers";

export async function GET() {
  const accessToken = await fetchAccessToken();

  return new Response(accessToken);
}