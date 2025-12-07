import React, { use } from 'react';
import './Nav.scss';
import { NavLink, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { useEffect, useState } from 'react';

const Nav = (props) => {
    const [isShow, setIsShow] = useState(true);
    let location = useLocation();

    useEffect(() => {
        let session = sessionStorage.getItem('account');
        if (location.pathname === '/login' || location.pathname === '/register') {
            setIsShow(false);
        }
    }, [])
    return (
        <>
            {isShow === true &&
                <div>
                    <div className="topnav">
                        <NavLink to="/" exact>Home</NavLink>
                        <NavLink to="/camera">Camera</NavLink>
                        <NavLink to="/modelai">Model AI</NavLink>
                    </div>
                </div>
            }
        </>
    );
}

export default Nav;