import React, { useEffect, useState } from 'react';
import './Profile.scss';
import { toast } from 'react-toastify';
import { getUserByEmail, getUserByLogin, updateUserInfo, changePassword } from '../../services/accountService';

const Profile = (props) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // UI states
    const [isEditing, setIsEditing] = useState(false);
    const [showPwdModal, setShowPwdModal] = useState(false);

    // Form data mapped to giao diện của bạn
    const [fullName, setFullName] = useState(''); // map với username trong DB
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [sex, setSex] = useState('');

    // Giữ nguyên các trường hiển thị cho UI
    const [role] = useState('Farm Operations Manager'); // không có trong DB, chỉ để hiển thị
    const [joinedDate, setJoinedDate] = useState('');
    const [avatarUrl] = useState('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80%29');
    const [lastSeen] = useState(''); // nếu bạn có cơ chế lastSeen thì set vào đây

    // Modal change password
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                const session = sessionStorage.getItem('account');
                if (!session) {
                    setLoading(false);
                    return;
                }
                const { email: loginValue } = JSON.parse(session) || {};
                if (!loginValue) {
                    setLoading(false);
                    return;
                }

                // Lấy user theo email/phone
                let data = null;
                if (/@/.test(loginValue)) {
                    const res = await getUserByEmail(loginValue);
                    data = res?.data?.data || res?.data || null;
                } else {
                    const res = await getUserByLogin(loginValue);
                    data = res?.data?.data || res?.data || null;
                }

                if (!data) {
                    toast.error('User not found');
                    setLoading(false);
                    return;
                }

                // Map dữ liệu sang UI
                setUser(data);
                setFullName(data.username || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
                setSex(data.sex || '');
                if (data.createdAt) {
                    const d = new Date(data.createdAt);
                    setJoinedDate(d.toLocaleDateString());
                }
            } catch (e) {
                console.error('init profile error:', e);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleEditToggle = () => setIsEditing(v => !v);

    const handleSave = async () => {
        try {
            if (!user?.id) return;
            await updateUserInfo(user.id, {
                email,
                username: fullName,
                phone,
                sex,
            });
            toast.success('Profile updated');
            setIsEditing(false);
            setUser(prev => ({ ...prev, email, username: fullName, phone, sex }));
        } catch (e) {
            console.error('update user info error: ', e);
            toast.error('Update failed');
        }
    };

    const handleChangePassword = async () => {
        try {
            if (!user?.id) return;
            if (!oldPassword || !newPassword) {
                toast.error('Please input old and new password');
                return;
            }
            if (newPassword !== confirmNewPassword) {
                toast.error('New password and confirm do not match');
                return;
            }
            await changePassword(user.id, oldPassword, newPassword);
            toast.success('Password changed');
            setShowPwdModal(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (e) {
            console.error('change password error: ', e);
            const msg = e?.response?.data?.message || 'Change password failed';
            toast.error(msg);
        }
    };

    if (loading) {
        return (
            <div className=" profile-container">
                <div className="container">Loading...</div>
            </div >
        );
    }

    if (!user) {
        return (
            <div className=" profile-container">
                <div className="container">No user session</div>
            </div >
        );
    }

    return (
        <div className="profile-container">
            <div className="container">
                {/* — Profile Content — */}
                <div className="max-w-4xl mx-auto">
                    <div className="profile-card">

                        {/* 1. Header Section: Avatar & Name */}
                        <div className="profile-header">
                            <div className="avatar-wrapper">
                                <img src={avatarUrl} alt={fullName || 'User'} />
                                <button className="btn-edit-avatar" title="Change Avatar">
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                            </div>
                            <div className="user-info-header">
                                <h2>{fullName || '—'}</h2>
                                <div className="role-badge">{role}</div>
                                {lastSeen && <div className="last-seen">Last seen {lastSeen}</div>}
                            </div>
                        </div>

                        {/* 2. Info Grid Section */}
                        <div className="info-grid row">
                            {/* Full Name */}
                            <div className="info-item col-12 col-md-6">
                                <label>Full Name</label>
                                {isEditing ? (
                                    <input className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                ) : (
                                    <div className="info-value">{fullName || '—'}</div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="info-item col-12 col-md-6">
                                <label>Email Address</label>
                                {isEditing ? (
                                    <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                                ) : (
                                    <div className="info-value">{email || '—'}</div>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="info-item col-12 col-md-6">
                                <label>Phone Number</label>
                                {isEditing ? (
                                    <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                ) : (
                                    <div className="info-value">{phone || '—'}</div>
                                )}
                            </div>

                            {/* Role */}
                            <div className="info-item col-12 col-md-6">
                                <label>Role</label>
                                <div className="info-value">{role}</div>
                            </div>

                            {/* Sex */}
                            <div className="info-item col-12 col-md-6">
                                <label>Sex</label>
                                {isEditing ? (
                                    <input className="form-control" value={sex} onChange={(e) => setSex(e.target.value)} />
                                ) : (
                                    <div className="info-value">{sex || '—'}</div>
                                )}
                            </div>

                            {/* Account Created */}
                            <div className="info-item col-12 col-md-6">
                                <label>Account Created</label>
                                <div className="info-value">{joinedDate || '—'}</div>
                            </div>
                        </div>

                        {/* 3. Actions Footer */}
                        <div className="actions-footer">
                            {!isEditing ? (
                                <button className="btn-primary-custom" onClick={handleEditToggle}>
                                    Edit/Update Information
                                </button>
                            ) : (
                                <>
                                    <button className="btn-primary-custom" onClick={handleSave}>Save</button>
                                    <button className="btn-secondary-custom" onClick={handleEditToggle}>Cancel</button>
                                </>
                            )}
                            <button className="btn-secondary-custom" onClick={() => setShowPwdModal(true)}>
                                Change Password
                            </button>
                        </div>

                    </div>
                </div >
            </div >

            {/* Password Modal (giữ style của bạn) */}
            {
                showPwdModal && (
                    <div className="modal-backdrop-custom" onClick={() => setShowPwdModal(false)}>
                        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                            <h5 className="mb-3">Change Password</h5>
                            <div className="mb-2">
                                <label className="form-label">Old Password</label>
                                <input type="password" className="form-control" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">New Password</label>
                                <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Confirm New Password</label>
                                <input type="password" className="form-control" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-secondary" onClick={() => setShowPwdModal(false)}>Cancel</button>
                                <button className="btn btn-primary text-dark fw-bold" onClick={handleChangePassword}>Update Password</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Profile;