import ProfileInfo from "./components/profile-info";
import NewDM from "./components/new-dm";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { GET_DM_CONTACTS_ROUTES, GET_USER_CHANNELS_ROUTE } from "@/utils/constants";
import { useAppStore } from "@/store/index.js";
import ContactList from "@/components/contact-list";
import CreateChannel from "./components/create-channel";

const ContactsContainer = () => {
    const { channels, setChannels, directMessagesContacts, setDirectMessagesContacts } = useAppStore();

    useEffect(() => {
        const getContacts = async () => {
            try {
                const response = await apiClient.get(GET_DM_CONTACTS_ROUTES, { withCredentials: true });
                
                if (response.status === 204) {
                    console.log('No contacts found');
                    return;
                }
                
                if (response.data.contacts && directMessagesContacts.length === 0 && response.status === 200) {
                    setDirectMessagesContacts(response.data.contacts);
                }
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        getContacts();
    }, [setDirectMessagesContacts, directMessagesContacts.length]);

    useEffect(() => {
        const getChannels = async () => {
            try {
                const response = await apiClient.get(GET_USER_CHANNELS_ROUTE, { withCredentials: true });

                if (response.status === 204) {
                    console.log('No channels found');
                    return;
                }

                if (response.data.channels && channels.length === 0) {
                    setChannels(response.data.channels);
                }
            } catch (error) {
                console.error('Error fetching channels:', error);
            }
        };

        getChannels();
    }, [setChannels, channels.length]);

    return (
        <div className="relative w-full sm:w-[50vw] md:w-[35vw] lg:w-[30vw] xl:w-[25vw] bg-[#1b1c24] border-r-0 border-[#2f303b] flex flex-col h-full sm:border-r-2">
            <div className="flex-shrink-0">
                <Logo />
            </div>
            
            <div style={{ scrollbarWidth: 'none' }} className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex flex-col w-full gap-2">
                    <div className="flex flex-col w-full gap-2">
                        <div className="flex items-center justify-between px-4">
                            <Title text="Direct Messages" />
                            <NewDM />
                        </div>

                        <div className=" overflow-y-auto scrollbar-hidden ">
                            <ContactList contacts={directMessagesContacts} />
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-2">
                        <div className="flex items-center justify-between px-4">
                            <Title text="Channels" />
                            <CreateChannel />
                        </div>

                        <div className=" overflow-y-auto scrollbar-hidden ">
                            <ContactList contacts={channels} isChannel={true} />
                        </div>
                    </div>

                </div>
            </div>

            <ProfileInfo />
        </div>
    );
};

export default ContactsContainer;

export const Logo = () => {
    return (
        <div className="flex p-4 sm:p-5 justify-start items-center gap-2">
            <svg
                id="logo-38"
                width="62"
                height="28"
                viewBox="0 0 78 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="sm:w-[78px] sm:h-[32px]"
            >
                <path
                    d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
                    className="ccustom"
                    fill="#8338ec"
                />
                <path
                    d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
                    className="ccompli1"
                    fill="#975aed"
                />
                <path
                    d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
                    className="ccompli2"
                    fill="#a16ee8"
                />
            </svg>
            <span className="text-2xl sm:text-3xl font-medium text-white">Calypso</span>
        </div>
    );
};

export const Title = ({ text }) => {
    return (
        <h6 className="uppercase tracking-widest text-neutral-400 font-light text-opacity-90 text-xs sm:text-sm">
            {text}
        </h6>
    );
};

