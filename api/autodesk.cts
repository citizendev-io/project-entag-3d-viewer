import { createBucket, fetchAccessToken, finalizeUpload, obtainSignedUrl, startTranslation } from "./autodesk_helpers";
import { fetchFileAndConvert } from "./autodesk_helpers/download";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  const accessToken = await fetchAccessToken();
  const bucket = await createBucket(accessToken);
  const file = await fetchFileAndConvert(url as string);
  const signedUrl = await obtainSignedUrl(bucket, accessToken, file);
  const finalizingUploadResponse = await finalizeUpload(bucket, signedUrl.uploadKey, accessToken, file);

  const encodedFileURN = btoa(finalizingUploadResponse.objectId);
  const fileObjectKey = finalizingUploadResponse.objectKey;

  const urn = await startTranslation(encodedFileURN, fileObjectKey, accessToken);

  return new Response(urn);
}