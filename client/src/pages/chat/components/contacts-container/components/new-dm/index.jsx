import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";

import { FaPlus } from "react-icons/fa";
import { useState} from "react"; 
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import Lottie from "react-lottie";
import {animationDefaultOptions} from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { SEARCH_CONTACTS_ROUTES, HOST } from "@/utils/constants";
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { getColors } from "@/lib/utils";
import {useAppStore} from "@/store/index.js";

const NewDM = () => {

 
    const { setSelectedChatType,  setSelectedChatData } = useAppStore();  

    const [openNewContactModel, setOpenNewContactModel] = useState(false);

    const [searchedContacts, setSearchedContacts] = useState([]);

    const selectNewContact = (contact) => {
      setOpenNewContactModel(false);
      setSearchedContacts([]);
      setSelectedChatType("contact");
      setSelectedChatData(contact);     
    }

    const searchContacts = async (searchTerm) => {

        try {
        
            if (searchTerm.length > 0) {
                const response = await apiClient.post(
                    SEARCH_CONTACTS_ROUTES, {searchTerm}, {withCredentials: true}
                )
                if (response.status===200 && response.data.contacts) {
                    setSearchedContacts(response.data.contacts);
                }
            } else {
                setSearchedContacts([]);
            }

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            {/* Tooltip + Add Contact Button */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus
                        className="text-neutral-400 font-light text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300"
                        onClick={() => setOpenNewContactModel(true)}
                    />
                </TooltipTrigger>
                <TooltipContent className="bg-[#1c1b1e] mb-1 p-1 border-none text-white">
                    Select New Contact
                </TooltipContent>
                </Tooltip>
            </TooltipProvider>
      
            {/* Dialog for Selecting New Contact */}
            <Dialog open={openNewContactModel} onOpenChange={setOpenNewContactModel}>
                <DialogContent className="bg-[#181920] text-white border-none w-[90vw] max-w-md max-h-[90vh] h-auto flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Please select the contact.</DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Container */}
                    <div className="gap-4 flex flex-col overflow-y-auto flex-grow p-2">
                        <Input
                            placeholder="Search Contacts"
                            className="rounded-lg p-4 bg-[#2c2e3b] w-full"
                            onChange={(event) => searchContacts(event.target.value)}
                        />
                        {/* Contact List */}
                        <div className="flex flex-col gap-2">
                            {searchedContacts.map((contact) => (
                            <div
                                key={contact._id}
                                className="flex items-center gap-3 cursor-pointer hover:bg-[#2a2b33] p-2 rounded-md transition-all"
                                onClick={() => selectNewContact(contact)}
                            >
                                <div className="w-12 h-12 relative shrink-0">
                                <Avatar className="h-12 w-12 text-lg rounded-full overflow-hidden">
                                    {contact.image ? (
                                    <AvatarImage
                                        src={`${HOST}/${contact.image}`}
                                        alt="profile image"
                                        className="object-cover w-full h-full bg-black rounded-full"
                                    />
                                    ) : (
                                    <div
                                        className={`uppercase h-12 w-12 text-xl border flex items-center justify-center rounded-full ${getColors(contact.color)}`}
                                    >
                                        {contact.firstName
                                        ? contact.firstName.charAt(0)
                                        : contact.email.charAt(0)}
                                    </div>
                                    )}
                                </Avatar>
                                </div>
                                <div className="flex flex-col min-w-0">
                                <span className="truncate font-medium">
                                    {contact.firstName && contact.lastName
                                    ? `${contact.firstName} ${contact.lastName}`
                                    : ""}
                                </span>
                                <span className="text-xs text-neutral-400 truncate">
                                    {contact.email}
                                </span>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>

                    {/* No Contacts Animation */}
                    {searchedContacts.length <= 0 && (
                    <div className="flex flex-1 flex-col justify-center items-center mt-5 transition-all duration-1000">
                        <Lottie
                        isClickToPauseDisabled={true}
                        height={100}
                        width={100}
                        options={animationDefaultOptions}
                        />
                        <div className="text-white text-center mt-4">
                        <h3 className="text-lg sm:text-xl">
                            Hi <span className="text-purple-500">!</span> Search
                            <span className="text-purple-500"> New Contact.</span>
                        </h3>
                        </div>
                    </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
      );
      
}

export default NewDM