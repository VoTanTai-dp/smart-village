import React, { useEffect, useState } from 'react';
import './Profile.scss';
import ChangePassword from './ChangePassword';
import { toast } from 'react-toastify';
import { getUserByEmail, getUserByLogin, updateUserInfo, changePassword } from '../../services/accountService';

const Profile = (props) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // UI states
    const [isEditing, setIsEditing] = useState(false);
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [submittingPwd, setSubmittingPwd] = useState(false);

    // Form data mapped to giao diện của bạn
    const [fullName, setFullName] = useState(''); // map với username trong DB
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [sex, setSex] = useState('');

    // Giữ nguyên các trường hiển thị cho UI
    const [groupDesc, setGroupDesc] = useState('');
    const [joinedDate, setJoinedDate] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [lastSeen] = useState(''); // nếu bạn có cơ chế lastSeen thì set vào đây

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
                setGroupDesc(data?.Group?.description || '');
                if (data.createdAt) {
                    const d = new Date(data.createdAt);
                    setJoinedDate(d.toLocaleDateString());
                }
                setAvatarUrl(data?.avatar || '');
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

    const handleChangePassword = async (oldPwd, newPwd, confirmPwd) => {
        try {
            if (!user?.id) return;
            if (!oldPwd || !newPwd) {
                toast.error('Please input old and new password');
                return;
            }
            if (newPwd !== confirmPwd) {
                toast.error('New password and confirm do not match');
                return;
            }
            setSubmittingPwd(true);
            await changePassword(user.id, oldPwd, newPwd);
            toast.success('Password changed');
            setShowPwdModal(false);
        } catch (e) {
            console.error('change password error: ', e);
            const msg = e?.response?.data?.message || 'Change password failed';
            toast.error(msg);
        } finally {
            setSubmittingPwd(false);
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

    const API_ORIGIN = 'http://localhost:8080';

    return (
        <div className="profile-container">
            <div className="container">
                {/* — Profile Content — */}
                <div className="max-w-4xl mx-auto">
                    <div className="profile-card">

                        {/* 1. Header Section: Avatar & Name */}
                        <div className="profile-header">
                            <div className="avatar-wrapper">
                               <img src={`${API_ORIGIN}${avatarUrl || '/uploads/blank-avatar.jpg'}`} alt={fullName || 'User'} />
                               <label className="btn-edit-avatar" title="Change Avatar">
                                   <i className="bi bi-pen"></i>
                                   <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                                       const file = e.target.files?.[0];
                                       if (!file) return;
                                       if (!user?.id) return;
                                       try {
                                           setUploadingAvatar(true);
                                           const { uploadAvatar } = await import('../../services/accountService');
                                           const res = await uploadAvatar(user.id, file);
                                           const url = res?.data?.data?.avatar;
                                           if (url) {
                                               setAvatarUrl(url);
                                               setUser(prev => ({ ...prev, avatar: url }));
                                               toast.success('Avatar updated');
                                           } else {
                                               toast.error('Upload failed');
                                           }
                                       } catch (err) {
                                           console.error('upload avatar error', err);
                                           toast.error('Upload failed');
                                       } finally {
                                           setUploadingAvatar(false);
                                           e.target.value = '';
                                       }
                                   }} />
                               </label>
                            </div>
                            <div className="user-info-header">
                                <h2>{fullName || '—'}</h2>
                                <div className="role-badge">{groupDesc || '—'}</div>
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

                            {/* Group */}
                            <div className="info-item col-12 col-md-6">
                                <label>Group</label>
                                <div className="info-value">{groupDesc || '—'}</div>
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

            <ChangePassword
                isOpen={showPwdModal}
                onClose={() => setShowPwdModal(false)}
                onSubmit={handleChangePassword}
                submitting={submittingPwd}
            />
        </div >
    );
};

export default Profile;