import { useEffect } from "react";
import { useState } from "react";
import { Button } from './components/ui/button';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Auth from './pages/auth/index.jsx';
import Chat from './pages/chat';
import { apiClient } from "@/lib/api-client.js";
import Profile from './pages/profile';
import { useAppStore } from './store';
import { GET_USER_INFO } from "@/utils/constants.js";

const App = () => {
    const { userInfo, setUserInfo } = useAppStore();
    const [loading, setLoading] = useState(true);

    const PrivateRoute = ({ children }) => {
        const { userInfo } = useAppStore();
        const isAuthenticated = !!userInfo;
        return isAuthenticated ? children : <Navigate to="/auth" />;
    };

    const AuthRoute = ({ children }) => {
        const { userInfo } = useAppStore();
        const isAuthenticated = !!userInfo;
        return isAuthenticated ? <Navigate to="/chat" /> : children;
    };

    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await apiClient.get(GET_USER_INFO, {
                    withCredentials: true,
                });

                if (response.status === 200 && response.data.id) {
                    setUserInfo(response.data);
                } else {
                    setUserInfo(undefined);
                }
            } catch (error) {
                setUserInfo(undefined);
            } finally {
                setLoading(false);
            }
        };

        if (!userInfo) {
            getUserData();
        } else {
            setLoading(false);
        }
    }, [userInfo, setUserInfo]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/auth"
                    element={
                        <AuthRoute>
                            <Auth />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/chat"
                    element={
                        <PrivateRoute>
                            <Chat />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/auth" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;