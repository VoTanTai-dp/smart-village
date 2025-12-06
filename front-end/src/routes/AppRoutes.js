import {
    Switch,
    Route
} from "react-router-dom";
import Login from "../components/Login/Login";
import Register from "../components/Register/Register";
import HomePage from '../components/HomePage/HomePage';

const AppRoutes = (props) => {
    return (
        <>
            <Switch>
                <Route path="/" exact>
                    <HomePage />
                </Route>

                <Route path="/login">
                    <Login />
                </Route>

                <Route path="/register">
                    <Register />
                </Route>

                <Route path="/camera">
                    Camera
                </Route>

                <Route path="/modelai">
                    Model AI
                </Route>

                <Route path="*">
                    404 Not Found
                </Route>
            </Switch>
        </>
    )
};

export default AppRoutes;