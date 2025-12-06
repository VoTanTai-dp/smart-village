import React from 'react';
import './Nav.scss';
import { NavLink } from 'react-router-dom/cjs/react-router-dom.min';

const Nav = (props) => {
    return (
        <div>
            <div className="topnav">
                <NavLink to="/" exact>Home</NavLink>
                <NavLink to="/camera">Camera</NavLink>
                <NavLink to="/modelai">Model AI</NavLink>
            </div>
        </div>
    );
}

export default Nav;