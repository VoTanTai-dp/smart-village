import './Login.scss';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { loginUser } from '../../services/userService';

const Login = (props) => {
    let history = useHistory();

    const [valueLogin, setValueLogin] = useState('');
    const [password, setPassword] = useState('');

    const defaultObjValidInput = {
        isValidValueLogin: true,
        isValidPassword: true
    };

    const [objValidInput, setObjValidInput] = useState(defaultObjValidInput);

    const handleLogin = async () => {
        setObjValidInput(defaultObjValidInput);
        if (!valueLogin) {
            setObjValidInput({ ...defaultObjValidInput, isValidValueLogin: false });
            toast.error('Please enter your email address or phone number');
            return;
        }

        if (!password) {
            setObjValidInput({ ...defaultObjValidInput, isValidPassword: false });
            toast.error('Please enter your password');
            return;
        }

        try {
            let response = await loginUser(valueLogin, password);
            let serverData = response.data;

            if (response && response.data && +serverData.EC === 0) {
                toast.success(serverData.EM);
                let data = {
                    isAuthenticated: true,
                    token: 'fake token', // Bạn nên lấy token thật từ serverData nếu có
                    email: valueLogin // Lưu email (hoặc giá trị đăng nhập) để hiển thị trên Nav
                }
                sessionStorage.setItem('account', JSON.stringify(data));
                history.push('/');
                window.location.reload();
            } else {
                toast.error(serverData.EM);
            }
        } catch (e) {
            toast.error("Error from server or connection refused");
        }
    }

    const handlePressEnter = (event) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    }

    const handleCreateNewAccount = () => {
        history.push('/register');
    }

    useEffect(() => {
        let session = sessionStorage.getItem('account');
        if (session) {
            history.push('/');
        }
    }, [history]);

    return (
        <div className="login-container">
            <div className="login-content d-flex align-items-center justify-content-center">
                <div className="login-card shadow-lg">
                    {/* Header Section */}
                    <div className="text-center mb-5">
                        <div className="d-inline-flex align-items-center justify-content-center mb-3">
                            <div className="brand-logo">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <h1 className="brand-name ms-3 mb-0">Smart Rural Management Portal</h1>
                        </div>
                        <h2 className="title-login">Log In to Your Account</h2>
                        <p className="sub-title">Welcome! Please enter your information</p>
                    </div>

                    {/* Form Section */}
                    <div className="form-input-section d-flex flex-column gap-3">
                        {/* Email/Phone Input */}
                        <div className="form-group">
                            <label className="form-label">Email address or phone number</label>
                            <input
                                type="text"
                                className={`form-control custom-input ${objValidInput.isValidValueLogin ? '' : 'is-invalid'}`}
                                placeholder="you@example.com"
                                value={valueLogin}
                                onChange={(event) => setValueLogin(event.target.value)}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="form-group">
                            {/* <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="form-label mb-0">Password</label>
                                <a className="forgot-password" href="#">Forgot password?</a>
                            </div> */}
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className={`form-control custom-input ${objValidInput.isValidPassword ? '' : 'is-invalid'}`}
                                placeholder="Password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                onKeyDown={(event) => handlePressEnter(event)}
                            />
                        </div>

                        {/* Login Button */}
                        <button
                            type="button"
                            className="btn btn-primary custom-btn w-100 mt-3"
                            onClick={() => handleLogin()}
                        >
                            Log In
                        </button>
                    </div>

                    {/* Sign up button */}
                    <div className="text-center mt-4">
                        <p className="footer-text">Don't have an account?
                            <span className="sign-up-link ms-1" onClick={() => handleCreateNewAccount()}>
                                Sign up
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;