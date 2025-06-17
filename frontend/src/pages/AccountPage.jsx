"use client"
import React, { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { userAPI } from "../services/api"
import "./AccountPage.css"
import Header from "../components/Header"
import Breadcrumbs from "../components/Breadcrumbs"

export default function AccountPage() {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    phoneNumber: "",
    profileImage: "/placeholder.svg?height=300&width=300",
  })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (user && user.id) {
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      console.log('Fetching profile for user ID:', user.id) // Debug log
      
      const response = await userAPI.getProfile(user.id)
      console.log('Profile response:', response) // Debug log
      
      if (response.success && response.user) {
        setUserProfile({
          username: response.user.username || "",
          email: response.user.email || "",
          firstName: response.user.firstName || "",
          lastName: response.user.lastName || "",
          address: response.user.address || "",
          phoneNumber: response.user.phoneNumber || "",
          profileImage: response.user.profileImage || "/placeholder.svg?height=300&width=300",
        })
      } else {
        console.error('Failed to fetch profile:', response.message)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleSave = async () => {
    try {
      const response = await userAPI.updateProfile(user.id, userProfile)
      if (response.success) {
        setEditing(false)
        alert('Profile updated successfully!')
      } else {
        alert('Failed to update profile: ' + response.message)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleCancel = () => {
    setEditing(false)
    fetchUserProfile() // Reset to original data
  }

  const handleInputChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const breadcrumbItems = [
    { label: "Home", href: "/home" },
    { label: "Account", current: true },
  ]

  if (loading) {
    return (
      <div className="account-wrapper">
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="account-wrapper">
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Please log in to view your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="account-wrapper">
      <Header />
      <Breadcrumbs items={breadcrumbItems} />

      <div className="account-container">
        <div className="profile-section">
          <div className="profile-left">
            <h2 className="profile-name">{`${userProfile.firstName} ${userProfile.lastName}`.trim() || userProfile.username || 'User'}</h2>
            <div className="profile-image-container">
              <img
                src={userProfile.profileImage}
                alt="Profile"
                className="profile-image"
              />
              <button className="change-photo-btn">Change Photo</button>
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
                value={userProfile.username}
                className="form-input"
                disabled={!editing}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">✉️</span>
                Email
              </label>
              <input
                type="email"
                value={userProfile.email}
                className="form-input"
                disabled={!editing}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                First Name
              </label>
              <input
                type="text"
                value={userProfile.firstName}
                className="form-input"
                disabled={!editing}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Last Name
              </label>
              <input
                type="text"
                value={userProfile.lastName}
                className="form-input"
                disabled={!editing}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📍</span>
                Address
              </label>
              <input
                type="text"
                value={userProfile.address}
                className="form-input"
                disabled={!editing}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📞</span>
                Phone
              </label>
              <input
                type="tel"
                value={userProfile.phoneNumber}
                className="form-input"
                disabled={!editing}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              />
            </div>

            <div className="form-actions">
              <div className="action-buttons">
                {!editing ? (
                  <button className="edit-btn" onClick={handleEdit}>Edit Profile</button>
                ) : (
                  <>
                    <button className="save-btn" onClick={handleSave}>Save</button>
                    <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
