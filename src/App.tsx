import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Statistics from "@/pages/Statistics";
import Bills from "@/pages/Bills";
import ChoreSchedule from "@/pages/ChoreSchedule";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/chores" element={<ChoreSchedule />} />
      </Routes>
    </Router>
  );
}
