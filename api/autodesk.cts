import { createBucket, fetchAccessToken, finalizeUpload, obtainSignedUrl, startTranslation } from "./autodesk_helpers";
import { fetchFileAndConvert } from "./autodesk_helpers/download";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  const accessToken = await fetchAccessToken();

  console.log("Access token:", accessToken);

  const bucket = await createBucket(accessToken);
  const file = await fetchFileAndConvert(url as string);
  const signedUrl = await obtainSignedUrl(bucket, accessToken, file);
  const finalizingUploadResponse = await finalizeUpload(
    bucket,
    "AQICAHjdZwoyNEgA8bmp66wGy6Ir33V4OuZSbvd1MDQMJ4OfEwFcrzZzhEzJVS492dNtQCtmAAAB3jCCAdoGCSqGSIb3DQEHBqCCAcswggHHAgEAMIIBwAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAwrlYAtX3n8G_hBE5kCARCAggGRea9AGi5kl8ul9qybR4MOdmxPBzzATgd7RBp7m_KvLoGwh3NYZ-frW7QGyY65gxJuYt5QfRlNouFwhdOUAKZqfa6tH0tbr5Xztp1oNzRwzWgMykjSVGmE2E1lib61aSH1koYQyZJf9dcsh6z4THaoZXBv6wGCSC6KMRofM9VV5PEIdxw7ZgLMHutHEnmBHgyIbaZsq80KtAtygsCxVBgobkK4cbJp4H06RD1bnSwgw9r2oe4Q-7XyGVktcBrc1uCcPg2mEMN3Ix_xikUik-TM5ym1kkncr6DzSewnK5tKcqX_08j9KknRV",
    accessToken, file
  );

  const encodedFileURN = btoa(finalizingUploadResponse.objectId);
  const fileObjectKey = finalizingUploadResponse.objectKey;

  const urn = await startTranslation(encodedFileURN, fileObjectKey, accessToken);

  return new Response(urn);
}