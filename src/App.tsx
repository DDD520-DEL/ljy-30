import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Statistics from "@/pages/Statistics";
import Bills from "@/pages/Bills";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/bills" element={<Bills />} />
      </Routes>
    </Router>
  );
}
