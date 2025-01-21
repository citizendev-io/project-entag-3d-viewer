const fetchAccessToken = async () => {
  try {
    const response = await fetch(
      "https://developer.api.autodesk.com/authentication/v2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic QndRWWMwTmhnYTdRS1pCdzVncFVoVHR1YU9WaXJBNUZGQ1ZNbDFqQ0MwSHFKc0lBOlNZdjc1ejFXQ0NBTXUxbWtYRGxhUnZJMDJUNDY4Mk5QaFNNNml5WWNzczZzejBTd0NwM24wYW02cWplZUc5MW4=",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          scope:
            "code:all data:write data:read data:create bucket:create bucket:delete bucket:read viewables:read",
        }).toString(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
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
  }
};

export {
  fetchAccessToken,
  createBucket,
  obtainSignedUrl,
  finalizeUpload,
  startTranslation
}