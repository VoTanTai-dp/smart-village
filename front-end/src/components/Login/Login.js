import './Login.scss';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useState } from 'react';
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

        let response = await loginUser(valueLogin, password);

        let serverData = response.data;

        if (response && response.data && +serverData.EC === 0) {
            toast.success(serverData.EM);
            let data = {
                isAuthenticated: true,
                token: 'fake token'
            }
            sessionStorage.setItem('account', JSON.stringify(data));
            history.push('/');
        }

        if (response && response.data && +serverData.EC !== 0) {
            toast.error(serverData.EM);
        }
    }

    const handleCreateNewAccount = () => {
        history.push('/register');
    }

    return (
        <div className="login-container">
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
                        <input type="text" className={objValidInput.isValidValueLogin ? 'form-control' : 'form-control is-invalid'} placeholder="Email address or phone number"
                            value={valueLogin} onChange={(event) => { setValueLogin(event.target.value) }}
                        />

                        <input type="password" className={objValidInput.isValidPassword ? 'form-control' : 'form-control is-invalid'} placeholder="Password"
                            value={password} onChange={(event) => { setPassword(event.target.value) }}
                        />

                        <button type="submit" className="btn btn-primary" onClick={() => handleLogin()}>Login</button>
                        <span className=" text-center">
                            <a className='forgot' href="#">Forgot password?</a>
                        </span>
                        <hr />
                        <div className='text-center'>
                            <button type="submit" className="btn btn-success" onClick={() => handleCreateNewAccount()}>
                                Create New Account
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Login;