import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, authHeaders } from '../context/AuthContext'

const ROLES = [
  {
    id: 'enthusiast',
    label: 'Enthusiast',
    desc: 'Ocean lover, diver, or curious explorer',
  },
  {
    id: 'fisher',
    label: 'Fisher',
    desc: 'Recreational or commercial fisherman',
  },
  {
    id: 'marine_biologist',
    label: 'Marine Biologist',
    desc: 'Marine scientist or researcher — requires verification',
    locked: true,
  },
]

const MB_STATUS_LABELS = {
  pending:  { text: 'Verification Pending', color: '#f59e0b' },
  approved: { text: 'Verified',             color: '#22c55e' },
  rejected: { text: 'Verification Rejected', color: '#ef4444' },
}

export default function Settings() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [selectedType, setSelectedType] = useState(user?.user_type || 'enthusiast')
  const [mbCred, setMbCred] = useState(user?.mb_credential || '')
  const [roleMsg, setRoleMsg]   = useState('')
  const [roleSaving, setRoleSaving] = useState(false)

  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [pwMsg, setPwMsg]           = useState('')
  const [pwSaving, setPwSaving]     = useState(false)

  if (!user) {
    return (
      <div className="settings-gate">
        <p>You must be signed in to view settings.</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>Sign In</button>
      </div>
    )
  }

  const mbBadge = user.mb_status ? MB_STATUS_LABELS[user.mb_status] : null
  const roleChanged = selectedType !== user.user_type || (selectedType === 'marine_biologist' && mbCred !== (user.mb_credential || ''))

  async function saveRole(e) {
    e.preventDefault()
    setRoleMsg('')
    setRoleSaving(true)
    const body = { user_type: selectedType }
    if (selectedType === 'marine_biologist') body.mb_credential = mbCred
    const r = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
    const data = await r.json()
    setRoleSaving(false)
    if (!r.ok) {
      setRoleMsg(Array.isArray(data.detail) ? data.detail.map(e => e.msg).join(', ') : (data.detail || 'Error saving'))
    } else {
      updateUser(data)
      setRoleMsg(selectedType === 'marine_biologist' ? 'Credentials submitted — pending admin review.' : 'Role updated.')
    }
  }

  async function savePassword(e) {
    e.preventDefault()
    setPwMsg('')
    if (newPw !== confirmPw) { setPwMsg('Passwords do not match'); return }
    setPwSaving(true)
    const r = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
    })
    const data = await r.json()
    setPwSaving(false)
    if (!r.ok) {
      setPwMsg(Array.isArray(data.detail) ? data.detail.map(e => e.msg).join(', ') : (data.detail || 'Error saving'))
    } else {
      setPwMsg('Password updated.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-inner">
        <h2 className="settings-title">Account Settings</h2>

        {/* Profile summary */}
        <div className="settings-section">
          <p className="settings-section-title">Profile</p>
          <div className="settings-profile-row">
            <div className="settings-field">
              <span className="settings-field-label">Username</span>
              <span className="settings-field-value">{user.username}</span>
            </div>
            <div className="settings-field">
              <span className="settings-field-label">Email</span>
              <span className="settings-field-value">{user.email}</span>
            </div>
            <div className="settings-field">
              <span className="settings-field-label">Account type</span>
              <span className="settings-field-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {ROLES.find(r => r.id === user.user_type)?.label || user.user_type}
                {mbBadge && (
                  <span className="mb-badge" style={{ color: mbBadge.color, borderColor: mbBadge.color }}>
                    {mbBadge.text}
                  </span>
                )}
              </span>
            </div>
          </div>
          {user.mb_status === 'rejected' && (
            <p className="settings-note settings-note-warn">
              Your Marine Biologist verification was rejected. You can update your credentials below and resubmit.
            </p>
          )}
        </div>

        {/* Role picker */}
        <form className="settings-section" onSubmit={saveRole}>
          <p className="settings-section-title">User Role</p>
          <div className="role-picker">
            {ROLES.map(role => (
              <button
                key={role.id}
                type="button"
                className={`role-card ${selectedType === role.id ? 'selected' : ''}`}
                onClick={() => setSelectedType(role.id)}
              >
                <p className="role-card-title">{role.label}</p>
                <p className="role-card-desc">{role.desc}</p>
                {role.locked && <p className="role-card-lock">Requires verification</p>}
              </button>
            ))}
          </div>

          {selectedType === 'marine_biologist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="settings-field-label">
                Credentials / Institution
                <span style={{ color: '#64748b', fontWeight: 400, marginLeft: 6 }}>
                  (describe your role, institution, or relevant experience)
                </span>
              </label>
              <textarea
                className="submit-textarea submit-input"
                rows={3}
                value={mbCred}
                onChange={e => setMbCred(e.target.value)}
                placeholder="e.g. PhD candidate at University of Delaware, focusing on mid-Atlantic shark ecology"
                required
              />
            </div>
          )}

          {roleMsg && (
            <p className="settings-msg" style={{ color: roleMsg.includes('Pending') || roleMsg.includes('updated') ? '#22c55e' : '#ef4444' }}>
              {roleMsg}
            </p>
          )}

          <div>
            <button className="btn-primary" type="submit" disabled={roleSaving || !roleChanged}>
              {roleSaving ? 'Saving…' : 'Save Role'}
            </button>
          </div>
        </form>

        {/* Password */}
        <form className="settings-section" onSubmit={savePassword}>
          <p className="settings-section-title">Change Password</p>
          <div className="settings-pw-grid">
            <label className="auth-label">
              Current Password
              <input className="auth-input" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
            </label>
            <label className="auth-label">
              New Password <span style={{ color: '#475569', fontWeight: 400 }}>(min 8 characters)</span>
              <input className="auth-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={8} maxLength={72} />
            </label>
            <label className="auth-label">
              Confirm New Password
              <input className="auth-input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
            </label>
          </div>

          {pwMsg && (
            <p className="settings-msg" style={{ color: pwMsg === 'Password updated.' ? '#22c55e' : '#ef4444' }}>
              {pwMsg}
            </p>
          )}

          <div>
            <button className="btn-primary" type="submit" disabled={pwSaving}>
              {pwSaving ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
