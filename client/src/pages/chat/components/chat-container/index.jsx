import ChatHeader from "./components/chat-header";
import MessageContainer from "./components/message-container";
import MessageBar from "./components/message-bar";

const ChatContainer = () => {

    return ( 
    <div className="fixed top-0 h-[100dvh] w-[100dvw] bg-[#1c1d25] flex flex-col md:static md:flex-1 "> 
    <ChatHeader/>
    <MessageContainer/>
    <MessageBar/>
    </div>
    )
};
;
export default ChatContainer;
