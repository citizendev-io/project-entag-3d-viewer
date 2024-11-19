import { useEffect } from "react";
import "./App.css";

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access-token");
    const urn = params.get("urn");

    // Initialize the Autodesk Viewer
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

        // Load default model
        Autodesk.Viewing.Document.load(
          `urn:${btoa(urn || "")}`,
          (doc: {
            getRoot: () => {
              (): any;
              new (): any;
              getDefaultGeometry: { (): any; new (): any };
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
          (err: any) => console.error("Error loading model: ", err)
        );
      });
    };

    initializeViewer();
  }, []);

  return (
    <div
      id="viewer"
      style={{ width: "100%", height: "50vh", background: "#f1f1f1" }}
    ></div>
  );
}

export default App;
