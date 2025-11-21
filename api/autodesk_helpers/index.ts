const fetchAccessToken = async (clientId: string, clientSecret: string) => {
  try {
    const credentials = btoa(`${clientId}:${clientSecret}`);
    const response = await fetch(
      "https://developer.api.autodesk.com/authentication/v2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          scope:
            "code:all data:write data:read data:create bucket:create bucket:delete bucket:read viewables:read",
        }).toString(),
      }
    );

    if (!response.ok) {
      console.error(`Error fetching access token: ${response.statusText}`);
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Access token obtained successfully");
    return data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
};

const createBucket = async (accessToken: string) => {
  try {
    const bucketData = {
      bucketKey: Date.now().toString(),
      access: "full",
      policyKey: "transient",
    };
    const response = await fetch(
      "https://developer.api.autodesk.com/oss/v2/buckets",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(bucketData),
      }
    );
    console.log("response", response);

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Bucket created:", data);
    return data.bucketKey;
  } catch (error) {
    console.error("Error creating bucket:", error);
  }
};

const obtainSignedUrl = async (_bucketKey: string, accessToken: string, selectedFile: File) => {
  try {
    const response = await fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets/${_bucketKey}/objects/${selectedFile?.name.replace(/\.[^.]+$/, '')}/signeds3upload?minutesExpiration=10`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("response of obtaining signedUrl", response);

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Signed URL obtained:", data);
    return data;
  } catch (error) {
    console.error("Error creating bucket:", error);
  }
};

const uploadFile = async (url: string, selectedFile: File) => {
  if (!selectedFile) {
    console.error("No file selected");
    return false;
  }
  try {
    // Read the file content
    const arrayBuffer = await selectedFile?.arrayBuffer();
    // Convert ArrayBuffer to Uint8Array
    const binaryData = new Uint8Array(arrayBuffer);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: binaryData,
    });

    if (!response.ok) {
      console.error(response);
      throw new Error("File upload failed");
    }

    console.log("Upload successful:", response);
    return response;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

const finalizeUpload = async (_bucketKey: string, uploadKey: string, accessToken: string, selectedFile: File) => {
  try {
    const response = await fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets/${_bucketKey}/objects/${selectedFile?.name.replace(/\.[^.]+$/, '')}/signeds3upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadKey: uploadKey,
        }),
      }
    );
    console.log("response of finalizing upload", response);

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Finalize upload:", data);

    return data.objectId;
  } catch (error) {
    console.error("Error finalizing upload:", error);
  }
};

const startTranslation = async (
  ossEncodedSourceFileURN: string,
  ossSourceFileObjectKey: string,
  accessToken: string
) => {
  try {
    const response = await fetch(
      "https://developer.api.autodesk.com/modelderivative/v2/designdata/job",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            urn: ossEncodedSourceFileURN,
            rootFilename: ossSourceFileObjectKey,
            compressedUrn: false,
          },
          output: {
            destination: {
              region: "us",
            },
            formats: [
              {
                type: "svf2",
                views: ["2d", "3d"],
              },
              {
                type: "thumbnail",
                advanced: {
                  width: 400,
                  height: 400
                }
              }
            ],
          },
        }),
      }
    );
    console.log("response of translation", response);

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Translation job:", data);
    return data;
  } catch (error) {
    console.error("Error translating:", error);
    throw error;
  }
};

const getManifest = async (urn: string, accessToken: string) => {
  try {
    const response = await fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching manifest: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Manifest status: ${data.status} - ${data.progress}`);
    return data;
  } catch (error) {
    console.error("Error getting manifest:", error);
    throw error;
  }
};

const getThumbnail = async (urn: string, accessToken: string) => {
  try {
    const response = await fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/thumbnail?width=400&height=400`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching thumbnail: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log("Thumbnail fetched successfully");
    return arrayBuffer;
  } catch (error) {
    console.error("Error getting thumbnail:", error);
    throw error;
  }
};

export {
  fetchAccessToken,
  createBucket,
  obtainSignedUrl,
  uploadFile,
  finalizeUpload,
  startTranslation,
  getManifest,
  getThumbnail
}
