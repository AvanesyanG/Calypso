import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { RiEmojiStickerLine } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { useAppStore } from "@/store";
import { useSocket } from "@/context/SocketContext";
import { apiClient } from "@/lib/api-client";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants";

const MessageBar = () => {
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const emojiRef = useRef();
  const inputRef = useRef();
  const fileInputRef = useRef();

  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    showImage,
    setShowImage,
    setImageURL,
    setIsUploading,
    setIsDownloading,
    setFileUploadProgress,
    setFileDownloadProgress,
  } = useAppStore();

  const socket = useSocket();

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && document.activeElement === inputRef.current) {
        event.preventDefault();
        handleSendMessage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [message, selectedChatType, selectedChatData._id, socket, userInfo.id]);


  useEffect(() => {
    const handlePaste = async (event) => {
      const clipboardItems = event.clipboardData?.items;
      if (!clipboardItems) return;
  
      const files = [];
  
      for (const item of clipboardItems) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
  
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("file", file);
        });
  
        try {
          setIsUploading(true);
          const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
            withCredentials: true,
            onUploadProgress: (data) => {
              setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
            },
          });
  
          if (response.status === 200) {
            setIsUploading(false);
  
            const filePaths = response.data.filePaths;
  
            for (const fileUrl of filePaths) {
              const payload = {
                sender: userInfo.id,
                content: undefined,
                messageType: "file",
                fileUrl,
              };
  
              if (selectedChatType === "contact") {
                socket.emit("sendMessage", {
                  ...payload,
                  recipient: selectedChatData._id,
                });
              } else if (selectedChatType === "channel") {
                socket.emit("send-channel-message", {
                  ...payload,
                  channelId: selectedChatData._id,
                });
              }
            }
          }
        } catch (error) {
          console.error("Paste upload error:", error);
          setIsUploading(false);
        }
      }
    };
  
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [selectedChatType, selectedChatData._id, socket, userInfo.id]);

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const payload = {
      sender: userInfo.id,
      content: message,
      messageType: "text",
      fileUrl: undefined,
    };

    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        ...payload,
        recipient: selectedChatData._id,
      });
    } else if (selectedChatType === "channel") {
      socket.emit("send-channel-message", {
        ...payload,
        channelId: selectedChatData._id,
      });
    }

    setMessage("");
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleAttachmentChange = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
  
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file); // same field name
    });
  
    try {
      setIsUploading(true);
      const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
        withCredentials: true,
        onUploadProgress: (data) => {
          setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
        },
      });
  
      if (response.status === 200) {
        setIsUploading(false);
  
        const filePaths = response.data.filePaths;
  
        for (const fileUrl of filePaths) {
          const payload = {
            sender: userInfo.id,
            content: undefined,
            messageType: "file",
            fileUrl,
          };
  
          if (selectedChatType === "contact") {
            socket.emit("sendMessage", {
              ...payload,
              recipient: selectedChatData._id,
            });
          } else if (selectedChatType === "channel") {
            socket.emit("send-channel-message", {
              ...payload,
              channelId: selectedChatData._id,
            });
          }
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
    } finally {
      event.target.value = ""; // reset file input
    }
  };
  

  return (
    <div className="w-full p-2 bg-[#1c1d25] border-t border-[#2f303b] flex items-center gap-2 sm:gap-4">
      <div className="flex items-center bg-[#2a2b33] flex-grow rounded-lg p-2 gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter message"
          className="flex-1 bg-transparent text-white placeholder:text-gray-400 outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Attachment */}
        <button
          onClick={handleAttachmentClick}
          className="text-neutral-400 hover:text-white transition"
        >
          <GrAttachment className="text-lg" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
          className="hidden"
          multiple={true}
        />

        {/* Emoji */}
        <div className="relative flex items-center justify-center" ref={emojiRef}>
          <button
            onClick={() => setEmojiPickerOpen((prev) => !prev)}
            className="text-neutral-400 hover:text-white transition"
          >
            {!showImage && <RiEmojiStickerLine className="text-xl" />}
          </button>

          {emojiPickerOpen && (
            <div className="absolute bottom-12 right-0 z-50">
              <EmojiPicker
                theme="dark"
                open={emojiPickerOpen}
                onEmojiClick={handleAddEmoji}
                autoFocusSearch={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Send */}
      <button
        onClick={handleSendMessage}
        className="p-3 rounded-lg bg-[#8417ff] hover:bg-[#741bda] text-white transition"
      >
        <IoSend className="text-lg" />
      </button>
    </div>
  );
};

export default MessageBar;
