import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import Menu from "./components/Menu/Menu";
import Cart from "./components/Cart/Cart";
import Booking from "./components/Booking/Booking";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/booking" element={<Booking />} />
      </Routes>
    </>
  );
};

export default App;