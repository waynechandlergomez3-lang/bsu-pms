import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from "pages/Login";
import Dashboard from 'pages/dashboard';
import Home from 'pages/home';
import Parkingspaces from 'pages/parkingspaces';
import UserList from 'pages/userlist';
import EditParking from 'pages/editparkingspace';
import ForgotPassword from 'pages/forgotpassword'; 
import Messages from 'pages/messages';
import PendingList from 'pages/pendinglist';

const MainRoutes = () =>{
    return(
        <Router>
            <Routes>
            <Route path="/admin/sign-in" element={<Login />}/>
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/" element={<Home />}>
            <Route path="/dashboard" element={<Dashboard />}/>
            <Route path="/parkingspaces" element={<Parkingspaces />}/>
            <Route path="/userlist" element={<UserList />}/>
            <Route path="/editparkingspace" element={<EditParking />}/>
            <Route path="/messages" element={<Messages />}/>
            <Route path="/pendinglist" element={<PendingList />}/>
            </Route>
            
    </Routes>
</Router>

    )
}

export default MainRoutes;

