import React from 'react';
import './NotFound.scss';
import { useHistory } from 'react-router-dom';

const NotFound = () => {
    let history = useHistory();

    const handleGoHome = () => {
        history.push('/');
    };

    return (
        <div className="not-found-container">
            {/* Background Grid Pattern */}
            <div className="bg-grid-pattern"></div>

            {/* Main Content */}
            <main className="content-wrapper">
                <div className="text-center">
                    <h1 className="error-code">404</h1>
                    <h2 className="error-title">Page Not Found</h2>
                    <p className="error-desc">
                        The page you requested could not be found. It might have been removed, renamed, or doesn't exist.
                    </p>

                    <button className="btn-home" onClick={handleGoHome}>
                        <i className="bi bi-house-fill"></i>
                        <span>Return to HomePage</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default NotFound;