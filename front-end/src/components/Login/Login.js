import './Login.scss';

const Login = (props) => {
    return (
        <div className="login-container mt-3">
            <div className="container">
                <div className="row">
                    <div className="content-left col-7 d-flex flex-column">
                        <div className='brand'>
                            Smart Portal Website
                        </div>
                        <div className='detail'>
                            Smart Portal Website for manage village
                        </div>
                    </div>
                    <div className="content-right col-5 d-flex flex-column gap-3 py-3">
                        <input type="text" className="form-control" placeholder="Email address" />
                        <input type="password" className="form-control" placeholder="Password" />
                        <button type="submit" className="btn btn-primary">Login</button>
                        <span className="forgot-password text-center">Forgot password?</span>
                        <hr />
                        <div className='text-center'>
                            <button type="submit" className="btn btn-success">Create New Account</button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Login;