import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AccountSettings.css';

const AccountSettings = ({ language, onClose }) => {
    const { user, changePassword, checkUsernameAvailability, changeUsername } = useAuth();
    
    // Username state
    const [newUsername, setNewUsername] = useState('');
    const [usernameStatus, setUsernameStatus] = useState(null); // null, 'checking', 'available', 'taken'
    const [usernameError, setUsernameError] = useState('');
    const [usernameSuccess, setUsernameSuccess] = useState('');
    
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    
    // Password strength
    const [passwordStrength, setPasswordStrength] = useState({ level: 0, label: '', color: '' });
    
    // Validation checks
    const [validations, setValidations] = useState({
        minLength: false,
        hasNumber: false,
        hasUppercase: false,
        hasSpecial: false,
        passwordsMatch: false
    });
    
    // Debounced username check
    useEffect(() => {
        if (!newUsername || newUsername.length < 3) {
            setUsernameStatus(null);
            return;
        }
        
        const timer = setTimeout(async () => {
            setUsernameStatus('checking');
            const isAvailable = await checkUsernameAvailability(newUsername);
            setUsernameStatus(isAvailable ? 'available' : 'taken');
        }, 300);
        
        return () => clearTimeout(timer);
    }, [newUsername, checkUsernameAvailability]);
    
    // Password strength calculation
    useEffect(() => {
        const checks = {
            minLength: newPassword.length >= 8,
            hasNumber: /\d/.test(newPassword),
            hasUppercase: /[A-Z]/.test(newPassword),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
            passwordsMatch: newPassword === confirmPassword && newPassword.length > 0
        };
        
        setValidations(checks);
        
        // Calculate strength
        const score = Object.values(checks).filter(v => v).length;
        let level = 0;
        let label = '';
        let color = '';
        
        if (newPassword.length > 0) {
            if (score <= 2) {
                level = 1;
                label = language === 'am' ? 'ደካማ' : 'Weak';
                color = '#e74c3c';
            } else if (score === 3) {
                level = 2;
                label = language === 'am' ? 'መካከለኛ' : 'Medium';
                color = '#f39c12';
            } else if (score >= 4) {
                level = 3;
                label = language === 'am' ? 'ጠንካራ' : 'Strong';
                color = '#27ae60';
            }
        }
        
        setPasswordStrength({ level, label, color });
    }, [newPassword, confirmPassword, language]);
    
    // Handle username change
    const handleUsernameSubmit = async (e) => {
        e.preventDefault();
        setUsernameError('');
        setUsernameSuccess('');
        
        if (!newUsername || newUsername.length < 3 || newUsername.length > 20) {
            setUsernameError(language === 'am' ? 'የተጠቃሚ ስም ቢያንስ 3 እና ከ20 ባህሪያት መሆን አለበት' : 'Username must be 3-20 characters');
            return;
        }
        
        if (usernameStatus !== 'available') {
            setUsernameError(language === 'am' ? 'የተጠቃሚ ስም አስቀድሞ ተወስዷል' : 'Username is already taken');
            return;
        }
        
        const result = await changeUsername(newUsername);
        if (result.success) {
            setUsernameSuccess(language === 'am' ? 'የተጠቃሚ ስም ተሳክቷል ተለውጧል!' : 'Username changed successfully!');
            setNewUsername('');
            setUsernameStatus(null);
        } else {
            setUsernameError(result.error || (language === 'am' ? 'የተጠቃሚ ስም መለወጥ አልተሳካም' : 'Failed to change username'));
        }
    };
    
    // Handle password change
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError(language === 'am' ? 'እባክዎ ሁሉንም ቦታዎች ያስገቡ' : 'Please fill in all fields');
            return;
        }
        
        if (!validations.minLength || !validations.hasNumber || !validations.hasUppercase || !validations.hasSpecial) {
            setPasswordError(language === 'am' ? 'የይለፍ ቃል ሁሉንም መስፈርቶች ማሟላት አለበት' : 'Password must meet all requirements');
            return;
        }
        
        if (!validations.passwordsMatch) {
            setPasswordError(language === 'am' ? 'የይለፍ ቃሎች አይመሳሰልም' : 'Passwords do not match');
            return;
        }
        
        const result = await changePassword(currentPassword, newPassword);
        if (result.success) {
            setPasswordSuccess(language === 'am' ? 'የይለፍ ቃል ተሳክቷል ተለወጠ!' : 'Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setPasswordError(result.error || (language === 'am' ? 'የይለፍ ቃል መለወጥ አልተሳካም' : 'Failed to change password'));
        }
    };
    
    return (
        <div className="account-settings-modal">
            <div className="account-settings-content">
                <div className="account-settings-header">
                    <h2>{language === 'am' ? 'የመለያ ቅንብሮች' : 'Account Settings'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="account-settings-body">
                    {/* Username Change Section */}
                    <div className="settings-section">
                        <h3>{language === 'am' ? 'የተጠቃሚ ስም ለውጥ' : 'Change Username'}</h3>
                        
                        <div className="current-username">
                            <label>{language === 'am' ? 'አሁን ያለው የተጠቃሚ ስም:' : 'Current Username:'}</label>
                            <span className="username-value">{user?.username}</span>
                        </div>
                        
                        <form onSubmit={handleUsernameSubmit}>
                            <div className="form-group">
                                <label>{language === 'am' ? 'አዲስ የተጠቃሚ ስም' : 'New Username'}</label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                                    placeholder={language === 'am' ? 'አዲስ የተጠቃሚ ስም ያስገቡ' : 'Enter new username'}
                                    maxLength={20}
                                />
                                <div className="username-hint">
                                    {language === 'am' ? '3-20 ባህሪያት' : '3-20 characters'} • {language === 'am' ? 'ቁጥሮች እና ፊደሎች ብቻ' : 'Letters and numbers only'}
                                </div>
                                
                                {usernameStatus === 'checking' && (
                                    <div className="username-status checking">
                                        {language === 'am' ? 'በመፈተሽ...' : 'Checking...'}
                                    </div>
                                )}
                                {usernameStatus === 'available' && (
                                    <div className="username-status available">
                                        ✓ {language === 'am' ? 'የተጠቃሚ ስም ይገኛል' : 'Username available'}
                                    </div>
                                )}
                                {usernameStatus === 'taken' && (
                                    <div className="username-status taken">
                                        ✗ {language === 'am' ? 'የተጠቃሚ ስም አስቀድሞ ተወስዷል' : 'Username already taken'}
                                    </div>
                                )}
                            </div>
                            
                            {usernameError && <div className="error-message">{usernameError}</div>}
                            {usernameSuccess && <div className="success-message">{usernameSuccess}</div>}
                            
                            <button 
                                type="submit" 
                                className="btn-primary"
                                disabled={usernameStatus !== 'available'}
                            >
                                {language === 'am' ? 'የተጠቃሚ ስም ለውጥ' : 'Change Username'}
                            </button>
                        </form>
                    </div>
                    
                    {/* Password Change Section */}
                    <div className="settings-section">
                        <h3>{language === 'am' ? 'የይለፍ ቃል ለውጥ' : 'Change Password'}</h3>
                        
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="form-group">
                                <label>{language === 'am' ? 'አሁን ያለው የይለፍ ቃል' : 'Current Password'}</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder={language === 'am' ? 'አሁን ያለው የይለፍ ቃል ያስገቡ' : 'Enter current password'}
                                    />
                                    <button 
                                        type="button" 
                                        className="toggle-password"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? '👁' : '👁‍🗨'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>{language === 'am' ? 'አዲስ የይለፍ ቃል' : 'New Password'}</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder={language === 'am' ? 'አዲስ የይለፍ ቃል ያስገቡ' : 'Enter new password'}
                                    />
                                    <button 
                                        type="button" 
                                        className="toggle-password"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? '👁' : '👁‍🗨'}
                                    </button>
                                </div>
                                
                                {/* Password Strength Meter */}
                                {newPassword.length > 0 && (
                                    <div className="password-strength">
                                        <div className="strength-label">
                                            {language === 'am' ? 'የይለፍ ቃል ጥንካራነት:' : 'Password Strength:'} 
                                            <span style={{ color: passwordStrength.color, fontWeight: 'bold' }}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="strength-bar">
                                            <div 
                                                className={`strength-fill level-${passwordStrength.level}`}
                                                style={{ 
                                                    width: `${(passwordStrength.level / 3) * 100}%`,
                                                    backgroundColor: passwordStrength.color 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Password Requirements */}
                                <div className="password-requirements">
                                    <div className={validations.minLength ? 'valid' : ''}>
                                        {validations.minLength ? '✓' : '□'} {language === 'am' ? '8+ ባህሪያት' : '8+ characters'}
                                    </div>
                                    <div className={validations.hasNumber ? 'valid' : ''}>
                                        {validations.hasNumber ? '✓' : '□'} {language === 'am' ? 'ቁጥር ይጠቃል' : 'Contains number'}
                                    </div>
                                    <div className={validations.hasUppercase ? 'valid' : ''}>
                                        {validations.hasUppercase ? '✓' : '□'} {language === 'am' ? 'ነፃ ፊደል ይጠቃል' : 'Contains uppercase'}
                                    </div>
                                    <div className={validations.hasSpecial ? 'valid' : ''}>
                                        {validations.hasSpecial ? '✓' : '□'} {language === 'am' ? 'ልዩ ባህሪ ይጠቃል' : 'Contains special character'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>{language === 'am' ? 'አዲስ የይለፍ ቃል ያረጋግጡ' : 'Confirm New Password'}</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={language === 'am' ? 'የይለፍ ቃል እንደገና ያስገቡ' : 'Confirm new password'}
                                    />
                                    <button 
                                        type="button" 
                                        className="toggle-password"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? '👁' : '👁‍🗨'}
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && (
                                    <div className={`password-match ${validations.passwordsMatch ? 'valid' : 'invalid'}`}>
                                        {validations.passwordsMatch ? '✓' : '✗'} {' '}
                                        {language === 'am' ? 'የይለፍ ቃሎች ይመሳሳላሉ' : 'Passwords match'}
                                    </div>
                                )}
                            </div>
                            
                            {passwordError && <div className="error-message">{passwordError}</div>}
                            {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
                            
                            <button type="submit" className="btn-primary">
                                {language === 'am' ? 'የይለፍ ቃል ለውጥ' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
