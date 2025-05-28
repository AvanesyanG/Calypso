export const createChatSlice = (set, get) => ({
    selectedChatType: undefined,
    selectedChatData: undefined,
    showImage: false,
    imageURL: undefined,
    isUploading: false,
    isDownloading: false,
    fileUploadProgress: 0,
    fileDownloadProgress: 0,
    selectedChatMessages: [],
    directMessagesContacts: [],
    channels: [],
    unreadCount: 0,
    docVisibleAgain: false,

    setIsUploading: (isUploading) => set({ isUploading }),
    setIsDownloading: (isDownloading) => set({ isDownloading }),
    setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
    setFileDownloadProgress: (fileDownloadProgress) => set({ fileDownloadProgress }),
    setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
    setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
    setShowImage: (showImage) => set({ showImage }),
    setImageURL: (imageURL) => set({ imageURL }),
    setDocVisibleAgain: (docVisibleAgain) => set({ docVisibleAgain }),


    updateUnreadCount: () => {
        const dmContacts = get().directMessagesContacts;
        const channels = get().channels;

        const totalUnreadCount = dmContacts.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0) +
            channels.reduce((sum, channel) => sum + (channel.unreadCount || 0), 0);

//        console.log("Total Unread Count:", totalUnreadCount);
        if (navigator.setAppBadge) {
            navigator.setAppBadge(totalUnreadCount);
        }
    },

    setChannels: (channels) => {
        set({ channels: channels });
        get().updateUnreadCount();
    },

    setDirectMessagesContacts: (directMessagesContacts) => {
        set({ directMessagesContacts: directMessagesContacts });
        get().updateUnreadCount();
    },

    setSelectedChatMessages: (selectedChatMessages) => {
        const selectedChatData = get().selectedChatData;
        const selectedChatType = get().selectedChatType;

        if (selectedChatType === "contact") {
            const dmContacts = get().directMessagesContacts;
            const contactId = selectedChatData?._id;

            if (contactId) {
                const updatedContacts = dmContacts.map(contact => {

                    if (contact._id === contactId) {
                        return { ...contact, unreadCount: 0 };
                    }

                    return contact;
                   });

                get().setDirectMessagesContacts(updatedContacts);
            }
        } else if (selectedChatType === "channel") {
            const channels = get().channels;
            const channelId = selectedChatData?._id;

            if (channelId) {
                const updatedChannels = channels.map(channel => {
                    if (channel._id === channelId) {
                        return { ...channel, unreadCount: 0 };
                    }
                    return channel;
                });

                get().setChannels(updatedChannels);
            }
        }

        set({ selectedChatMessages });
    },

    addChannel: (channel) => {
        const channels = get().channels;
        set({ channels: [channel, ...channels] });
    },

    closeChat: () => set({ selectedChatType: undefined, selectedChatData: undefined, selectedChatMessages: [] }),

    addMessage: (message) => {
        const selectedChatMessages = get().selectedChatMessages;
        const selectedChatType = get().selectedChatType;

        set({
            selectedChatMessages: [
                ...selectedChatMessages, {
                    ...message,
                    recipient: selectedChatType === "channel" ? message.recipient : message.recipient._id,
                    sender: selectedChatType === "channel" ? message.sender : message.sender._id,
                }
            ]
        });
    },

    addChannelinChannelList: (message) => {
        const channels = get().channels;
        const selectedChatData = get().selectedChatData;
        const userId = get().userInfo.id;

        const channelId = message.channelId;
        const existingChannel = channels.find(channel => channel._id === channelId);

        if (existingChannel) {
            const isInChatMode = selectedChatData && selectedChatData._id === channelId && get().selectedChatType === "channel";
            const isOwnMessage = message.sender._id === userId;

            let unreadCount = existingChannel.unreadCount || 0;

            if (!isOwnMessage && !isInChatMode) {
                unreadCount += 1;
            }

            const updatedChannel = {
                ...existingChannel,
                unreadCount: unreadCount
            };

            // Move updated channel to the top
            const updatedChannels = channels.filter(channel => channel._id !== channelId);
            set({ channels: [updatedChannel, ...updatedChannels] });

            get().updateUnreadCount();
        }
    },

    addContactsInDMContacts: (message) => {
        const userId = get().userInfo.id;
        const fromId = message.sender._id === userId ? message.recipient._id : message.sender._id;
        const fromData = message.sender._id === userId ? message.recipient : message.sender;
        const isOwnMessage = message.sender._id === userId;

        const dmContacts = get().directMessagesContacts;
        const selectedChatData = get().selectedChatData;

        const existingContact = dmContacts.find(contact => contact._id === fromId);

        let unreadCount = 0;

        const isInChatMode = selectedChatData && selectedChatData._id === fromId;

        if (!isOwnMessage && !isInChatMode) {
            unreadCount = existingContact ? (existingContact.unreadCount || 0) + 1 : 1;
        }

        if (!isOwnMessage && document.hidden && document.visibilityState==="hidden") {
            unreadCount = existingContact ? (existingContact.unreadCount || 0) + 1 : 1;
        }

        else {
            unreadCount = existingContact ? (existingContact.unreadCount || 0) : 0;
        }

        const updatedContact = {
            ...fromData,
            unreadCount: unreadCount,
        };

        let updatedContacts = dmContacts.filter(contact => contact._id !== fromId);

        updatedContacts = [updatedContact, ...updatedContacts];

        set({ directMessagesContacts: updatedContacts });

        get().updateUnreadCount();
    },

    deleteContactsInDMContacts: (contact) => {
        const contactId = contact._id;

        const dmContacts = get().directMessagesContacts;

        const updatedContacts = dmContacts.filter(c => c._id !== contactId);

        set({ directMessagesContacts: updatedContacts });
    },

    deleteChannelInChannelList: (contact) => {
        const newChannels = get().channels;
        const data = newChannels.find((channel) => channel._id === contact._id);
        const index = newChannels.findIndex((channel) => channel._id === contact._id);

        if (index !== -1 && index !== undefined) {
            newChannels.splice(index, 1);
        }

        set({ channels: newChannels });
    }
});
