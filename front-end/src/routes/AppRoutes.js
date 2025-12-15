import {
    Switch,
    Route
} from "react-router-dom";
import Login from "../components/Login/Login";
import Register from "../components/Register/Register";
import HomePage from '../components/HomePage/HomePage';
import Camera from "../components/Camera/Camera";
import PrivateRoutes from "./PrivateRoutes";
import ModelAI from "../components/ModelAI/ModelAI";
import Dashboard from "../components/Dashboard/Dashboard";
import Profile from "../components/Profile/Profile";
import NotFound from "../components/NotFound/NotFound";
import Database from "../components/Database/Database";

const AppRoutes = (props) => {
    return (
        <>
            <Switch>
                <PrivateRoutes path="/camera" component={Camera} />

                <PrivateRoutes path='/dashboard' component={Dashboard} />

                <PrivateRoutes path="/modelai" component={ModelAI} />

                <PrivateRoutes path="/profile" component={Profile} />

               <PrivateRoutes path="/database/:table?" component={Database} />

                <Route path="/login">
                    <Login />
                </Route>

                <Route path="/register">
                    <Register />
                </Route>
                <Route path="/" exact>
                    <HomePage />
                </Route>

                <Route path="*">
                    <NotFound />
                </Route>
            </Switch>
        </>
    )
};

export default AppRoutes;