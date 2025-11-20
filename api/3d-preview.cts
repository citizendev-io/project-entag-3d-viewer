import { createBucket, fetchAccessToken, finalizeUpload, obtainSignedUrl, startTranslation, uploadFile } from "./autodesk_helpers";
import { fetchFileAndConvert } from "./autodesk_helpers/download";
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const { 'file-url': fileUrl, 'part-id': partId, 'bubble-app-url': bubbleAppUrl } = await req.json();

        if (!fileUrl || !partId || !bubbleAppUrl) {
            return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400 });
        }

        const accessToken = await fetchAccessToken();
        console.log("Access token obtained");

        const bucket = await createBucket(accessToken);
        const file = await fetchFileAndConvert(fileUrl);
        const signedUrl = await obtainSignedUrl(bucket, accessToken, file);
        await uploadFile(signedUrl.urls[0], file);

        const finalizingUploadResponse = await finalizeUpload(
            bucket, signedUrl.uploadKey, accessToken, file
        );

        const encodedFileURN = btoa(finalizingUploadResponse.objectId);
        const fileObjectKey = finalizingUploadResponse.objectKey;

        const translationResponse = await startTranslation(encodedFileURN, fileObjectKey, accessToken);
        const urn = translationResponse.urn;

        console.log("Translation started, URN:", urn);

        // Trigger Bubble Webhook
        try {
            await axios.post(bubbleAppUrl, {
                part_id: partId,
                urn: urn,
                status: "translation_started"
            });
            console.log("Bubble webhook triggered successfully");
        } catch (webhookError) {
            console.error("Failed to trigger Bubble webhook:", webhookError);
            // We still return success for the main operation, but maybe log this error
        }

        return new Response(JSON.stringify({
            success: true,
            urn: urn,
            message: "File processed and translation started. Webhook triggered."
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Error in 3d-preview endpoint:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error", details: (error as Error).message }), { status: 500 });
    }
}
