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
          "eyJhbGciOiJSUzI1NiIsImtpZCI6IlhrUFpfSmhoXzlTYzNZS01oRERBZFBWeFowOF9SUzI1NiIsInBpLmF0bSI6ImFzc2MifQ.eyJzY29wZSI6WyJ2aWV3YWJsZXM6cmVhZCJdLCJjbGllbnRfaWQiOiJCd1FZYzBOaGdhN1FLWkJ3NWdwVWhUdHVhT1ZpckE1RkZDVk1sMWpDQzBIcUpzSUEiLCJpc3MiOiJodHRwczovL2RldmVsb3Blci5hcGkuYXV0b2Rlc2suY29tIiwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20iLCJqdGkiOiJrSFhPSkZHYUZlbFRjajI4TzE2amVKQTRhcGJwZW80eUtBdERlZTR6czN6Q1RBQ1E1TzFBZmVHS3luUURycWpXIiwiZXhwIjoxNzMxNjY2NTMwLCJ1c2VyaWQiOiI0RjYyWDNRMk1FUVNLWkRXIn0.UlkWeR8u1HWONwyj_DhYSbbVqKyqfJDYduij9xEkp0PWv-frqEEj0kt9bsM6U5FFc8jKiJrWV2EHFHQG0_KprfaIiW_OJuBf5HmI1Wmue0p26w_LD4RYWk-kkGeugh2iKFfLWxzawi6qnFD-WDfpVJmCIfXnGAJkVyQ1Jr-nA4n6wJZQabXGvP_B_oDzLq5dUA7Kg3mTNttyM56kxE7HIN-mkortLAckt7eWMrRoFZTB98L_y_USe6HWjqYE_SpdkKchBAPB4Y4hm5VstAxNSFQHDfVHdrsWI4908q9iUWnzHjD6lxaZKyJZryHZYZJrh3IeAOi-wCBkSvsYdUK3Rw",
      };

      // Load Autodesk Viewer
      Autodesk.Viewing.Initializer(options, () => {
        const viewer = new Autodesk.Viewing.GuiViewer3D(viewerDiv);
        viewer.start();

        // Load default model
        const urn = "YOUR_MODEL_URN"; // Replace with a Base64 encoded URN
        Autodesk.Viewing.Document.load(
          `urn:${urn}`,
          (doc) => {
            const defaultViewable = doc.getRoot().getDefaultGeometry();
            viewer.loadDocumentNode(doc, defaultViewable);

            // Add logic for Explode functionality
            const explodeButton = document.getElementById("explode");
            let explodeState = false;
            explodeButton.addEventListener("click", () => {
              explodeState = !explodeState;
              viewer.explode(explodeState ? 1 : 0); // Adjust the explode intensity
            });
          },
          (err) => console.error("Error loading model: ", err)
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
        style={{ width: "70%", height: "50vh", background: "#f1f1f1" }}
      ></div>
      <div id="overlay" style={{ position: "absolute", top: 10, left: 10 }}>
        <select id="models"></select>
        <button id="explode">Toggle Explode</button>
      </div>
    </>
  );
}

export default App;
