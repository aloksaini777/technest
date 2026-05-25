import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip, faCamera, faMicrophone, faPaperPlane,
  faImage, faLocationDot, faUser, faFileAlt, faHeadphones,
  faIcons, faXmark, faKeyboard,
} from "@fortawesome/free-solid-svg-icons";
import EmojiPicker from "emoji-picker-react";
import { useSendMessageMutation } from "../../store/api/chatApi";
import { useAuth } from "../../context/authContext";

// sessionId persists for the lifetime of this widget mount
// so the whole conversation is one Dialogflow session
const SESSION_ID = crypto.randomUUID();

const ChatInput = ({ onNewExchange }) => {
  const { token } = useAuth();

  const textareaRef  = useRef(null);
  const galleryRef   = useRef(null);
  const cameraRef    = useRef(null);
  const docRef       = useRef(null);
  const audioRef     = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const timerRef         = useRef(null);
  const startXRef        = useRef(0);
  const isCancelledRef   = useRef(false);

  const [input,           setInput]           = useState("");
  const [isRecording,     setIsRecording]     = useState(false);
  const [recordTime,      setRecordTime]      = useState(0);
  const [showAttachMenu,  setShowAttachMenu]  = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewFile,     setPreviewFile]     = useState(null);
  const [filePreview,     setFilePreview]     = useState({ type: null, url: null, name: null });
  const [isSending,       setIsSending]       = useState(false);

  const [sendMessage] = useSendMessageMutation();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t?.stop());
      }
    };
  }, []);

  // ── Send handler ────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!token || isSending) return;
    const text = input.trim();
    if (!text && !previewFile) return;

    const messageText = text || "(file)";
    const now = new Date().toISOString();

    // 1. Optimistic user bubble — show instantly
    const userMsg = {
      _id:       `temp-user-${Date.now()}`,
      text:      messageText,
      sentBy:    "User",
      createdAt: now,
      isRead:    false,
    };

    // 2. Thinking bubble — shown while waiting for bot
    const thinkingMsg = {
      _id:       `temp-bot-${Date.now()}`,
      text:      "...",
      sentBy:    "Bot",
      createdAt: now,
      isRead:    true,
      isThinking: true,
    };

    onNewExchange(userMsg, thinkingMsg);

    // Reset input immediately so user isn't waiting
    setInput("");
    setShowAttachMenu(false);
    setShowEmojiPicker(false);
    clearPreview();
    setIsSending(true);

    try {
      const result = await sendMessage({
        message:   messageText,
        sessionId: SESSION_ID,
        token,
      }).unwrap();

      // 3. Replace thinking bubble with real bot reply
      const botMsg = {
        _id:       `bot-${Date.now()}`,
        text:      result.reply,
        sentBy:    "Bot",
        createdAt: new Date().toISOString(),
        isRead:    true,
        escalate:  result.escalate,
      };

      // Replace the thinking bubble via the callback
      onNewExchange(null, botMsg, thinkingMsg._id);

    } catch (err) {
      console.error("Send error:", err);
      const errorMsg = {
        _id:       `bot-error-${Date.now()}`,
        text:      "Sorry, something went wrong. Please try again.",
        sentBy:    "Bot",
        createdAt: new Date().toISOString(),
        isRead:    true,
      };
      onNewExchange(null, errorMsg, thinkingMsg._id);
    } finally {
      setIsSending(false);
    }
  };

  // ── File selection ──────────────────────────────────────────
  const handleFileSelection = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type = "document";
    if (file.type.startsWith("image"))            type = "image";
    else if (file.type === "application/pdf")      type = "pdf";
    else if (file.type.startsWith("video"))        type = "video";
    else if (file.type.startsWith("audio"))        type = "audio";

    setFilePreview({ type, url: URL.createObjectURL(file), name: file.name });
    setPreviewFile(file);
    setShowAttachMenu(false);
  };

  const clearPreview = () => {
    setFilePreview({ type: null, url: null, name: null });
    setPreviewFile(null);
    [galleryRef, docRef, cameraRef, audioRef].forEach((r) => {
      if (r.current) r.current.value = "";
    });
  };

  // ── Audio recording ─────────────────────────────────────────
  const handlePointerDown = async (e) => {
    e.preventDefault();
    startXRef.current    = e.clientX;
    isCancelledRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current   = [];

      mediaRecorder.ondataavailable = (ev) => audioChunksRef.current.push(ev.data);
      mediaRecorder.onstop = () => {
        if (isCancelledRef.current) return;
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setPreviewFile(audioBlob);
        setFilePreview({ type: "audio", url: URL.createObjectURL(audioBlob), name: "Voice Record" });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= 60) { handlePointerUp(); return prev; }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert("Microphone access denied");
    }
  };

  const handlePointerMove = (e) => {
    if (!isRecording) return;
    if (startXRef.current - e.clientX > 50) {
      isCancelledRef.current = true;
      stopRecordingHardware();
    }
  };

  const handlePointerUp = (e) => {
    if (e) e.preventDefault();
    if (!isRecording) return;
    stopRecordingHardware();
  };

  const stopRecordingHardware = () => {
    if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t?.stop());
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // ── Location & Contact ──────────────────────────────────────
  const sendLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const mapUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
        await sendMessage({ message: `My location: ${mapUrl}`, sessionId: SESSION_ID, token }).unwrap();
      },
      () => alert("Unable to retrieve location.")
    );
  };

  const sendContact = async () => {
    if ("contacts" in navigator && "ContactsManager" in window) {
      try {
        const contacts = await navigator.contacts.select(["name", "tel"], { multiple: false });
        if (contacts.length > 0) {
          const { name, tel } = contacts[0];
          await sendMessage({
            message:   `Shared Contact: ${name?.[0] || "Unknown"} | ${tel?.[0] || ""}`,
            sessionId: SESSION_ID,
            token,
          }).unwrap();
        }
      } catch (ex) { console.error(ex); }
    } else {
      alert("Your browser doesn't support contact picking.");
    }
  };

  const handleEmojiClick = (emojiObject) => setInput((prev) => prev + emojiObject.emoji);

  const formatRecordTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  const hasContent = input.trim().length > 0 || previewFile !== null;

  return (
    <div className="wa-input-container" style={{ flexDirection: "column" }}>

      {/* FILE PREVIEW */}
      {filePreview.type && (
        <div className="file-preview">
          <div className="file-preview-left">
            {filePreview.type === "image"    && <img src={filePreview.url} className="file-preview-image-sending" alt="" />}
            {filePreview.type === "audio"    && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#00a884", fontSize: 20 }}><FontAwesomeIcon icon={faHeadphones} /></span>
                <audio controls src={filePreview.url} style={{ height: 30, width: 150 }} />
              </div>
            )}
            {filePreview.type === "document" && <span style={{ color: "#7f66ff" }}><FontAwesomeIcon icon={faFileAlt} /></span>}
            <span className="file-preview-name">{filePreview.name}</span>
          </div>
          <button onClick={clearPreview} className="icon-circle-btn">
            <FontAwesomeIcon icon={faXmark} color="#000" />
          </button>
        </div>
      )}

      {/* INPUT ROW */}
      <div style={{ display: "flex", alignItems: "flex-end", width: "100%", gap: 8 }}>

        {isRecording && (
          <div className="wa-recording-overlay">
            <div className="wa-recording-pulse" />
            <span className="wa-recording-time">{formatRecordTime(recordTime)}</span>
            <span className="wa-recording-hint">&lt; Slide to cancel</span>
          </div>
        )}

        <div className="wa-input-pill" style={{ display: isRecording ? "none" : "flex" }}>

          <button className="wa-icon-btn" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachMenu(false); }}>
            <FontAwesomeIcon icon={showEmojiPicker ? faKeyboard : faIcons} />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setShowEmojiPicker(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
            }}
            className="wa-textarea slim-scroll"
            placeholder="Message"
            rows={1}
            disabled={isSending}
          />

          <div className="wa-pill-actions">
            <button className="wa-icon-btn attach" onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiPicker(false); }}>
              <FontAwesomeIcon icon={faPaperclip} />
            </button>
            {!hasContent && (
              <button className="wa-icon-btn camera" onClick={() => cameraRef.current?.click()}>
                <FontAwesomeIcon icon={faCamera} />
              </button>
            )}
          </div>

          {showEmojiPicker && (
            <div className="wa-emoji-picker-container">
              <EmojiPicker onEmojiClick={handleEmojiClick} width="100%" height={300}
                searchDisabled skinTonesDisabled previewConfig={{ showPreview: false }} />
            </div>
          )}

          {showAttachMenu && (
            <div className="wa-attach-menu">
              <div className="wa-attach-item" onClick={() => docRef.current?.click()}>
                <div className="wa-attach-icon doc"><FontAwesomeIcon icon={faFileAlt} /></div><span>Document</span>
              </div>
              <div className="wa-attach-item" onClick={() => cameraRef.current?.click()}>
                <div className="wa-attach-icon cam"><FontAwesomeIcon icon={faCamera} /></div><span>Camera</span>
              </div>
              <div className="wa-attach-item" onClick={() => galleryRef.current?.click()}>
                <div className="wa-attach-icon gal"><FontAwesomeIcon icon={faImage} /></div><span>Gallery</span>
              </div>
              <div className="wa-attach-item" onClick={() => audioRef.current?.click()}>
                <div className="wa-attach-icon aud"><FontAwesomeIcon icon={faHeadphones} /></div><span>Audio</span>
              </div>
              <div className="wa-attach-item" onClick={sendLocation}>
                <div className="wa-attach-icon loc"><FontAwesomeIcon icon={faLocationDot} /></div><span>Location</span>
              </div>
              <div className="wa-attach-item" onClick={sendContact}>
                <div className="wa-attach-icon usr"><FontAwesomeIcon icon={faUser} /></div><span>Contact</span>
              </div>
            </div>
          )}
        </div>

        <div className="wa-action-wrapper">
          {hasContent ? (
            <button className="wa-action-btn send" onClick={handleSendMessage} disabled={isSending}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          ) : (
            <button
              className="wa-action-btn mic"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <FontAwesomeIcon icon={faMicrophone} />
            </button>
          )}
        </div>
      </div>

      <input type="file" ref={galleryRef} className="hidden-file-input" accept="image/*,video/*"           onChange={handleFileSelection} />
      <input type="file" ref={docRef}     className="hidden-file-input" accept=".pdf,.doc,.docx,.txt"      onChange={handleFileSelection} />
      <input type="file" ref={audioRef}   className="hidden-file-input" accept="audio/*"                   onChange={handleFileSelection} />
      <input type="file" ref={cameraRef}  className="hidden-file-input" accept="image/*,video/*" capture="environment" onChange={handleFileSelection} />
    </div>
  );
};

export default ChatInput;