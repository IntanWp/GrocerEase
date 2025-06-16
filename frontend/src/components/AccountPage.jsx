"use client"
import { useState } from "react"
import "./AccountPage.css"
import Header from "../components/Header"
import Breadcrumbs from "../components/Breadcrumbs"

export default function AccountPage() {
  const [userProfile, setUserProfile] = useState({
    username: "Kevin Prananta",
    email: "kevin123@gmail.com",
    password: "**********",
    address: "Jl. Merdeka No. 12",
    phone: "+62 8123456789",
    fullName: "Kevin Prananta Tjhai",
    profileImage: "/placeholder.svg?height=300&width=300",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ ...userProfile })

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Account", href: "/account" },
    { label: "Edit Account", current: true },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    // Here you would typically send data to backend
    setUserProfile({ ...formData })
    setIsEditing(false)
    console.log("Profile updated:", formData)
  }

  const handleCancel = () => {
    setFormData({ ...userProfile })
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

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
              {isEditing && <button className="change-photo-btn">Change Photo</button>}
            </div>
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={isEditing ? formData.username : userProfile.username}
                onChange={handleInputChange}
                className="form-input"
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">✉️</span>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={isEditing ? formData.email : userProfile.email}
                onChange={handleInputChange}
                className="form-input"
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={isEditing ? formData.password : userProfile.password}
                onChange={handleInputChange}
                className="form-input"
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🏠</span>
                Address
              </label>
              <input
                type="text"
                name="address"
                value={isEditing ? formData.address : userProfile.address}
                onChange={handleInputChange}
                className="form-input"
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📱</span>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={isEditing ? formData.phone : userProfile.phone}
                onChange={handleInputChange}
                className="form-input"
                disabled={!isEditing}
              />
            </div>

            <div className="form-actions">
              {!isEditing ? (
                <button onClick={handleEdit} className="edit-btn">
                  Edit Profile
                </button>
              ) : (
                <div className="action-buttons">
                  <button onClick={handleSave} className="save-btn">
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
