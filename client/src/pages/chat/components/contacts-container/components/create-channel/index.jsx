import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";

import { FaPlus } from "react-icons/fa";
import { useEffect, useState} from "react"; 
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";

  import { ScrollArea } from "@/components/ui/scroll-area";
  import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { HOST, GET_ALL_CONTACTS_ROUTES, CREATE_CHANNEL_ROUTE } from "@/utils/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { colors, getColors } from "@/lib/utils";
import {useAppStore} from "@/store/index.js";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";

const CreateChannel = () => {
 
  const {setSelectedChatType, selectedChatType, setSelectedChatData, selectedChatData, addChannel, channels, setChannels} = useAppStore();  

    const [newChannelModal, setNewChannelModal] = useState(false);

   const [allContacts, setAllContacts] = useState([]);
   const [selectedContacts, setSelectedContacts] = useState([]);
   const [channelName, setChannelName] = useState("");

   useEffect(()=> {
    const getData = async () => {
        const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {withCredentials: true});
       setAllContacts(response.data.contacts)
    }; getData();
   }, [newChannelModal]);

      const createChannel = async () => {

        try{ 
            if(channelName.length>0 && selectedContacts.length >0) {
                const response = await apiClient.post(CREATE_CHANNEL_ROUTE, {
                    name: channelName,
                    members: selectedContacts.map((contact)=>contact.value),
                }, {withCredentials: true});

            if(response.status===201) {

              setChannelName("");
                setSelectedContacts([]);
                setNewChannelModal(false);
                addChannel(response.data.channel);
            }
        }
      } catch(error) {
            console.log(error);
        }
   }

    return (
        <div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus className="text-neutral-400 font-light text-sm text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
                        onClick={() => {setNewChannelModal(true)}}/>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1c1b1e] mb-1 p-1 border-none text-white">
                        Create New Channel
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
                <DialogContent className="bg-[#181920] text-white border-none max-w-[90vw] md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[90vh] h-auto flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Please Fill Up Details For New Channel.</DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Container */}
                    <div className="gap-4 flex flex-col overflow-y-auto flex-grow p-2">
                        <Input placeholder="Channel Name" className="rounded-lg bg-[#2c2e3b]"
                            onChange={ (event)=> setChannelName(event.target.value) } value={channelName} 
                        />
                        <div>
                            <MultipleSelector className="rounded-lg bg-[#2c2e3b] border-non py-2 text-white"
                                defaultOptions = {allContacts}
                                placeholder = "Seach Contacts"
                                value={selectedContacts}
                                onChange={setSelectedContacts}
                                emptyIndicator={
                                    <p className="text-center text-lg leading-10 text-gray-600"> No results founds</p>
                                } 
                            />
                        </div>
                        <div>
                            <Button className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300" 
                            onClick={createChannel}>
                                Create Channel
                            </Button>
                        </div>
                    </div>
     
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CreateChannel