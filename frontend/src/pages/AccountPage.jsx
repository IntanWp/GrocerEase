"use client"
import { useState } from "react"
import "./AccountPage.css"
import Header from "../components/Header"
import Breadcrumbs from "../components/Breadcrumbs"

export default function AccountPage() {
  const [userProfile] = useState({
    username: "Kevin Prananta",
    email: "kevin123@gmail.com",
    password: "**********",
    address: "Jl. Merdeka No. 12",
    phone: "+62 8123456789",
    fullName: "Kevin Prananta Tjhai",
    profileImage: "/placeholder.svg?height=300&width=300",
  })

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Account", current: true },

  ]

  return (
    <div className="account-wrapper">
      <Header />
      <Breadcrumbs items={breadcrumbItems} />

      <div className="account-container">
        <div className="profile-section">
          <div className="profile-left">
            <h2 className="profile-name">{userProfile.fullName}</h2>
            <div className="profile-image-container">
              <img src={userProfile.profileImage || "/placeholder.svg"} alt="Profile" className="profile-image" />
            </div>
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Username
              </label>
              <input type="text" value={userProfile.username} className="form-input" disabled readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">✉️</span>
                Email
              </label>
              <input type="email" value={userProfile.email} className="form-input" disabled readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <input type="password" value={userProfile.password} className="form-input" disabled readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🏠</span>
                Address
              </label>
              <input type="text" value={userProfile.address} className="form-input" disabled readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📱</span>
                Phone Number
              </label>
              <input type="tel" value={userProfile.phone} className="form-input" disabled readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
