import { useNavigate } from "react-router-dom";
import "./RegisterPage.css"
import sidegreen from "../images/sidebar.png"
import hi from "../images/hi.png"
import logoalt from "../images/logoalt.png"

function RegisterPage() {
  const navigate = useNavigate(); // inisialisasi

  return (
    <div className="page">
      <div className="sidebar">
        <img src={sidegreen || "/placeholder.svg"} alt="sidegreen" className="sidegreen" />
        <div className="sidebar-content">
          <img src={hi || "/placeholder.svg"} alt="hi" className="hi" />
          <div className="logo-welcome-section">
            <img src={logoalt || "/placeholder.svg"} alt="logoalt" className="logoalt" />
            <h1 className="welcome">Welcome back!</h1>
            <button type="button" className="signin-btn" onClick={() => navigate("/")}>
              Sign in
            </button>
          </div>
        </div>
      </div>

      <div className="form-container">
        <h1 className="create">Create Account</h1>
        <form method="GET" className="register-form">
          <input type="text" name="first_name" placeholder="First name" className="form-input" />
          <input type="text" name="last_name" placeholder="Last name" className="form-input" />
          <input type="username" name="username" placeholder="Username" className="form-input" required />
          <input
            type="tel"
            name="phone"
            placeholder="Phone number (+1234567890)"
            className="form-input"
            pattern="^\\+?[0-9]{10,15}$"
            required
          />
          <input type="password" name="password" placeholder="Password" className="form-input" />
          <button type="submit" name="action" value="signup" formaction="homepage.html" className="register-signup-btn">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
