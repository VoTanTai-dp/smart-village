import React, { useState, useEffect } from 'react';
import './Nav.scss';
import { NavLink, useLocation, useHistory } from 'react-router-dom';

const Nav = (props) => {
    const [isShow, setIsShow] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // 1. Thêm state để kiểm tra trạng thái đăng nhập
    const [isLogin, setIsLogin] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        // Danh sách route hợp lệ sẽ hiển thị Nav
        const allowed = [
            '/',
            '/login',
            '/register',
            '/camera',
            '/dashboard',
            '/smartswitch',
            '/modelai',
            '/database',
            '/profile',
        ];
        const path = location.pathname || '';
        const show = allowed.some((p) => path === p || path.startsWith(p + '/'));
        // Ẩn Nav khi truy cập đường dẫn không tồn tại (NotFound)
        if (!show) {
            setIsShow(false);
        } else {
            // Riêng trang login/register cũng ẩn Nav
            if (path === '/login' || path === '/register') setIsShow(false);
            else setIsShow(true);
        }

        // 2. Kiểm tra session mỗi khi location thay đổi (để cập nhật ngay khi login/logout xong)
        let session = sessionStorage.getItem('account');
        if (session) {
            setIsLogin(true);
            try {
                const obj = JSON.parse(session);
                setUserEmail(obj?.email || '');
                const gId = obj?.groupId ?? obj?.group_id ?? obj?.group?.id;
                const gName = obj?.group?.groupname ?? obj?.groupName;
                const gidNum = Number(gId);
                setIsAdmin(gidNum === 1 || (gName && String(gName).toLowerCase() === 'admin'));
            } catch {
                setUserEmail('');
            }
        } else {
            setIsLogin(false);
            setUserEmail('');
        }
    }, [location]);

    const handleLogin = () => {
        history.push('/login');
    }

    const handleRegister = () => {
        history.push('/register');
    }

    // 3. Hàm xử lý đăng xuất
    const handleLogout = () => {
        sessionStorage.removeItem('account');
        setIsLogin(false);
        history.push('/login');
        // window.location.reload(); // Có thể dùng nếu cần refresh sạch state
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    return (
        <>
            {isShow &&
                <header className="custom-nav">
                    <div className="container-fluid px-4 px-sm-5 py-3 d-flex align-items-center justify-content-between">
                        {/* Logo Section */}
                        <NavLink to="/" className="text-decoration-none">
                            <div className="d-flex align-items-center gap-3 text-white">
                                <div className="nav-logo text-primary">
                                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                                <h2 className="brand-name d-none d-sm-block mb-0">Smart Rural Portal</h2>
                            </div>
                        </NavLink>

                        {/* Desktop Menu */}
                        <div className="d-none d-md-flex flex-grow-1 justify-content-end align-items-center gap-4">
                            <div className="nav-links d-flex gap-4 align-items-center">
                                <NavLink to="/camera" className="nav-item">Camera</NavLink>
                                <NavLink to="/dashboard" className="nav-item">Dashboard</NavLink>
                                <NavLink to="/smartswitch" className="nav-item">SmartSwitch</NavLink>
                                {isAdmin && <NavLink to="/database" className="nav-item">Database</NavLink>}
                                {isLogin && userEmail && (
                                    <NavLink to="/profile" className="nav-item">
                                        <span className="user-email ms-2 me-2 text-white-50 small">{userEmail}</span>
                                    </NavLink>

                                )}
                            </div>

                            {/* 4. Render có điều kiện cho Desktop */}
                            <div className="auth-buttons d-flex gap-2">
                                {isLogin === false ? (
                                    // Chưa đăng nhập: Hiện Login/Signup
                                    <>
                                        <button className="btn btn-outline-light btn-sm fw-bold" onClick={handleLogin}>Log In</button>
                                        <button className="btn btn-primary btn-sm fw-bold text-dark" onClick={handleRegister}>Sign Up</button>
                                    </>
                                ) : (
                                    // Đã đăng nhập: Hiện email và nút Logout
                                    <button className="btn btn-danger btn-sm fw-bold" onClick={handleLogout}><i className="bi bi-box-arrow-right" style={{ fontSize: "1rem" }}></i></button>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="d-md-none">
                            <button className="btn text-white p-0" onClick={toggleMobileMenu}>
                                <i className="bi bi-list" style={{ fontSize: '1.5rem' }}></i>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                        <div className="mobile-menu d-md-none bg-dark p-3 border-top border-secondary">
                            <NavLink to="/camera" className="d-block py-2 text-white text-decoration-none" onClick={() => setIsMobileMenuOpen(false)}>Camera</NavLink>
                            <NavLink to="/dashboard" className="d-block py-2 text-white text-decoration-none" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>
                            <NavLink to="/smartswitch" className="d-block py-2 text-white text-decoration-none" onClick={() => setIsMobileMenuOpen(false)}>SmartSwitch</NavLink>
                            {isAdmin && (
                                <NavLink to="/database" className="d-block py-2 text-white text-decoration-none" onClick={() => setIsMobileMenuOpen(false)}>Database</NavLink>
                            )}
                            <NavLink to="/profile" className="d-block py-2 text-white text-decoration-none" onClick={() => setIsMobileMenuOpen(false)}>Profile</NavLink>
                            <hr className="text-white" />

                            {/* 5. Render có điều kiện cho Mobile */}
                            <div className="d-flex gap-2 mt-3">
                                {isLogin === false ? (
                                    <>
                                        <button className="btn btn-outline-light flex-grow-1" onClick={handleLogin}>Log In</button>
                                        <button className="btn btn-primary flex-grow-1 text-dark" onClick={handleRegister}>Sign Up</button>
                                    </>
                                ) : (
                                    <button className="btn btn-danger flex-grow-1" onClick={handleLogout}>Log Out</button>
                                )}
                            </div>
                        </div>
                    )}
                </header>
            }
        </>
    );
}

export default Nav;