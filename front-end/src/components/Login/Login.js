import './Login.scss';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const Login = (props) => {
    let history = useHistory();
    const heandleCreateNewAccount = () => {
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
                        <input type="text" className="form-control" placeholder="Email address" />
                        <input type="password" className="form-control" placeholder="Password" />
                        <button type="submit" className="btn btn-primary">Login</button>
                        <span className=" text-center">
                            <a className='forgot' href="#">Forgot password?</a>
                        </span>
                        <hr />
                        <div className='text-center'>
                            <button type="submit" className="btn btn-success" onClick={() => heandleCreateNewAccount()}>
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