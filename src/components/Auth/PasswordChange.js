import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './PasswordChange.css';

const PasswordChange = ({ language, onClose }) => {
    const { user, changePassword } = useAuth();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setError(language === 'am' ? 'እባክዎ ሁሉንም ቦታዎች ያስገቡ' : 'Please fill in all fields');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError(language === 'am' ? 'አዲሱ የይለፍ ቃል ከተያያዘ የይለፍ ቃል ጋር አይመሳሰልም' : 'New password does not match confirmation');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError(language === 'am' ? 'የይለፍ ቃል ቢያንስ 6 ባህሪያት መሆኑ አለበት' : 'Password must be at least 6 characters long');
            return;
        }

        try {
            const result = changePassword(formData.currentPassword, formData.newPassword);
            if (result.success) {
                setSuccess(language === 'am' ? 'የይለፍ ቃል ተሳክቷል ተለወጠ!' : 'Password changed successfully!');
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setError(language === 'am' ? 'የይለፍ ቃል መለወጥ አልተሳካም' : 'Failed to change password');
            }
        } catch (error) {
            setError(language === 'am' ? 'የይለፍ ቃል መለወጥ አልተሳካም' : 'Failed to change password');
        }
    };

    return (
        <div className="password-change-modal">
            <div className="password-change-content">
                <div className="password-change-header">
                    <h2>{language === 'am' ? 'የይለፍ ቃል ለውጥ' : 'Change Password'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="password-change-form">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-group">
                        <label>{language === 'am' ? 'አሁን ያለው የይለፍ ቃል*' : 'Current Password*'}</label>
                        <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                            placeholder={language === 'am' ? 'አሁን ያለው የይለፍ ቃል ያስገቡ' : 'Enter current password'}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{language === 'am' ? 'አዲስ የይለፍ ቃል*' : 'New Password*'}</label>
                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                            placeholder={language === 'am' ? 'አዲስ የይለፍ ቃል ያስገቡ' : 'Enter new password'}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{language === 'am' ? 'አዲስ የይለፍ ቃል ያረጋግጡ*' : 'Confirm New Password*'}</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            placeholder={language === 'am' ? 'አዲስ የይለፍ ቃል እንደገና ያስገቡ' : 'Confirm new password'}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            {language === 'am' ? 'ተያይዞ ለምን ያልለቀ' : 'Cancel'}
                        </button>
                        <button type="submit" className="btn-primary">
                            {language === 'am' ? 'የይለፍ ቃል ለውጥ' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordChange;
