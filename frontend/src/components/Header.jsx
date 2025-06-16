import "./Header.css"
import logo from "../images/logoalt.png" // pastikan ini logo GrocerEase
import cartIcon from "../images/cart.png" // ikon keranjang
import profileIcon from "../images/user1.png" // ikon profil

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <a href="/home" className="logo-link">
          <img src={logo || "/placeholder.svg"} alt="GrocerEase" className="logo" />
          <span className="brand"></span>
        </a>
      </div>
      <input type="text" className="search-bar" placeholder="Search here" />
      <div className="header-icons">
        <a href="/cart" className="icon-link">
          <img src={cartIcon || "/placeholder.svg"} alt="Cart" className="icon" />
        </a>
        <a href="/account" className="icon-link">
          <img src={profileIcon || "/placeholder.svg"} alt="Profile" className="icon" />
        </a>
      </div>
    </header>
  )
}

export default Header
