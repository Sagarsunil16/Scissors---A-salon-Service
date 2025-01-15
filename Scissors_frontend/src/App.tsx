import Login from "./Pages/Admin/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
      </Routes>
    </Router>
  )
}