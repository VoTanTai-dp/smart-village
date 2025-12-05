import { useEffect } from "react"
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const HomePage = (props) => {
    let history = useHistory();

    useEffect(() => {
        let session = sessionStorage.getItem('account');
        if (!session) {
            history.push('/login');
        }
    }, [])

    return (
        <div>
            <h1>Home</h1>
        </div>
    )
}

export default HomePage
