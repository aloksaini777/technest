import { memo, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from "@fortawesome/free-solid-svg-icons/faComment";
import { ChatPopup } from "./popup";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import SupportIcon from '../../assets/support-icon.png';
import { useAuth } from "../../context/authContext";


const FloatingChatButton = () => {
  const [openChat, setOpenChat] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const { chatIcon } = useAuth();

  const forceDownload = async (url, fileName = "image") => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.target = "_blank"; // Open in new tab if download fails
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  };

  const handleOpenChat = () => {
    setOpenChat((prev) => !prev);
  };

  return (
    <>
      <div
        className={`chat-fab`}
        onClick={handleOpenChat}
      >
        <img src={chatIcon || SupportIcon} style={{ width: 36, aspectRatio: 1, objectFit: 'contain' }} />
        {/* <FontAwesomeIcon icon={faComment} size="xl" /> */}
      </div>

      <ChatPopup
        isOpen={openChat}
        onClose={() => setOpenChat(false)}
        setPreviewImage={setPreviewImage}
      />

      {/* ✅ FULLSCREEN IMAGE PREVIEW */}
      {previewImage && (
        <div
          className="chat-image-modal"
          onClick={() => setPreviewImage(null)}
        >
          <div className="chat-image-actions">
            <button
              className="chat-image-btn"
              onClick={(e) => {
                e.stopPropagation();
                forceDownload(previewImage, "downloaded_image");
              }}
            >
              {/* <i className="fa-solid fa-arrow-right fa-rotate-90"></i> */}
              <FontAwesomeIcon icon={faArrowRight} rotation={90} />
            </button>

            <button
              className="chat-image-btn"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
            >
              ✕
            </button>
          </div>

          <img
            src={previewImage}
            className="chat-image-preview"
            alt="Preview"
          />
        </div>
      )}
    </>
  );
};

export default memo(FloatingChatButton);
