import { useEffect } from "react";
import "./App.css";

function App() {
  useEffect(() => {
    // Initialize the Autodesk Viewer
    const initializeViewer = async () => {
      const viewerDiv = document.getElementById("viewer");
      const options = {
        env: "AutodeskProduction",
        accessToken:
          "eyJhbGciOiJSUzI1NiIsImtpZCI6IlhrUFpfSmhoXzlTYzNZS01oRERBZFBWeFowOF9SUzI1NiIsInBpLmF0bSI6ImFzc2MifQ.eyJzY29wZSI6WyJjb2RlOmFsbCIsImRhdGE6d3JpdGUiLCJkYXRhOnJlYWQiLCJidWNrZXQ6Y3JlYXRlIiwiYnVja2V0OmRlbGV0ZSIsImJ1Y2tldDpyZWFkIl0sImNsaWVudF9pZCI6IkJ3UVljME5oZ2E3UUtaQnc1Z3BVaFR0dWFPVmlyQTVGRkNWTWwxakNDMEhxSnNJQSIsImlzcyI6Imh0dHBzOi8vZGV2ZWxvcGVyLmFwaS5hdXRvZGVzay5jb20iLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbSIsImp0aSI6Im1tSEM5eEZQSUFyMGoyQjBYMVpPazVrdHRiUkMzOUptQWdMSXF6RzVqTWRsaXZUc3BheEZpV3YxY2s5QUxxVmwiLCJleHAiOjE3MzE5NDk5MTZ9.L0HNEsVXlPG6xn347CLFXrTG0hXPgelaoueN0vKoEPUOOArCeMatb3qLHfUtrAgMkG2DgF1-usmiZJO0nRGCDWoQ9XVyZBDgKH3eV6LJgknXCN3nUx6tHoi5QtktSz5Y_O0tmOKng_jzpmgjH-HLVmcyXmGaupJ6UooCk4lRA6nKnTS1ySL0N1SDsfzJG_mzqG4xgNN909zpOoY4eOQB4OcQuOHC7ibF1XGSEd2MIM21EbTj_McUZB8jwNsYC5-eDXrzvXHfWDw75SXiTmm4pajqi8gFX6FJdO4JphDH30Qh5YYcS1lfWwO8ytHTkTF76jmgdpphiDhfGmXFSIc2ug",
      };

      // Load Autodesk Viewer
      Autodesk.Viewing.Initializer(options, () => {
        const viewer = new Autodesk.Viewing.GuiViewer3D(viewerDiv, {});
        viewer.start();

        // Load default model
        const urn =
          "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZW50YWdidWNrZXRrZXkwMDQvU3VzcGVuc2lvbi56aXA="; // Replace with a Base64 encoded URN
        Autodesk.Viewing.Document.load(
          `urn:${urn}`,
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
    <>
      <h1>Entag</h1>
      <div
        id="viewer"
        style={{ width: "100%", height: "50vh", background: "#f1f1f1" }}
      ></div>
    </>
  );
}

export default App;
