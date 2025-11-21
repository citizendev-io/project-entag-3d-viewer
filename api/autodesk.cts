import { createBucket, fetchAccessToken, finalizeUpload, obtainSignedUrl, startTranslation, uploadFile } from "./autodesk_helpers";
import { fetchFileAndConvert } from "./autodesk_helpers/download";

export async function POST(req: Request) {
  try {
    console.log("Step 1: Request received");
    const body = await req.json();
    const { url, part_id, version, client_id, client_secret } = body;

    if (!url || !part_id || !version || !client_id || !client_secret) {
      console.error("Missing required parameters");
      return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400 });
    }

    // Step 2: Get Access Token
    console.log("Step 2: Fetching access token started");
    const accessToken = await fetchAccessToken(client_id, client_secret);
    console.log("Step 2: Fetching access token completed");

    // Step 3: Create Bucket
    console.log("Step 3: Creating bucket started");
    const bucket = await createBucket(accessToken);
    console.log("Step 3: Creating bucket completed");

    // Step 4: Fetch and Upload File
    console.log("Step 4: Fetching and uploading file started");
    const file = await fetchFileAndConvert(url as string);
    const signedUrl = await obtainSignedUrl(bucket, accessToken, file);
    await uploadFile(signedUrl.urls[0], file);
    console.log("Step 4: Fetching and uploading file completed");

    // Step 5: Finalize Upload
    console.log("Step 5: Finalizing upload started");
    const finalizingUploadResponse = await finalizeUpload(
      bucket, signedUrl.uploadKey, accessToken, file
    );
    const encodedFileURN = btoa(finalizingUploadResponse.objectId);
    const fileObjectKey = finalizingUploadResponse.objectKey;
    console.log("Step 5: Finalizing upload completed");

    // Step 6: Start Translation
    console.log("Step 6: Starting translation started");
    const translationResponse = await startTranslation(encodedFileURN, fileObjectKey, accessToken);
    const urn = translationResponse.urn;
    console.log("Step 6: Starting translation completed, URN:", urn);

    // Return URN and access token for Bubble to handle thumbnail fetching
    return new Response(JSON.stringify({
      success: true,
      urn,
      accessToken
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Error in autodesk endpoint:", error);
    return new Response(JSON.stringify({ error: "Process failed", details: error.message }), { status: 500 });
  }
}