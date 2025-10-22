import React, { useState, useEffect } from 'react';

export const SecuritySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('password');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [twoFactorForm, setTwoFactorForm] = useState({
    token: '',
  });

  const setupTwoFactor = async () => {
    try {
      const response = await fetch('/api/v1/auth/2fa/setup', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSecret(data.secret);
        setQrCode(data.qrCodeUrl);
      }
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
    }
  };

  const enableTwoFactor = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          secret,
          token: twoFactorForm.token
        }),
      });

      if (response.ok) {
        setTwoFactorEnabled(true);
        alert('Two-factor authentication enabled successfully!');
        setTwoFactorForm({ token: '' });
        setQrCode('');
        setSecret('');
      }
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/2fa/disable', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setTwoFactorEnabled(false);
        alert('Two-factor authentication disabled successfully!');
      }
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Security Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['password', '2fa', 'sessions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === '2fa' ? 'Two-Factor Auth' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'password' && (
        <div className="max-w-md">
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={changePassword}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === '2fa' && (
        <div className="max-w-md">
          {!twoFactorEnabled ? (
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Enable Two-Factor Authentication</h3>
              
              {!qrCode ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Add an extra layer of security to your account with two-factor authentication.
                  </p>
                  <button
                    onClick={setupTwoFactor}
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  >
                    Setup 2FA
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Scan this QR code with your authenticator app:
                  </p>
                  <div className="mb-4 p-4 bg-gray-100 rounded text-center">
                    <p className="text-sm font-mono break-all">{qrCode}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Or enter this secret manually: <code className="bg-gray-100 px-1 rounded">{secret}</code>
                  </p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={twoFactorForm.token}
                    onChange={(e) => setTwoFactorForm({ token: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
                  />
                  <button
                    onClick={enableTwoFactor}
                    disabled={loading || !twoFactorForm.token}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Enabling...' : 'Enable 2FA'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication Enabled</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-green-600">✓</span>
                <span>Your account is protected with 2FA</span>
              </div>
              <button
                onClick={disableTwoFactor}
                disabled={loading}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="max-w-2xl">
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded">
                <div>
                  <div className="font-medium">Current Session</div>
                  <div className="text-sm text-gray-500">Chrome on Windows • Last active: Now</div>
                </div>
                <span className="text-green-600 text-sm">Active</span>
              </div>
            </div>
            <button className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
              Revoke All Other Sessions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};