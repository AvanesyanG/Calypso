import { useRef, useEffect, useLayoutEffect } from "react";
import { useAppStore } from "@/store";
import moment from "moment";
import { apiClient } from "@/lib/api-client";
import { GET_ALL_MESSAGES_ROUTE, HOST, GET_CHANNEL_MESSAGES_ROUTE } from "@/utils/constants";
import { Target } from "lucide-react";
import {MdFolderZip} from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { colors, getColors } from "@/lib/utils";
import ScrollToBottom from 'react-scroll-to-bottom';

const MessageContainer = () => {

    const scrollRef = useRef();
    const { selectedChatData, selectedChatType, userInfo, selectedChatMessages, setSelectedChatMessages, showImage, setShowImage, imageURL, setImageURL, setIsDownloading, setFileDownloadProgress, setDocVisibleAgain } = useAppStore();

        const getMessages = async () => {

        try {

            const response = await apiClient.post(GET_ALL_MESSAGES_ROUTE, 
                { id: selectedChatData._id},
                { withCredentials: true}
            );

            if (response.status === 204) {
                return
            }

            if(response.data.messages) {
                return setSelectedChatMessages(response.data.messages);
            }

        } catch (error) {
            console.log(error);
        }
    }

    
    const getChannelMessages = async () => {

      try {

        const response = await apiClient.get(`${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}`, 
         { withCredentials: true}
       );
       
       if (response.status === 204) {
        return
       } 

       if(response.data.messages) {
        return setSelectedChatMessages(response.data.messages);
       }
       

      } catch (error) {
        console.log(error);
      }

    }
    
    const onVisibilityChange = () => {
     if (document.visibilityState === 'visible') {
     setDocVisibleAgain();
     getMessages();
     getChannelMessages();
     }
    };

    useLayoutEffect(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, []);
  
  

    useEffect(()=> {

        const getMessages1 = async () => {

        try {

            const response = await apiClient.post(GET_ALL_MESSAGES_ROUTE, 
                { id: selectedChatData._id},
                { withCredentials: true}
            );

            if (response.status === 204) {
                return
            }

            if(response.data.messages && (selectedChatMessages.length===0)) {
                return setSelectedChatMessages(response.data.messages);
            }

        } catch (error) {
            console.log(error);
        }
    }

    
    const getChannelMessages1 = async () => {

      try {

        const response = await apiClient.get(`${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}`, 
         { withCredentials: true}
       );
       
       if (response.status === 204) {
        return
       } 

       if(response.data.messages && (selectedChatMessages.length===0)) {
        return setSelectedChatMessages(response.data.messages);
       }
       

      } catch (error) {
        console.log(error);
      }

    }
    

   if(selectedChatData._id) {
      if(selectedChatType==="contact") {
       getMessages1();
     }
     if(selectedChatType==="channel") {
      getChannelMessages1();
    }
      
   }
    

  }, [selectedChatData, selectedChatType, setSelectedChatMessages, setDocVisibleAgain]);

  const checkIfImage = (filePath) => {
    const imageRegExp = /\.(jpg|jpeg|webp|png|tiff|tif|heic|heif|bmp|gif)$/i;
    return imageRegExp.test(filePath);
  }

  useEffect(() => {
    if(scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "auto"});
    }
   },[selectedChatMessages]);

   const renderMessages = (message) => {
       let lastDate = null;
       return selectedChatMessages.map((message, index) => {
       const messageDate = moment(message.timeStamp).format("YYYY-MM-DD");
       const showDate = messageDate !== lastDate;
       lastDate = messageDate;

       return (
        <div key={index}>
          
          {showDate && (<div className="text-center text-md text-gray-500 my-2"> 
            {moment(message.timeStamp).format("LL")}</div>)}

          {selectedChatType==="contact" && renderDMMessages(message)}
          {selectedChatType==="channel" && renderChannelMessages(message)}

        </div>
       )
       })
  }

  const downloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);
    const response = await apiClient.get(`${HOST}/${url}`,{responseType: "blob"},
    {onDownLoadProgress: (progressEvent)=> {
      const {loaded, total} = progressEvent;
      const percentCompleted = Math.round((loaded*100)/total);
      setFileDownloadProgress(percentCompleted);
    }}
    );
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    setIsDownloading(false),
    setFileDownloadProgress(0);
  }

  const renderDMMessages = (message) => (

     <div className={`${message.sender!==selectedChatData._id 
       ? "text-left" : "text-right"}`}>
     {message.messageType === "text" &&
        (<div className={`${message.sender !== selectedChatData._id 
         ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" 
         : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"}
         border inline-block p-1 rounded my-1 max-w-[50%] break-words text-sm`}>
           {message.content}
          </div>)
       }

       {message.messageType === "file" &&
        (<div className={`${message.sender !== selectedChatData._id 
         ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" 
         : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"}
         border inline-block p-1 rounded my-1 max-w-[95%] break-words`}>
           {checkIfImage(message.fileUrl) 
           ? (<div className="cursor-pointer"
           onClick={()=> {setImageURL(message.fileUrl);
            setShowImage(true);
           }}>
           <img src={`${HOST}/${message.fileUrl}`} alt="image" height="300" width="300"/>
           </div>) 
           : (<div className="flex gap-4 justify-center items-center">
            <span className="text-white/8 text-xl bg-black/20 rounded-full p-1">  
            <MdFolderZip/>
            </span>
            <span> {decodeURIComponent(message.fileUrl).split("/").pop()}</span>
            <span className="bg-black/20 p-1 rounded-full text-xl hover:bg-black/50 cursor-pointer transition-all duration-300"
            onClick={()=> downloadFile(decodeURIComponent(message.fileUrl))}>
            <IoMdArrowRoundDown/>
            </span>
           </div> )}
          </div>)
       }

      <div className="text-xs text-gray-600">
       {moment(message.timeStamp).format("LT")}
      </div>
    </div>
     );
    
  const renderChannelMessages = (message) => {

    return <div className={`mt-5 ${message.sender._id !== userInfo.id ? "text-left" : "text-right"}`}>

    {message.messageType === "text" &&
      (<div className={`${message.sender._id == userInfo.id
       ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" 
       : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"}
       border inline-block p-1 rounded my-1 max-w-[50%] break-words text-sm`}>
         {message.content}
        </div>)
     }

      {message.messageType === "file" &&
        (<div className={`${message.sender._id === userInfo.id 
         ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" 
         : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"}
         border inline-block p-1 rounded my-1 max-w-[95%] break-words`}>
           {checkIfImage(message.fileUrl) 
           ? (<div className="cursor-pointer"
           onClick={()=> {setImageURL(message.fileUrl);
            setShowImage(true);
           }}>
           <img src={`${HOST}/${message.fileUrl}`} alt="image" height="300" width="300"/>
           </div>) 
           : (<div className="flex gap-4 justify-center items-center">
            <span className="text-white/8 text-xl bg-black/20 rounded-full p-1">  
            <MdFolderZip/>
            </span>
            <span> {decodeURIComponent(message.fileUrl).split("/").pop()}</span>
            <span className="bg-black/20 p-1 rounded-full text-xl hover:bg-black/50 cursor-pointer transition-all duration-300"
            onClick={()=> downloadFile(decodeURIComponent(message.fileUrl))}>
            <IoMdArrowRoundDown/>
            </span>
           </div> )}
          </div>)
       }
     
      {
        message.sender._id !== userInfo.id 
        ? <div className="flex items-center justify-start gap-2 ">
          <Avatar className="h-8 w-8 text-md mt-2 rounded-full overflow-hidden ">
            { message.sender.image && <AvatarImage src={`${HOST}/${message.sender.image}`} alt="profile image" className="object-cover w-full h-full bg-black" /> 
            }
             <AvatarFallback className={`uppercase h-8 w-8  text-md flex items-center justify-center rounded-full ${getColors(message.sender.color)}`}
             > 
              {message.sender.firstName 
              ? message.sender.firstName.split("").shift()
              : message.sender.email.split("").shift()}
              </AvatarFallback>  
          </Avatar>
          <span className="text-sm text-white/60">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
          <span className="text-[0,65rem] text-xs text-gray-600">{moment(message.timeStamp).format("LT")}</span>
        </div> 

        : (<div> 
          <span className="text-[0,65rem] text-xs text-gray-600 mt-1">{moment(message.timeStamp).format("LT")}</span>
        </div>)
      }

    </div>
     

  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full" >
      {renderMessages()}
      <div ref={scrollRef}></div>
      {
        showImage && 
        <div className="fixed z-1000 top-0 left-0 h-[100dvh] w-[100dvw] flex items-center justify-center backdrop-blur-lg flex-col">
          <img src={`${HOST}/${imageURL}`} alt="image" className="max-h-[80vh] max-w-[80vw] bg-cover" />
          <div className="flex gap-5 fixed top-0 mt-3">
          <button className="bg-black/20 p-1 rounded-full text-xl hover:bg-black/50 cursor-pointer transition-all duration-300" 
          onClick={()=>{downloadFile(decodeURIComponent(imageURL))}}>
          <IoMdArrowRoundDown/>
          </button>
          <button className="bg-black/20 p-1 rounded-full text-xl hover:bg-black/50 cursor-pointer transition-all duration-300" 
          onClick={()=>{setShowImage(false); setImageURL(null)}}>
          <IoCloseSharp/>
          </button>
        </div>
        </div>
       }
    </div>
  )
}
export default MessageContainer;
