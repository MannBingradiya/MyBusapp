import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { SetUser } from '../redux/usersSlice';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import DefaultLayout from './DefaultLayout';

function ProtectedRoute({ children }) {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.users);
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(null); // ✅ Use `null` for initial loading state

    const validateToken = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            handleLogout("Session expired. Please log in again.");
            return;
        }

        try {
            dispatch(ShowLoading());
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/get-user-by-id`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dispatch(HideLoading());

            if (response.data.success) {
                dispatch(SetUser(response.data.data));
                setIsAuthenticated(true);
            } else {
                handleLogout(response.data.message || "Session expired. Please log in again.");
            }
        } catch (error) {
            dispatch(HideLoading());
            handleLogout("Session expired. Please log in again.");
        }
    };

    const handleLogout = (msg) => {
        localStorage.removeItem("token");
        message.error(msg);
        navigate('/login');
    };

    useEffect(() => {
        validateToken();
    }, []);

    // ✅ Show a loading message while checking authentication
    if (isAuthenticated === null) {
        return <h2>Loading...</h2>;
    }

    return isAuthenticated && user ? <DefaultLayout>{children}</DefaultLayout> : null;
}

export default ProtectedRoute;
