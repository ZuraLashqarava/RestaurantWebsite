import "./Navbar.scss";
import logo from "./GeorgianFlag.png";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div 
  className="navbar__brand"
  onClick={() => navigate("/")}
  style={{ cursor: "pointer" }}
>
  <img
    src={logo}
    alt="Georgian Cuisine icon"
    className="navbar__brand-icon"
  />
  <span className="navbar__brand-name">GeorgianCuisine</span>
</div>

      <ul className="navbar__links">
        <li>
  <Link to="/menu" className="navbar__link">Menu</Link>
        </li>
     <li>
  <Link to="/booking" className="navbar__link navbar__link--cta">
    Book Online
  </Link>
</li>
       <li>
  <button
    className="navbar__link"
onClick={() => {
  if (location.pathname !== "/") {
    navigate("/");
    setTimeout(() => {
      document.getElementById("info")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  } else {
    document.getElementById("info")?.scrollIntoView({ behavior: "smooth" });
  }
}}
  >
    Information
  </button>
</li>
      </ul>

      <div className="navbar__actions">
        <button
          className="navbar__btn navbar__btn--login"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

        <button className="navbar__btn navbar__btn--cart" aria-label="Cart" onClick={() => navigate("/cart")}>
          <svg className="navbar__cart-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="navbar__cart-badge">0</span>
        </button>
      </div>
    </nav>
  );
  
};

export default Navbar;