'use client'

import { useEffect, useState } from "react";

function Viewer() {
  const searchParams = new URLSearchParams(window.location.search);
  const requested_urn = searchParams.get("urn");
  const requested_token = searchParams.get("access_token");

  const [accessToken, setAccessToken] = useState<string>(requested_token || "");
  const [urn] = useState<string | null>(requested_urn);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (requested_token) {
      setAccessToken(requested_token);
    }
  }, [requested_token]);

  useEffect(() => {
    if (!accessToken || !urn) return;

    const initializeViewer = async () => {
      const viewerDiv = document.getElementById("viewer");
      if (!viewerDiv) {
        console.error("Viewer div not found");
        return;
      }

      // @ts-ignore
      const viewer = new Autodesk.Viewing.GuiViewer3D(viewerDiv, {});

      const options = {
        env: "AutodeskProduction",
        accessToken: accessToken,
      };

      // @ts-ignore
      Autodesk.Viewing.Initializer(options, () => {
        viewer.start();

        // @ts-ignore
        Autodesk.Viewing.Document.load(
          `urn:${urn}`,
          // @ts-ignore
          (doc: Autodesk.Viewing.Document) => {
            const defaultViewable = doc.getRoot().getDefaultGeometry();
            viewer.loadDocumentNode(doc, defaultViewable);

            // Add logic for Explode functionality
            const explodeButton = document.getElementById("explode");
            let explodeState = false;
            explodeButton?.addEventListener("click", () => {
              explodeState = !explodeState;
              viewer.explode(explodeState ? 1 : 0);
            });

            // @ts-ignore
            viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function () {
              viewer.fitToView();
              setIsLoading(false);
            });
          },
          (err: unknown) => {
            console.error("Error loading model: ", err);
            setIsLoading(false);
          }
        );
      });
    };

    initializeViewer();
  }, [accessToken, urn]);

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
            zIndex: 100,
            pointerEvents: 'none'
          }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #036d35",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}
      </div>
    </>
  );
}

export default Viewer;
