import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </Router>
  );
}
