import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Statistics from "@/pages/Statistics";
import Bills from "@/pages/Bills";
import ChoreSchedule from "@/pages/ChoreSchedule";
import WishList from "@/pages/WishList";
import Voting from "@/pages/Voting";
import Maintenance from "@/pages/Maintenance";
import Birthdays from "@/pages/Birthdays";
import Express from "@/pages/Express";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/chores" element={<ChoreSchedule />} />
        <Route path="/wishes" element={<WishList />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/birthdays" element={<Birthdays />} />
        <Route path="/express" element={<Express />} />
      </Routes>
    </Router>
  );
}
