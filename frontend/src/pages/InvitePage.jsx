import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collabCartAPI } from '../services/api';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import './InvitePage.css';

const InvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!token) {
        setError('Invalid invite link - no token provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        const response = await collabCartAPI.getInviteDetails(token);
        
        if (response.success && response.inviteDetails) {
          setInviteDetails(response.inviteDetails);
        } else {
          setError(response.message || 'Failed to load invite details');
        }
      } catch (error) {
        console.error('Error fetching invite details:', error);
        setError('Failed to load invite details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInviteDetails();
  }, [token]);

  const handleJoinCart = async () => {
    if (!user || !user.id) {
      setError('Please login to join the cart');
      return;
    }

    try {
      setJoining(true);
      setError(null);
      setSuccess(null);
      
      const response = await collabCartAPI.joinCartViaInvite(token);
      
      if (response.success) {
        if (response.alreadyMember) {
          setSuccess('You are already a member of this cart!');
          setTimeout(() => navigate('/collaboration-cart'), 2000);
        } else if (response.newMember) {
          setSuccess('Successfully joined the collaboration cart!');
          setTimeout(() => navigate('/collaboration-cart'), 2000);
        }
      } else {
        setError(response.message || 'Failed to join cart');
      }
    } catch (error) {
      console.error('Error joining cart:', error);
      setError('Failed to join cart. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container invite-page-loading">
          <p>Loading invitation details...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container invite-page-error">
          <div className="invite-error-content">
            <h2>Invitation Error</h2>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/collaboration-cart')} 
              className="invite-btn invite-btn-secondary"
            >
              Back to Collaboration Cart
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      
      {/* Breadcrumb Navigation */}
      <div className="profile">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Collaboration Cart', href: '/collaboration-cart' },
            { label: 'Join Invitation', current: true }
          ]}
        />
      </div>

      <div className="container invite-page">
        <div className="invite-card">
          <div className="invite-header">
            <h1>Collaboration Cart Invitation</h1>
            <p className="invite-subtitle">You've been invited to join a collaboration cart</p>
          </div>

          {/* Show success message */}
          {success && (
            <div className="invite-message invite-message-success">
              <p>{success}</p>
              <p className="invite-redirect-text">Redirecting to collaboration cart...</p>
            </div>
          )}

          {/* Show error message */}
          {error && !loading && (
            <div className="invite-message invite-message-error">
              <p>{error}</p>
            </div>
          )}

          <div className="invite-content">
            {inviteDetails ? (
              <>
                {/* Real invite details */}
                <div className="invite-details">
                  <div className="invite-detail-item">
                    <span className="invite-label">Cart Creator:</span>
                    <span className="invite-value">
                      {inviteDetails.createdBy ? 
                        `${inviteDetails.createdBy.firstName} ${inviteDetails.createdBy.lastName} (@${inviteDetails.createdBy.username})` : 
                        'Unknown'
                      }
                    </span>
                  </div>
                  <div className="invite-detail-item">
                    <span className="invite-label">Current Members:</span>
                    <span className="invite-value">
                      {inviteDetails.memberCount} / {inviteDetails.maxMembers}
                    </span>
                  </div>
                  <div className="invite-detail-item">
                    <span className="invite-label">Items in Cart:</span>
                    <span className="invite-value">
                      {inviteDetails.itemCount} {inviteDetails.itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="invite-detail-item">
                    <span className="invite-label">Cart Status:</span>
                    <span className="invite-value invite-status-active">Active</span>
                  </div>
                </div>

                <div className="invite-actions">
                  <button 
                    className="invite-btn invite-btn-primary"
                    onClick={handleJoinCart}
                    disabled={joining || inviteDetails.memberCount >= inviteDetails.maxMembers}
                  >
                    {joining ? 'Joining...' : 
                     inviteDetails.memberCount >= inviteDetails.maxMembers ? 'Cart Full' : 
                     'Join Cart'}
                  </button>
                  <button 
                    className="invite-btn invite-btn-secondary"
                    onClick={() => navigate('/collaboration-cart')}
                    disabled={joining}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              /* Loading state */
              <div className="invite-loading">
                <p>Loading cart details...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InvitePage;
