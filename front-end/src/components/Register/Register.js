import './Register.scss';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { registerNewUser } from '../../services/userService';

const Register = (props) => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const defaultValidInput = {
        isValidEmail: true,
        isValidPhone: true,
        isValidUsername: true,
        isValidPassword: true,
        isValidConfirmPassword: true
    };

    const [objCheckInput, setObjCheckInput] = useState(defaultValidInput);

    let history = useHistory();

    const handleLogin = () => {
        history.push('/login');
    }

    const isValidImputs = () => {
        setObjCheckInput(defaultValidInput);

        if (!email) {
            toast.error('Please enter your email address');
            setObjCheckInput({ ...defaultValidInput, isValidEmail: false });
            return false;
        }
        // check email is valid
        let regxEmail = /\S+@\S+\.\S+/;
        if (!regxEmail.test(email)) {
            toast.error('Please enter a valid email address');
            setObjCheckInput({ ...defaultValidInput, isValidEmail: false });
            return false;
        }
        if (!phone) {
            toast.error('Please enter your phone number');
            setObjCheckInput({ ...defaultValidInput, isValidPhone: false });
            return false;
        }
        //check phone number is valid
        let regxPhone = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
        if (!regxPhone.test(phone)) {
            toast.error('Please enter a valid phone number');
            setObjCheckInput({ ...defaultValidInput, isValidPhone: false });
            return false;
        }
        if (!username) {
            toast.error('Please enter your username');
            setObjCheckInput({ ...defaultValidInput, isValidUsername: false });
            return false;
        }
        if (!password) {
            toast.error('Please enter your password');
            setObjCheckInput({ ...defaultValidInput, isValidPassword: false });
            return false;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            setObjCheckInput({ ...defaultValidInput, isValidPassword: false });
            return false;
        }
        if (password !== confirmPassword) {
            setObjCheckInput({ ...defaultValidInput, isValidConfirmPassword: false });
            toast.error('Password does not match');
            return false;
        }

        return true;
    }

    const handlePressEnter = (event) => {
        if (event.key === 'Enter') {
            handleRegister();
        }
    }

    const handleRegister = async () => {
        let isValid = isValidImputs();

        if (isValid) {
            // Gọi API đăng ký
            try {
                let response = await registerNewUser(email, phone, username, password);
                let serverData = response.data;
                if (+serverData.EC === 0) {
                    toast.success(serverData.EM);
                    history.push('/login');
                } else {
                    toast.error(serverData.EM);
                }
            } catch (e) {
                toast.error("Error connecting to server");
            }
        }
    }

    useEffect(() => {
        let session = sessionStorage.getItem('account');
        if (session) {
            history.push('/');
            window.location.reload();
        }
    }, [history]);

    return (
        <div className="register-container">
            <div className="register-content">
                <div className="register-card shadow-lg">
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
                        <h2 className="title-register">Create an Account</h2>
                        <p className="sub-title">Join us and manage your devices with ease</p>
                    </div>

                    {/* Form Section */}
                    <div className="d-flex flex-column gap-3">
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <input
                                type="email"
                                className={`form-control custom-input ${objCheckInput.isValidEmail ? '' : 'is-invalid'}`}
                                placeholder="guest@example.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone number</label>
                            <input
                                type="tel"
                                className={`form-control custom-input ${objCheckInput.isValidPhone ? '' : 'is-invalid'}`}
                                placeholder="0123456789"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className={`form-control custom-input ${objCheckInput.isValidUsername ? '' : 'is-invalid'}`}
                                placeholder="Enter your Username"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className={`form-control custom-input ${objCheckInput.isValidPassword ? '' : 'is-invalid'}`}
                                placeholder="Enter your Password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Re-enter password</label>
                            <input
                                type="password"
                                className={`form-control custom-input ${objCheckInput.isValidConfirmPassword ? '' : 'is-invalid'}`}
                                placeholder="Re-enter Password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                onKeyDown={(event) => handlePressEnter(event)}
                            />
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary custom-btn w-100"
                            onClick={() => handleRegister()}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Login button */}
                    <div className="text-center">
                        <p className="footer-text">Already have an account?
                            <span className="login-link ms-1" onClick={() => handleLogin()}>
                                Log in
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;