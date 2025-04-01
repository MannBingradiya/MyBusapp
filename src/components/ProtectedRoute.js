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
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Prevents instant logout

    const validateToken = async () => {
        try {
            dispatch(ShowLoading());
            const response = await axios.post("/api/users/get-user-by-id", {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            dispatch(HideLoading());

            if (response.data.success) {
                dispatch(SetUser(response.data.data));
                setIsAuthenticated(true); // ✅ Mark as authenticated after successful response
            } else {
                handleLogout("Session expired. Please log in again.");
            }
        } catch (error) {
            dispatch(HideLoading());

            if (error.response && error.response.status === 401) {
                handleLogout("Session expired. Please log in again.");
            } else {
                message.error("Something went wrong. Please try again.");
            }
        }
    };

    const handleLogout = (msg) => {
        localStorage.removeItem("token");
        message.error(msg);
        navigate('/login');
    };

    useEffect(() => {
        if (localStorage.getItem('token')) {
            validateToken();
        } else {
            navigate('/login');
        }
    }, []);

    return (
        <div>
            {isAuthenticated && user && <DefaultLayout>{children}</DefaultLayout>}
        </div>
    );
}

export default ProtectedRoute;
