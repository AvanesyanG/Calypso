import { Tabs, TabsList } from "@/components/ui/tabs";
import { TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client.js";
import { SIGNUP_ROUTE, LOGIN_ROUTE } from "@/utils/constants.js";
import { useAppStore } from "@/store/index.js";

const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [invitationCode, setInvitationCode] = useState("");
    const {setUserInfo} = useAppStore();
  
    const navigate = useNavigate();

    const validateLogin = () => {
        if (!email.length) {
            toast.error("Email is required.");
            return false;
        }
        if (!password.length) {
            toast.error("Password is required.");
        return false;
        }
        return true;
    }; 

    const handleLogin = async () => {
        if (validateLogin()) {
            const response = await apiClient.post(LOGIN_ROUTE, {email, password}, {withCredentials: true});
            setUserInfo(response.data.user);
            if(response.data.user.id) {
                if(response.data.user.profileSetup) {
                    navigate('/chat') 
                } else {
                    navigate('/profile')
                }
            }
        }
    }

    const validateSignup = () => {
        if (!email.length) {
            toast.error("Email is required.");
            return false;
        }

        let regExp = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if(!regExp.test(email)) {
            toast.error("Email is invalid format.");
            return false;
        }

        if (!password.length) {
            toast.error("Password is required.");
            return false;
        }
        if (!confirmPassword.length || (confirmPassword!==password)) {
            toast.error("Password and Confirm Password should be the same.");
            return false;
        }

        return true;
    };

    const handleSignup = async () => {
        if (validateSignup()) {
            try {
                const response = await apiClient.post(SIGNUP_ROUTE, {email, password, invitationCode}, {withCredentials: true});
                setUserInfo(response.data.user);

                if(response.status===201) {
                    navigate("/profile");
                }
                           
            } catch (error) {
                if (error.response.status===403) {
                    toast.error('Acess denied. Invitation code is invalid.');
                    console.log(error.message); 
                }

                if (error.response.status===409) {
                    toast.error('Current user already exists. Please contact admin to udpate password.');
                    console.log(error.message); 
                }
            }
        }
    } 

    return (
        <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-y-auto poppins-regular px-4 py-8">
            <div className="bg-white border-2 border-white text-opacity-90 shadow-2xl w-full max-w-[500px] rounded-3xl p-4 sm:p-6 md:p-8">
                <div className="flex flex-col gap-4 items-center justify-center">
                    <div className="flex justify-center items-center gap-3 sm:gap-5">
                        <svg
                            id="logo-38"
                            width="62"
                            height="40"
                            viewBox="0 0 78 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="sm:w-[82px] sm:h-[50px]"
                        >
                            {" "}
                            <path
                                d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
                                className="ccustom"
                                fill="#8338ec"
                            ></path>{" "}
                            <path
                                d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
                                className="ccompli1"
                                fill="#975aed"
                            ></path>{" "}
                            <path
                                d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
                                className="ccompli2"
                                fill="#a16ee8"
                            ></path>{" "}
                        </svg>
                        <span className="text-2xl sm:text-3xl uppercase text-neutral-700 font-medium"> Calypso </span> 
                    </div>
                    <div className="flex items-center justify-center w-full">
                        <Tabs className="w-full" defaultValue="login">
                            <TabsList className="bg-transparent rounded-none w-full py-6 sm:py-8">
                                <TabsTrigger value="login" className="data-[state=active]:bg-transparent text-neutral-700 text-opacity-0- border-b-2 rounded-none w-full data-[state=active]:text-neutral-700 data-[state=active]:font-medium data-[state=active]:border-b-purple-500 p-1 transition-all duration-300 text-sm sm:text-base"> Login </TabsTrigger>
                                <TabsTrigger value="signup" className="data-[state=active]:bg-transparent text-neutral-700 text-opacity-0- border-b-2 rounded-none w-full data-[state=active]:text-neutral-700 data-[state=active]:font-medium data-[state=active]:border-b-purple-500 p-1 transition-all duration-300 text-sm sm:text-base"> Sign Up </TabsTrigger>
                            </TabsList>
                            <TabsContent className="flex flex-col gap-3 w-full py-4" value="login">
                                <Input 
                                    placeholder="Email"
                                    type="email"
                                    className="rounded-full p-2.5 sm:p-3 text-sm sm:text-base"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Input 
                                    placeholder="Password"
                                    type="password"
                                    className="rounded-full p-2.5 sm:p-3 text-sm sm:text-base"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Button className="rounded-full p-2.5 sm:p-3 text-sm sm:text-base" onClick={handleLogin}>Login</Button>
                            </TabsContent>
                            <TabsContent className="flex flex-col gap-3" value="signup">
                                <Input 
                                    placeholder="Email"
                                    type="email"
                                    className="rounded-full p-2.5 sm:p-3 text-sm sm:text-base"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Input 
                                    placeholder="Password"
                                    type="password"
                                    className="rounded-full p-2.5 sm:p-3 text-sm sm:text-base"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Input 
                                    placeholder="Confirm Password"
                                    type="password"
                                    className="rounded-full p-2.5 sm:p-3 text-sm sm:text-base"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <Input 
                                    placeholder="Input Invitation Code"
                                    type="text"
                                    className="rounded-full p-2.5 sm:p-3 text-sm sm:text-base"
                                    value={invitationCode}
                                    onChange={(e) => setInvitationCode(e.target.value)}
                                />
                                <Button className="rounded-full p-2.5 sm:p-3 text-sm sm:text-base mb-3" onClick={handleSignup}>Sign Up</Button>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth;
