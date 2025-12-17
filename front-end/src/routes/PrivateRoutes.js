import { useEffect } from "react"
import { Route } from "react-router-dom";
import { useHistory } from "react-router-dom";


const PrivateRoutes = (props) => {
    let history = useHistory();

   useEffect(() => {
       let session = sessionStorage.getItem('account');
       if (!session) {
           history.push('/login');
           window.location.reload();
           return;
       }
       // Nếu là route database, yêu cầu admin (groupId = 1)
       try {
           const path = props.path || '';
           if (String(path).startsWith('/database')) {
               const acc = JSON.parse(session);
               const gId = acc?.groupId ?? acc?.group_id ?? acc?.group?.id;
               const gName = acc?.group?.groupname ?? acc?.groupName;
               const isAdmin = gId === 1 || (gName && String(gName).toLowerCase() === 'admin');
               if (!isAdmin) {
                   history.push('/');
                   window.location.reload();
               }
           }
       } catch {}
   }, [])

    return (
        <>
            <Route path={props.path} component={props.component} />
        </>
    )
}

export default PrivateRoutes