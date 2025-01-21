import { fetchAccessToken } from "@/helpers/autodesk";

export async function GET() {
  const accessToken = await fetchAccessToken();

  return new Response(accessToken);
}