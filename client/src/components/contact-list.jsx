import {useAppStore} from "@/store/index.js";
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { getColors } from "@/lib/utils";
import { HOST, DELETE_MESSAGES_ROUTE, DELETE_CHANNEL_ROUTE } from "@/utils/constants";
import { IoCloseSharp } from "react-icons/io5";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

const ContactList = ({contacts, isChannel=false}) => {

    const { setSelectedChatType, selectedChatData, setSelectedChatData, setSelectedChatMessages, deleteContactsInDMContacts, deleteChannelInChannelList, closeChat } = useAppStore(); 

    const handleDeleteContact = (contact) => {

        const deleteMesssages = async (contact) => {
            try {

                const response = await apiClient.post(
                    DELETE_MESSAGES_ROUTE, 
                    { id: contact._id},
                    { withCredentials: true}
                );

                if (response.status===200) {

                    if (!contact.admin) {
                        deleteContactsInDMContacts(contact);
                        closeChat();
                    } else {
                        deleteChannelInChannelList(contact);
                        closeChat();
                    }
                }

            } catch (error) {
                console.log(error);
            }
        }

        const deleteChannel = async (contact) => {
    
            try {
                const response = await apiClient.post(
                    DELETE_CHANNEL_ROUTE, 
                    { id: contact._id},
                    { withCredentials: true}
                );

                if (response.status===204) {
                    deleteChannelInChannelList(contact);
                    closeChat();
                }

                if (response.status===200) {
                    toast.error(response.data);
                }
            } catch (error) {
                console.log(error);
            }
        }

        if (!contact.admin) {
            deleteMesssages(contact);       
        } else { 
            deleteChannel(contact);
        }

    }

    const handleClick = (contact, deleted) => {
  
        if (deleted) {
            return
        } else {
            if (isChannel) {
                setSelectedChatType("channel");
                setSelectedChatData(contact);
            } else {  
                setSelectedChatType("contact");
                setSelectedChatData(contact);
            };

            if(selectedChatData && selectedChatData._id !== contact._id) {
                setSelectedChatMessages([]);
            }  
        }

    }

    return (
        <div className="gap-2">
        {contacts.map((contact)=>(
            <div key={contact._id} className={`p-2 transition-all duration-300 cursor-pointer
            ${selectedChatData && (selectedChatData._id === contact._id) ? "bg-[#8417ff] hover:bg-[#8417ff]" 
            : "hover: bg-[#f1f1f111]"}`}
            onClick={ ()=> handleClick(contact)}
            >
               <div className="flex gap-2 items-center justify-start text-neutral-300">
               <span className="text-sm"><IoCloseSharp onClick={()=> handleDeleteContact(contact)}/></span>
                { 
                    !isChannel && (
                 <Avatar className="h-5 w-5 text-sm rounded-full overflow-hidden ">
                 {
                   contact.image ? (<AvatarImage src={`${HOST}/${contact.image}`} alt="profile image" className="object-cover w-full h-full bg-black" /> ) : 
                  (<div className={`
                     ${(selectedChatData && selectedChatData._id === contact._id) 
                        ? `"bg-[#ffffff] border-[0.5px] border-white"`
                        : `"border-[0.5px] border-color:${getColors(contact.color)} ${getColors(contact.color)}/70"`
                     }
                     uppercase h-5 w-5  text-sm flex items-center justify-center rounded-full`}
                                onClick={ ()=> handleClick(contact)}
                  > {contact.firstName ? contact.firstName.split("").shift()
                   : contact.email.split("").shift()}
                   </div>
                 )}
                 </Avatar>
                     )
                }
                { isChannel && (<div className="bg-[#ffffff22] h-5 w-5 flex items-center justify-center rounded-full">
                        # </div>)}
                {isChannel ? (<span> {`${contact.name}`}</span>) : (<span>{contact.firstName ? `${contact.firstName} ${contact.lastName}` : contact.email}</span>)
                }
                           {
                                contact.unreadCount > 0 && (
                                    <span className="bg-[#8417ff] text-white text-xs font-semibold px-2 py-1 rounded">{contact.unreadCount}</span>
                                )
                            }
              </div>
            </div>
        ))
        } 
    </div>
    )
}

export default ContactList