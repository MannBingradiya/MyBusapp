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
        const token = localStorage.getItem('token');

        if (!token) {
            handleLogout("Session expired. Please log in again.");
            return;
        }

        try {
            dispatch(ShowLoading());

            const response = await axios.post("/api/users/get-user-by-id", {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            dispatch(HideLoading());

            if (response.status === 200 && response.data.success) {
                dispatch(SetUser(response.data.data));
                setIsAuthenticated(true); // ✅ Mark as authenticated
            } else {
                handleLogout(response.data.message || "Session expired. Please log in again.");
            }
        } catch (error) {
            dispatch(HideLoading());

            if (error.response) {
                if (error.response.status === 401) {
                    handleLogout("Session expired. Please log in again.");
                } else {
                    message.error(error.response.data.message || "Something went wrong. Please try again.");
                }
            } else {
                message.error("Network error. Please check your connection.");
            }
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

    return isAuthenticated && user ? <DefaultLayout>{children}</DefaultLayout> : null;
}

export default ProtectedRoute;
