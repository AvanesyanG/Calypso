import { useAppStore } from "@/store/index.js";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { colors, getColors } from "@/lib/utils";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UPDATE_PROFILE_ROUTE, ADD_PROFILE_IMAGE_ROUTE, HOST, REMOVE_PROFILE_IMAGE_ROUTE } from "@/utils/constants.js";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client.js";

const Profile = () => {
    const navigate = useNavigate();
    const { userInfo, setUserInfo } = useAppStore();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [image, setImage] = useState(null);
    const [hovered, setHovered] = useState(false);
    const [selectedColor, setSelectedColor] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (userInfo.profileSetup) {
            setFirstName(userInfo.firstName);
            setLastName(userInfo.lastName);
            setSelectedColor(userInfo.color);
        }

        if (userInfo.image) {
            setImage(`${HOST}/${userInfo.image}`);
        }
    }, [userInfo, image]);

    const validateProfile = () => {
        if (!firstName) {
            toast.error("First Name is required.");
            return false;
        }

        if (!lastName) {
            toast.error("Last Name is required.");
            return false;
        }

        return true;
    };

    const saveChanges = async () => {
        try {
            if (validateProfile()) {
                const response = await apiClient.post(
                    UPDATE_PROFILE_ROUTE,
                    { firstName, lastName, color: selectedColor },
                    { withCredentials: true }
                );

                if (response.status === 200 && response.data) {
                    setUserInfo({ ...response.data });
                    toast("Profile was created successfully.");
                    navigate("/chat");
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleNavigate = () => {
        if (userInfo.profileSetup) {
            navigate("/chat");
        } else {
            toast.error("Please setup Profile first");
        }
    };

    const handleFileInputClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("profile-image", file);
            try {
                const response = await apiClient.post(
                    ADD_PROFILE_IMAGE_ROUTE,
                    formData,
                    { withCredentials: true }
                );

                if (response.status === 200 && response.data.image) {
                    setUserInfo({ ...userInfo, image: response.data.image });
                    setImage(`${HOST}/${response.data.image}`);
                    toast.success("Image updated successfully.");
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Failed to upload image");
            }
        }
    };

    const handleDeleteImage = async () => {
        try {
            const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
                withCredentials: true,
            });

            if (response.status === 200) {
                setUserInfo({ ...userInfo, image: null });
                toast.success("Image removed successfully.");
                setImage(null);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen bg-[#1b12c4] flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-4xl">
                <div onClick={handleNavigate} className="self-start">
                    <IoArrowBack className="text-3xl sm:text-4xl lg:text-5xl text-white/90 cursor-pointer hover:text-white transition-colors" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex justify-center">
                        <div
                            className="relative group"
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                        >
                            <Avatar className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 rounded-full overflow-hidden">
                                {image ? (
                                    <AvatarImage
                                        src={image}
                                        alt="profile image"
                                        className="object-cover w-full h-full bg-black"
                                    />
                                ) : (
                                    <div
                                        className={`uppercase h-full w-full text-4xl sm:text-5xl border-[1px] flex items-center justify-center rounded-full ${getColors(
                                            selectedColor
                                        )}`}
                                    >
                                        {firstName
                                            ? firstName.split("").shift()
                                            : userInfo.email.split("").shift()}
                                    </div>
                                )}
                            </Avatar>

                            <div
                                className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-full transition-opacity duration-200 ${
                                    hovered ? 'opacity-100' : 'opacity-0'
                                }`}
                                onClick={image ? handleDeleteImage : handleFileInputClick}
                            >
                                {image ? (
                                    <FaTrash className="text-white text-2xl sm:text-3xl cursor-pointer hover:text-red-400 transition-colors" />
                                ) : (
                                    <FaPlus className="text-white text-2xl sm:text-3xl cursor-pointer hover:text-green-400 transition-colors" />
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleImageChange}
                                name="profile-image"
                                accept=".png, .jpg, .jpeg, webp, svg"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:gap-5">
                        <Input
                            type="email"
                            placeholder="Email"
                            disabled
                            value={userInfo.email}
                            className="rounded-lg p-4 sm:p-5 bg-[#2c2e3b] border-none text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-purple-500"
                        />
                        <Input
                            type="text"
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                            value={firstName}
                            className="rounded-lg p-4 sm:p-5 bg-[#2c2e3b] border-none text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-purple-500"
                        />
                        <Input
                            type="text"
                            placeholder="Last Name"
                            onChange={(e) => setLastName(e.target.value)}
                            value={lastName}
                            className="rounded-lg p-4 sm:p-5 bg-[#2c2e3b] border-none text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-purple-500"
                        />
                        <div className="flex gap-3 sm:gap-4 justify-center md:justify-start">
                            {colors.map((color, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedColor(index)}
                                    className={`${color} h-8 w-8 sm:h-10 sm:w-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 ${
                                        selectedColor === index
                                            ? "ring-2 ring-white/50 ring-offset-2 ring-offset-[#1b12c4]"
                                            : ""
                                    }`}
                                    aria-label={`Select color ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <Button
                    className="w-full h-12 sm:h-14 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-lg transition-colors duration-200"
                    onClick={saveChanges}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
};

export default Profile;