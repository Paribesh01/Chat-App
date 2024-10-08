import { BrowserRouter, Route, Routes, } from "react-router-dom";
import Home from "./pages/home/page";
import Game from "./pages/game/page";
import "./index.css"

function App() {



  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </BrowserRouter >
    </>
  )
}

export default App
