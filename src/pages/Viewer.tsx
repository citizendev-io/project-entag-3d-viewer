'use client'

import { useCallback, useEffect, useState } from "react";
import "@/App.css";
import { fetchFileAndConvert } from "@/helpers/download"
import axios from "axios";
import { convertImageToBase64 } from "@/helpers/base64converter";

function Viewer() {
  const searchParams = new URLSearchParams(window.location.search);

  // Get search params
  const url = searchParams.get("url")
  const part_id = searchParams.get("part_id")
  const version = searchParams.get("version")
  const requested_urn = searchParams.get("urn")

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [objectId, setObjectId] = useState<string>("");
  const [urn, setUrn] = useState<string | null>(
    requested_urn ? atob(requested_urn) : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
              "code:all data:write data:read bucket:create bucket:delete bucket:read viewables:read",
          }).toString(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setAccessToken(data.access_token);
      return data.access_token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      const token = await fetchAccessToken();
      setAccessToken(token); // This updates accessToken state
    };
    initializeApp();
  }, []); // Fetch token only once on mount

  useEffect(() => {
    if (accessToken) {
      const fetchData = async () => {
        const file = await fetchFileAndConvert(url || "");
        setSelectedFile(file);
      };
      fetchData();
    }
  }, [accessToken, url]);

  const createBucket = useCallback(async () => {
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
  }, [accessToken]);

  const obtainSignedUrl = useCallback(async (_bucketKey: string) => {
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
      console.log("Signed URL obtained:", data);
      return data;
    } catch (error) {
      console.error("Error creating bucket:", error);
    }
  }, [accessToken, selectedFile?.name]);

  const uploadFile = useCallback(async (url: string) => {
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
  }, [selectedFile]);

  const finalizeUpload = useCallback(async (_bucketKey: string, uploadKey: string) => {
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
  }, [accessToken, selectedFile?.name]);

  const startTranslation = useCallback(async (
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
  }, [accessToken]);

  const checkTranslationStatus = useCallback(async (urn: string) => {
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
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !urn) return;
    const initializeViewer = async () => {
      const viewerDiv = document.getElementById("viewer");
      const options = {
        env: "AutodeskProduction",
        accessToken: accessToken,
      };
      const viewer = new Autodesk.Viewing.GuiViewer3D(viewerDiv, {});
      // Load Autodesk Viewer

      if (requested_urn) {
        Autodesk.Viewing.Initializer(options, () => {
          viewer.start();

          Autodesk.Viewing.Document.load(
            requested_urn,
            (doc: {
              getRoot: () => {
                (): unknown;
                new(): unknown;
                getDefaultGeometry: { (): unknown; new(): unknown };
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
          )
        });
      } else {
        Autodesk.Viewing.Initializer(options, () => {
          viewer.start();

          Autodesk.Viewing.Document.load(
            `urn:${btoa(objectId || "")}`,
            (doc: {
              getRoot: () => {
                (): unknown;
                new(): unknown;
                getDefaultGeometry: { (): unknown; new(): unknown };
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

              viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function () {
                viewer.utilities.fitToView();
                viewer.getScreenShot(500, 500, async function (blobURL: string) {
                  await axios.post(
                    "/api/bubble-trigger",
                    {
                      version: version,
                      part_id: part_id,
                      image: {
                        filename: selectedFile?.name.split(".")[0] + ".png",
                        contents: (await convertImageToBase64(blobURL)).replace("data:image/png;base64,", ""),
                        attach_to: part_id
                      },
                      urn
                    }
                  )
                })
              });
            },
            (err: unknown) => console.error("Error loading model: ", err)
          );
        });
      }


      setIsLoading(false);
    };
    if (urn) {
      const pollingTranslationJob = setInterval(async () => {
        if (requested_urn) {
          initializeViewer();
        } else {
          const checkStatusResponse = await checkTranslationStatus(urn);
          console.log("polling...", checkStatusResponse);

          if (checkStatusResponse.hasThumbnail === "true") {
            console.log("interval cleared!");
            initializeViewer();

            clearInterval(pollingTranslationJob);
          }
        }
      }, 2000);
    }
  }, [accessToken, checkTranslationStatus, objectId, part_id, requested_urn, selectedFile?.name, urn, version]);

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
  }, [createBucket, finalizeUpload, obtainSignedUrl, requested_urn, selectedFile, startTranslation, uploadFile]);

  return (
    <>
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
          <div style={{
            position: "absolute",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: "100%",
            height: "100vh",
          }}><div
            style={{
              margin: "auto",
              left: "0",
              top: "0",
              marginLeft: 'auto',
              marginRight: 'auto',
              width: "400px",
              height: "400px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #036d35",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div></div>

        )}
      </div>
    </>
  );
}

export default Viewer;
