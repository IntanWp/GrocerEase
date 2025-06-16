import "./CheckOutPage.css"
import Header from "../components/Header"
import Breadcrumbs from "../components/Breadcrumbs"
import pepperImg from "../images/pepper.png"
import margarineImg from "../images/margarine.png"
import mastercardImg from "../images/mastercard.png"

export default function CheckoutPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Checkout", current: true },
  ]

  return (
    <div className="checkout-wrapper">
      <Header />

      <Breadcrumbs items={breadcrumbItems} />

      <div className="checkout-container">
        {/* Shipping Section */}
        <section className="checkout-section shipping">
          <div className="section-header">
            <h3>Shipping Location</h3>
            <button className="change-btn">Change</button>
          </div>
          <div className="shipping-info">
            <div className="shipping-row">
              <span className="label">Home</span>
              <span className="separator">|</span>
              <span className="name">Kevin Prananta Tjhai</span>
            </div>
            <p className="address">
              Jl. Kecapi 2, Taman Pulo Indah Blok R3 No. 5, Penggilingan, Cakung, Jakarta Timur, DKI Jakarta,
              6287785196685
            </p>
          </div>
        </section>

        {/* Product Section */}
        <section className="checkout-section items">
          <div className="item">
            <img src={pepperImg || "/placeholder.svg"} alt="Pepper" className="item-image" />
            <div className="item-details">
              <h4>Pepper 30 gr</h4>
              <p>
                Lorem ipsum dolor sit amet consectetur. Morbi eget vestibulum risus at massa lacus. Elementum sit enim
                elementum id commodo faucibus at porta.
              </p>
              <div className="item-bottom">
                <span className="quantity">1x</span>
                <strong className="price">Rp 25.000</strong>
              </div>
            </div>
          </div>

          <div className="item">
            <img src={margarineImg || "/placeholder.svg"} alt="Margarine" className="item-image" />
            <div className="item-details">
              <h4>Margarine 500 gr</h4>
              <p>
                Lorem ipsum dolor sit amet consectetur. Morbi eget vestibulum risus at massa lacus. Elementum sit enim
                elementum id commodo faucibus at porta.
              </p>
              <div className="item-bottom">
                <span className="quantity">1x</span>
                <strong className="price">Rp 25.000</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Summary */}
        <section className="checkout-section summary">
          <h3>Payment Summary</h3>
          <div className="summary-content">
            <div className="summary-row">
              <span>Total Item(s) Price</span>
              <span>Rp.50.000,00</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Rp.7.000,00</span>
            </div>
            <div className="summary-row total">
              <span>Total Price</span>
              <span>Rp.57.000,00</span>
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section className="checkout-section payment-method">
          <div className="payment-header">
            <h3>Payment Method</h3>
            <span className="payment-type">Credit Card</span>
          </div>
          <div className="card-info">
            <div className="card-left">
              <img src={mastercardImg || "/placeholder.svg"} alt="Mastercard" className="card-logo" />
              <span className="bank-name">DBS</span>
            </div>
            <span className="card-number">*0XXX</span>
          </div>
        </section>

        {/* Pay Button */}
        <button className="pay-btn">Pay</button>
      </div>
    </div>
  )
}
