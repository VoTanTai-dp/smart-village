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

const AppRoutes = (props) => {
    return (
        <>
            <Switch>
                <PrivateRoutes path="/camera" component={Camera} />

                <PrivateRoutes path='/dashboard' component={Dashboard} />

                <PrivateRoutes path="/modelai" component={ModelAI} />

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
                    404 Not Found
                </Route>
            </Switch>
        </>
    )
};

export default AppRoutes;