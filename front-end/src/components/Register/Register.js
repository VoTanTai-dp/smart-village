import './Register.scss';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios';

const Register = (props) => {
    let history = useHistory();
    const heandleLogin = () => {
        history.push('/login');
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
                            <input type="text" className="form-control" placeholder="Email address" />
                        </div>

                        <div className='form-group'>
                            <label>Phone</label>
                            <input type="text" className="form-control" placeholder="Phone number" />
                        </div>

                        <div className='form-group'>
                            <label>Username</label>
                            <input type="text" className="form-control" placeholder="Username" />
                        </div>

                        <div className='form-group'>
                            <label>Password</label>
                            <input type="password" className="form-control" placeholder="Password" />
                        </div>

                        <div className='form-group'>
                            <label>Re-enter Password</label>
                            <input type="password" className="form-control" placeholder="Re-enter Password" />
                        </div>

                        <button type="submit" className="btn btn-primary">Register</button>

                        <hr />
                        <div className='text-center'>
                            <button type="submit" className="btn btn-success" onClick={() => heandleLogin()}>
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