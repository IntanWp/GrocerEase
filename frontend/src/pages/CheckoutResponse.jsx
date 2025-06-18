import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./CheckoutResponse.css"
import personImg from '../images/personhappy.png'

export default function OrderConfirmation() {
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)  }, [])

  const handleBackToHome = () => {
    navigate('/home', { replace: true });
  }

  return (<div className="confirmation-container">
      <div className="content-wrapper">
        <h1 className={`success-message ${isVisible ? "visible" : ""}`}>Your order has been placed successfully!</h1>
        
        <button 
          className={`back-button ${isVisible ? "visible" : ""}`} 
          onClick={handleBackToHome}
          type="button"
        >
          Back to Home
        </button>

        <img
          src={personImg}
          alt="Happy person celebrating"
          className={`happy-person-image ${isVisible ? "visible" : ""}`}
        />
      </div>
    </div>
  )
}
