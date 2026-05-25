import { useEffect, useRef, useState } from "react";
import ChatArea from "../../ChatArea";


export const ChatPopup = ({ isOpen, onClose, setPreviewImage }) => {
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
    }
  }, [isOpen, hasOpened]);


  return (
    <>
      {/* BACKDROP */}
      <div
        className={`chat-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* POPUP */}
      <div className={`chatpopup ${isOpen ? "open" : ""}`}>
        {hasOpened && (
          <ChatArea
            onClose={onClose}
            setPreviewImage={setPreviewImage}
          />
        )}
      </div>
    </>
  );
};
