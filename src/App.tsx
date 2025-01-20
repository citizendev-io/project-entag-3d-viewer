import { Route, Routes } from "react-router-dom";
import Viewer from "@/pages/Viewer";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Welcome to the Home page</div>} />
      <Route path="/viewer" element={<Viewer />} />
    </Routes>
  );
}

export default App;
