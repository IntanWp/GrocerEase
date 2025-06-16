import "./Header.css"
import logo from "../images/logoalt.png"
import cartIcon from "../images/cart.png"
import bellIcon from "../images/bell.png"
import profileIcon from "../images/user1.png"

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <img src={logo || "/placeholder.svg"} alt="GrocerEase" className="logo" />
      </div>

      <div className="search-container">
        <input type="text" className="search-bar" placeholder="Search here" />
      </div>

      <div className="header-icons">
        <img src={cartIcon || "/placeholder.svg"} alt="Cart" className="icon" />
        <img src={bellIcon || "/placeholder.svg"} alt="Notifications" className="icon" />
        <img src={profileIcon || "/placeholder.svg"} alt="Profile" className="icon" />
      </div>
    </header>
  )
}

export default Header
