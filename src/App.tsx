import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [objectId, setObjectId] = useState<string>("");
  const [urn, setUrn] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   try {
  //     event.preventDefault();
  //     setIsLoading(true);
  //     const bucketKey = await createBucket();
  //     const signedUrlResponse = await obtainSignedUrl(bucketKey);
  //     const isUploaded = await uploadFile(signedUrlResponse.urls[0]);
  //     console.log("calling uploading file...", isUploaded);
  //     const finalizingUploadResponse = await finalizeUpload(
  //       bucketKey,
  //       signedUrlResponse.uploadKey
  //     );
  //     console.log("calling finalizing...", finalizingUploadResponse);
  //     const encodedFileURN = btoa(finalizingUploadResponse.objectId);
  //     const fileObjectKey = finalizingUploadResponse.objectKey;
  //     const translationResponse = await startTranslation(
  //       encodedFileURN,
  //       fileObjectKey
  //     );
  //     console.log("calling translation job...", translationResponse);
  //   } catch (error) {
  //     setIsLoading(false);
  //     console.error(error);
  //   }
  // };

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
              "code:all data:write data:read bucket:create bucket:delete bucket:read",
          }).toString(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log("Access token received:", data.access_token);
      setAccessToken(data.access_token);
      return data.access_token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
  };

  const createBucket = async () => {
    try {
      const bucketData = {
        bucketKey: Date.now().toString(), // Replace with actual bucket key
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
      // setBucketKey(data.bucketKey);
      console.log("Bucket created:", data);
      return data.bucketKey;
    } catch (error) {
      console.error("Error creating bucket:", error);
    }
  };

  const obtainSignedUrl = async (_bucketKey: string) => {
    try {
      const response = await fetch(
        `https://developer.api.autodesk.com/oss/v2/buckets/${_bucketKey}/objects/${selectedFile?.name}/signeds3upload?minutesExpiration=10`,
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
      // setUploadUrl(data.urls[0]);
      console.log("Signed URL obtained:", data);
      return data;
    } catch (error) {
      console.error("Error creating bucket:", error);
    }
  };

  const uploadFile = async (url: string) => {
    if (!selectedFile) {
      console.error("No file selected");
      return false;
    }
    try {
      console.log("upload url:", url);
      const arrayBuffer = await selectedFile?.arrayBuffer(); // Read the file content
      const binaryData = new Uint8Array(arrayBuffer); // Convert ArrayBuffer to Uint8Array
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

  const finalizeUpload = async (_bucketKey: string, uploadKey: string) => {
    try {
      const response = await fetch(
        `https://developer.api.autodesk.com/oss/v2/buckets/${_bucketKey}/objects/${selectedFile?.name}/signeds3upload`,
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
      setObjectId(data.objectId);
      console.log("Finalize upload:", data);
      return data;
    } catch (error) {
      console.error("Error finalizing upload:", error);
    }
  };

  const startTranslation = async (
    ossEncodedSourceFileURN: string,
    ossSourceFileObjectKey: string
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
      setUrn(data.urn);
      console.log("Translation job:", data);
      return data;
    } catch (error) {
      console.error("Error translating:", error);
    }
  };

  const checkTranslationStatus = async (urn: string) => {
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
      console.log("response of check translation status", response);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Check status of translation job:", data);
      return data;
    } catch (error) {
      console.error("Error checking status of translation job:", error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await fetchAccessToken();
    };
    initializeApp();
  }, []);

  useEffect(() => {
    const initializeViewer = async () => {
      const viewerDiv = document.getElementById("viewer");
      const options = {
        env: "AutodeskProduction",
        accessToken: accessToken,
      };

      // Load Autodesk Viewer
      Autodesk.Viewing.Initializer(options, () => {
        const viewer = new Autodesk.Viewing.GuiViewer3D(viewerDiv, {});
        viewer.start();

        // const decodedUrn = decodeURIComponent(urn || "");
        // console.log(decodedUrn);

        // Load default model
        Autodesk.Viewing.Document.load(
          `urn:${btoa(objectId || "")}`,
          (doc: {
            getRoot: () => {
              (): unknown;
              new (): unknown;
              getDefaultGeometry: { (): unknown; new (): unknown };
            };
          }) => {
            const defaultViewable = doc.getRoot().getDefaultGeometry();
            viewer.loadDocumentNode(doc, defaultViewable);

            // Add logic for Explode functionality
            const explodeButton = document.getElementById("explode");
            let explodeState = false;
            explodeButton?.addEventListener("click", () => {
              explodeState = !explodeState;
              viewer.explode(explodeState ? 1 : 0); // Adjust the explode intensity
            });
          },
          (err: unknown) => console.error("Error loading model: ", err)
        );
      });
      setIsLoading(false);
    };
    if (urn) {
      const pollingTranslationJob = setInterval(async () => {
        const checkStatusResponse = await checkTranslationStatus(urn);
        console.log("polling...", checkStatusResponse);

        if (checkStatusResponse.hasThumbnail === "true") {
          console.log("interval cleared!");
          initializeViewer();
          clearInterval(pollingTranslationJob);
        }
      }, 2000);
    }
    // return ()=>{clearInterval(pollingTranslationJob)};
  }, [urn]);

  useEffect(() => {
    const handleSubmit = async () => {
      try {
        setIsLoading(true);
        const bucketKey = await createBucket();
        const signedUrlResponse = await obtainSignedUrl(bucketKey);
        const isUploaded = await uploadFile(signedUrlResponse.urls[0]);
        console.log("calling uploading file...", isUploaded);
        const finalizingUploadResponse = await finalizeUpload(
          bucketKey,
          signedUrlResponse.uploadKey
        );
        console.log("calling finalizing...", finalizingUploadResponse);
        const encodedFileURN = btoa(finalizingUploadResponse.objectId);
        const fileObjectKey = finalizingUploadResponse.objectKey;
        const translationResponse = await startTranslation(
          encodedFileURN,
          fileObjectKey
        );
        console.log("calling translation job...", translationResponse);
      } catch (error) {
        console.error(error);
      }
    };
    if (selectedFile) {
      handleSubmit();
    }
  }, [selectedFile]);

  return (
    <>
      <form
        // onSubmit={handleSubmit}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 99, // Ensure form is on top of the viewer
          background: "#000000", // Optional: To ensure form stands out if overlapping
          padding: "10px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
        }}
      >
        <div className="c">
          <input
            required
            type="file"
            id="file-input"
            onChange={handleFileChange}
          />
        </div>
        {selectedFile && <p>Selected File: {selectedFile.name}</p>}
        {/* <button
          id="btn-upload-file"
          type="submit"
          style={{
            backgroundColor: "#036d35",
            color: "#FFFFFF",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: 600,
          }}
          disabled={!selectedFile}
        >
          Upload
        </button> */}
      </form>
      <div
        id="viewer"
        style={{
          width: "100%",
          height: "100vh",
          background: "#f1f1f1",
          position: "absolute",
        }}
      >
        {isLoading && (
          <div
            style={{
              margin: "20px auto",
              position: "absolute",
              left: "40%",
              top: "40%",
              width: "400px",
              height: "400px",
              border: "4px solid #f3f3f3", // Light gray
              borderTop: "4px solid #036d35", // Blue
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
        )}
      </div>
    </>
  );
}

export default App;
