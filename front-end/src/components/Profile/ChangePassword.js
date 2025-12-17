import React, { useState, useEffect, useMemo } from 'react';
import './ChangePassword.scss';
import { toast } from 'react-toastify';

const ChangePassword = ({ isOpen, onClose, onSubmit, submitting = false }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const defaultObjValidInput = {
        isValidCurrent: true,
        isValidNew: true,
        isValidConfirm: true,
    };
    const [objValidInput, setObjValidInput] = useState(defaultObjValidInput);

    useEffect(() => {
        if (isOpen) {
            // reset when open
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setShowCurrent(false);
            setShowNew(false);
            setShowConfirm(false);
            setObjValidInput(defaultObjValidInput);
        }
    }, [isOpen]);

    const strength = useMemo(() => {
        const pwd = newPassword || '';
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (pwd.length >= 12) score++;
        // 0-6
        if (score <= 2) return { label: 'Weak', level: 1 };
        if (score <= 4) return { label: 'Medium', level: 2 };
        return { label: 'Strong', level: 3 };
    }, [newPassword]);

    const passwordsMatch = useMemo(() => {
        return newPassword && confirmNewPassword && newPassword === confirmNewPassword;
    }, [newPassword, confirmNewPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate like Login.js pattern with toast + highlight
        setObjValidInput(defaultObjValidInput);
        if (!currentPassword) {
            setObjValidInput(prev => ({ ...prev, isValidCurrent: false }));
            toast.error('Please enter your current password');
            return;
        }
        if (!newPassword) {
            setObjValidInput(prev => ({ ...prev, isValidNew: false }));
            toast.error('Please enter your new password');
            return;
        }
        if (!confirmNewPassword) {
            setObjValidInput(prev => ({ ...prev, isValidConfirm: false }));
            toast.error('Please confirm your new password');
            return;
        }
        await onSubmit?.(currentPassword, newPassword, confirmNewPassword);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop-custom" onClick={onClose}>
            <div className="modal-card animate-in" role="dialog" aria-modal="true" aria-labelledby="cp-title" onClick={(e) => e.stopPropagation()}>
                <div className="change-password-container p-0">
                    <div className="container">
                        <div className="max-w-xl mx-auto">
                            {/* Header */}
                            <div className="modal-header-custom">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="badge-icon">
                                        <i className="bi bi-shield-lock"></i>
                                    </div>
                                    <div>
                                        <h5 id="cp-title" className="page-title mb-0">Change Password</h5>
                                        <p className="page-subtitle mb-0">For your security, please do not share your password with anyone.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card */}
                            <div className="password-card glass">
                                <form onSubmit={handleSubmit}>
                                    {/* Current Password */}
                                    <div className="form-group">
                                        <label htmlFor="current-password">Current Password</label>
                                        <div className="input-wrapper">
                                            <span className="icon-left"><i className="bi bi-lock"></i></span>
                                            <input
                                                type={showCurrent ? 'text' : 'password'}
                                                className={`form-control custom-input ${objValidInput.isValidCurrent ? '' : 'is-invalid'}`}
                                                id="current-password"
                                                placeholder="Enter your current password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />
                                            <button type="button" className="toggle-visibility" onClick={() => setShowCurrent(v => !v)} aria-label="Toggle current password visibility">
                                                <i className={showCurrent ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="form-group">
                                        <label htmlFor="new-password">New Password</label>
                                        <div className="input-wrapper">
                                            <span className="icon-left"><i className="bi bi-shield"></i></span>
                                            <input
                                                type={showNew ? 'text' : 'password'}
                                                className={`form-control custom-input ${objValidInput.isValidNew ? '' : 'is-invalid'} ${passwordsMatch ? 'is-valid' : ''}`}
                                                id="new-password"
                                                placeholder="Enter a new secure password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                aria-describedby="pwd-help"
                                            />
                                            <button type="button" className="toggle-visibility" onClick={() => setShowNew(v => !v)} aria-label="Toggle new password visibility">
                                                <i className={showNew ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                                            </button>
                                        </div>
                                        <div id="pwd-help" className="form-text">Use 6+ characters with a mix of letters, numbers & symbols.</div>
                                        {passwordsMatch && (
                                            <div className="form-text text-success mt-1 small">Passwords match</div>
                                        )}

                                        {/* Strength meter */}
                                        <div className={`strength-meter level-${strength.level}`} aria-hidden="true">
                                            <span></span><span></span><span></span>
                                            <div className={`strength-label ${strength.label.toLowerCase()}`}>{strength.label}</div>
                                        </div>
                                    </div>

                                    {/* Confirm New Password */}
                                    <div className="form-group">
                                        <label htmlFor="confirm-new-password">Confirm New Password</label>
                                        <div className="input-wrapper">
                                            <span className="icon-left"><i className="bi bi-shield-lock"></i></span>
                                            <input
                                                type={showConfirm ? 'text' : 'password'}
                                                className={`form-control custom-input ${objValidInput.isValidConfirm ? '' : 'is-invalid'} ${passwordsMatch ? 'is-valid' : ''}`}
                                                id="confirm-new-password"
                                                placeholder="Confirm your new password"
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            />
                                            <button type="button" className="toggle-visibility" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm password visibility">
                                                <i className={showConfirm ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-3 pt-4 border-top">
                                        {/* Info: we are using toast for validation like Login.js */}
                                        <button className="btn btn-secondary-custom" type="button" onClick={onClose} disabled={submitting}>
                                            Cancel
                                        </button>
                                        <button className="btn btn-primary-custom" type="submit" disabled={submitting}>
                                            {submitting ? 'Saving...' : 'Save Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
