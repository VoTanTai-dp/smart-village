import React, { useState, useEffect } from 'react';
import './Nav.scss';
import { NavLink, useLocation, useHistory } from 'react-router-dom';

const Nav = (props) => {
    const [isShow, setIsShow] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // 1. Thêm state để kiểm tra trạng thái đăng nhập
    const [isLogin, setIsLogin] = useState(false);

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        // Ẩn Nav ở trang login và register
        if (location.pathname === '/login' || location.pathname === '/register') {
            setIsShow(false);
        } else {
            setIsShow(true);
        }

        // 2. Kiểm tra session mỗi khi location thay đổi (để cập nhật ngay khi login/logout xong)
        let session = sessionStorage.getItem('account');
        if (session) {
            setIsLogin(true);
        } else {
            setIsLogin(false);
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
                            <div className="nav-links d-flex gap-4">
                                <NavLink to="/camera" className="nav-item">Camera</NavLink>
                                <NavLink to="/modelai" className="nav-item">Model AI</NavLink>
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
                                    // Đã đăng nhập: Hiện nút Logout
                                    <button className="btn btn-danger btn-sm fw-bold" onClick={handleLogout}>Log Out</button>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="d-md-none">
                            <button className="btn text-white p-0" onClick={toggleMobileMenu}>
                                <span className="material-symbols-outlined fs-2">Menu</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                        <div className="mobile-menu d-md-none bg-dark p-3 border-top border-secondary">
                            <NavLink to="/camera" className="d-block py-2 text-white text-decoration-none" onClick={() => setIsMobileMenuOpen(false)}>Camera</NavLink>
                            <NavLink to="/modelai" className="d-block py-2 text-white text-decoration-none" onClick={() => setIsMobileMenuOpen(false)}>Model AI</NavLink>
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