import { createBucket, fetchAccessToken, finalizeUpload, obtainSignedUrl, startTranslation, uploadFile, getManifest, getThumbnail } from "./autodesk_helpers";
import { fetchFileAndConvert } from "./autodesk_helpers/download";
import axios from 'axios';

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

    // Step 7: Poll for Thumbnail
    console.log("Step 7: Polling for thumbnail started");
    let thumbnailReady = false;
    const maxRetries = 30; // 30 * 2s = 60s timeout
    let retries = 0;

    while (!thumbnailReady && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      const manifest = await getManifest(urn, accessToken);

      if (manifest.status === "success" || manifest.derivatives?.[0]?.children?.some((c: any) => c.role === "thumbnail")) {
        thumbnailReady = true;
      } else if (manifest.status === "failed") {
        throw new Error("Translation failed");
      }
      retries++;
    }

    if (!thumbnailReady) {
      throw new Error("Thumbnail generation timed out");
    }
    console.log("Step 7: Polling for thumbnail completed");

    // Step 8: Get Thumbnail
    console.log("Step 8: Fetching thumbnail started");
    const thumbnailBuffer = await getThumbnail(urn, accessToken);
    const base64Image = Buffer.from(thumbnailBuffer).toString('base64');
    console.log("Step 8: Fetching thumbnail completed");

    // Step 9: Trigger Bubble Webhook
    console.log("Step 9: Triggering Bubble webhook started");
    const bubblePayload = {
      version: version,
      part_id: part_id,
      image: {
        filename: `${file.name.split('.')[0]}.png`,
        contents: base64Image,
        attach_to: part_id
      },
      urn: urn
    };

    const bubbleResponse = await axios.post(
      `https://entag-10502.bubbleapps.io/version-${version}/api/1.1/wf/create_3d_preview`,
      {
        part_id,
        image: bubblePayload.image,
        private: false,
        version,
        urn
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer bae073c7b9b6abf8d88992dd8fffc7c3` // This token was hardcoded in bubble-trigger.cts
        }
      }
    );
    console.log("Step 9: Triggering Bubble webhook completed", bubbleResponse.data);

    return new Response(JSON.stringify({ success: true, urn, bubble_response: bubbleResponse.data }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Error in autodesk endpoint:", error);
    return new Response(JSON.stringify({ error: "Process failed", details: error.message }), { status: 500 });
  }
}