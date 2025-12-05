import './Register.scss';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios';
import { use, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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

    // useEffect(() => {
    //     axios.get('http://localhost:8080/api/v1/users').then(data => {
    //         console.log('>>> check data:', data);
    //     })
    // }, []);

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

    const handleRegister = () => {

        let isValid = isValidImputs();

        let userData = { email, phone, username, password, confirmPassword };

        if (isValid) {
            axios.get('http://localhost:8080/api/v1/users', userData).then(data => {
                console.log('>>> check data:', data);
            })
        }

        console.log(userData);
    }

    return (
        <div className="register-container">
            <div className="container">
                <div className="row px-3 px-sm-0">
                    <div className="content-left col-12 d-none col-sm-7 d-sm-flex flex-column">
                        <div className='brand'>
                            Smart Portal Website
                        </div>
                        <div className='detail'>
                            Smart Portal Website for manage village
                        </div>
                    </div>
                    <div className="content-right col-sm-5 col-12 d-flex flex-column gap-3 py-3">
                        <div className='brand d-sm-none'>
                            Smart Portal Website
                        </div>

                        <div className='form-group'>
                            <label>Email address</label>
                            <input type="text" className={objCheckInput.isValidEmail ? 'form-control' : 'form-control is-invalid'} placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} />
                        </div>

                        <div className='form-group'>
                            <label>Phone</label>
                            <input type="text" className={objCheckInput.isValidPhone ? 'form-control' : 'form-control is-invalid'} placeholder="Phone number" value={phone} onChange={(event) => setPhone(event.target.value)} />
                        </div>

                        <div className='form-group'>
                            <label>Username</label>
                            <input type="text" className={objCheckInput.isValidUsername ? 'form-control' : 'form-control is-invalid'} placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} />
                        </div>

                        <div className='form-group'>
                            <label>Password</label>
                            <input type="password" className={objCheckInput.isValidPassword ? 'form-control' : 'form-control is-invalid'} placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
                        </div>

                        <div className='form-group'>
                            <label>Re-enter Password</label>
                            <input type="password" className={objCheckInput.isValidConfirmPassword ? 'form-control' : 'form-control is-invalid'} placeholder="Re-enter Password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                        </div>

                        <button type="submit" className="btn btn-primary" onClick={() => handleRegister()}>Register</button>

                        <hr />
                        <div className='text-center'>
                            <button type="submit" className="btn btn-success" onClick={() => handleLogin()}>
                                Already have an account? Login
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Register;