import { RiCloseFill } from "react-icons/ri";
import { useAppStore } from "@/store/index.js";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColors } from "@/lib/utils";
import { HOST } from "@/utils/constants";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore();

  return (
    <div className="p-2 border-b-2 border-[#2f303b] flex items-center justify-between w-full">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar */}
        {selectedChatType === "contact" && (
          <Avatar className="h-10 w-10 text-md rounded-full overflow-hidden shrink-0">
            {selectedChatData.image ? (
              <AvatarImage
                src={`${HOST}/${selectedChatData.image}`}
                alt="profile image"
                className="object-cover w-full h-full bg-black"
              />
            ) : (
              <div
                className={`uppercase h-10 w-10 text-md border flex items-center justify-center rounded-full ${getColors(
                  selectedChatData.color
                )}`}
              >
                {selectedChatData.firstName
                  ? selectedChatData.firstName.charAt(0)
                  : selectedChatData.email.charAt(0)}
              </div>
            )}
          </Avatar>
        )}

        {selectedChatType === "channel" && (
          <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full text-white text-lg font-medium shrink-0">
            #
          </div>
        )}

        {/* Name */}
        <p className="text-white text-md truncate whitespace-nowrap overflow-hidden max-w-[60vw] sm:max-w-[200px] md:max-w-[250px]">
          {selectedChatType === "channel" && selectedChatData.name}
          {selectedChatType === "contact" &&
            (selectedChatData.firstName
              ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
              : selectedChatData.email)}
        </p>
      </div>

      {/* Close Button */}
      <button
        className="text-neutral-500 hover:text-white focus:outline-none transition-all"
        onClick={closeChat}
      >
        <RiCloseFill className="text-xl" />
      </button>
    </div>
  );
};

export default ChatHeader;
