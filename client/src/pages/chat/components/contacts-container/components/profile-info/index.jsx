import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { colors, getColors } from "@/lib/utils";
import {useAppStore} from "@/store/index.js";
import { useEffect, useState } from "react";
import {UPDATE_PROFILE_ROUTE, ADD_PROFILE_IMAGE_ROUTE, HOST, REMOVE_PROFILE_IMAGE_ROUTE, LOGOUT_ROUTE} from "@/utils/constants.js";
import { toast } from "sonner";
import {apiClient} from "@/lib/api-client.js"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IoPowerSharp } from "react-icons/io5";
import { Cookie } from "lucide-react";

const ProfileInfo = () => {

const {userInfo, setUserInfo} = useAppStore();
const navigate = useNavigate();

const logOut = async () => {

  try {
    const response = await apiClient.post(LOGOUT_ROUTE, {}, {
      withCredentials:true,
    });

      if (response.status===200) {
    setUserInfo(null);
    navigate("/auth");
   } 

  } 

  catch (error) {
    console.log(error);
  }

} 

return (
    <div className="flex items-center justify-between w-full px-4 py-2 bg-[#2a2b33]">
      {/* Left: Avatar + Name */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-10 h-10 relative shrink-0">
          <Avatar className="h-10 w-10 text-md rounded-full overflow-hidden">
            {userInfo.image ? (
              <AvatarImage
                src={`${HOST}/${userInfo.image}`}
                alt="profile image"
                className="object-cover w-full h-full bg-black"
              />
            ) : (
              <div
                className={`uppercase h-10 w-10 text-md border-[1px] flex items-center justify-center rounded-full ${getColors(
                  userInfo.color
                )}`}
              >
                {userInfo.firstName
                  ? userInfo.firstName.charAt(0)
                  : userInfo.email.charAt(0)}
              </div>
            )}
          </Avatar>
        </div>
  
        {/* User Name */}
        <p className="text-white text-md truncate overflow-hidden whitespace-nowrap max-w-[150px] sm:max-w-[200px] md:max-w-[250px]">
          {userInfo.firstName && userInfo.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : ""}
        </p>
      </div>
  
      {/* Right: Icons */}
      <div className="flex gap-4 items-center shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiEdit2
                className="text-purple-500 text-lg cursor-pointer"
                onClick={() => navigate("/profile")}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white">
              <p>Edit Profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
  
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <IoPowerSharp
                className="text-red-500 text-lg cursor-pointer"
                onClick={logOut}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
  
}

export default ProfileInfo