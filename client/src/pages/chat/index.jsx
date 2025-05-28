import {useAppStore} from "@/store/index.js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "sonner";
import ChatContainer from "./components/chat-container";
import ContactsContainer from "./components/contacts-container";
import EmptyChatContainer from "./components/empty-chat-container";

const Chat = () => {

    const {userInfo, selectedChatType, isUploading, isDownloading, fileUploadProgress, fileDownloadProgress} = useAppStore();

    const navigate = useNavigate();

    useEffect(()=> {
        if(!userInfo.profileSetup) {
            toast('Please setup profile to continue.')
            navigate("/profile");
        }
    }, [userInfo, navigate]);

    return (
        <div className="flex h-[100dvh] text-white overflow-hidden">
            {
                isUploading && 
                    <div className="h-[100dvh] w-[100dvw] fixed top-0 z-10 flex justify-center items-center left-0 flex-col gap-5 bg-black/80 backdrop-blur-xl"> 
                        <h5 className="text-5xl animate-pulse">Uploading File</h5>
                        {fileUploadProgress}%
                    </div>
            }

            {
                isDownloading && 
                    <div className="h-[100dvh] w-[100dvw] fixed top-0 z-10 flex justify-center items-center left-0 flex-col gap-5 bg-black/80 backdrop-blur-xl"> 
                        <h5 className="text-5xl animate-pulse">Downloading File</h5>
                        {fileDownloadProgress}%
                    </div>
            }

            <ContactsContainer /> 
      
            {
                selectedChatType===undefined ? <EmptyChatContainer /> : <ChatContainer /> 
            }
    </div>
  )
};


export default Chat;
