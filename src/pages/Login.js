import React from 'react';
import { Form } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { message } from "antd";
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import '../resources/auth.css';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, values);
      dispatch(HideLoading());

      console.log("Login Response:", response.data);

      if (response.data.success) {
        message.success(response.data.message);
        localStorage.setItem("token", response.data.data);
        console.log("Stored Token:", localStorage.getItem("token"));

        // ✅ Remove delay and navigate immediately
        navigate("/home");
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      console.error("Login Error:", error);
      message.error(error.message || "Login failed.");
    }
  };

  return (
    <div className='h-screen d-flex justify-content-center align-items-center bg-blur'>
      <div className='w-400 card p-3'>
        <h1 className='text-lg'>CaliBus: Login</h1>
        <hr />
        <Form layout='vertical' onFinish={onFinish}>
          <Form.Item label='Email' name='email'>
            <input type="text" />
          </Form.Item>
          <Form.Item label='Password' name='password'>
            <input type="password" />
          </Form.Item>
          <div className="d-flex justify-content-between align-items-center my-3">
            <Link to="/register">Click here to Register</Link>
            <button className='secondary-btn' type="submit">Login</button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Login;
