// import { createBucket, fetchAccessToken, finalizeUpload, obtainSignedUrl, startTranslation } from "./autodesk_helpers";
// import { fetchFileAndConvert } from "./autodesk_helpers/download";

export async function GET(req: Request) {
  const rawRes = await req.text()
  // console.log(await req.text())
  // const { url } = JSON.parse(await req.text())

  // const accessToken = await fetchAccessToken();
  // const bucket = await createBucket(accessToken);
  // const file = await fetchFileAndConvert(url);
  // const signedUrl = await obtainSignedUrl(bucket, accessToken, file);
  // const finalizingUploadResponse = await finalizeUpload(bucket, signedUrl.uploadKey, accessToken, file);

  // const encodedFileURN = btoa(finalizingUploadResponse.objectId);
  // const fileObjectKey = finalizingUploadResponse.objectKey;

  // const urn = await startTranslation(encodedFileURN, fileObjectKey, accessToken);

  return new Response(rawRes);
}