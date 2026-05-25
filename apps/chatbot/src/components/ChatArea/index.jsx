import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckDouble, faLocationDot, faUser,
  faAnglesDown, faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import ChatInput from "../ChatInput/index.jsx";
import FilePreview from "../FilePreview/index.jsx";
import OrderCard from "../OrderCard/index.jsx";
import LoadingSpinner from "../Loading/LoadingSpinner.jsx";
import { useAuth } from "../../context/authContext.jsx";
import { useGetChatHistoryQuery } from "../../store/api/chatApi.js";
import { formatTime, formatDate } from "../../utils/helpers.js";
import { isOrderCard } from '../../utils/helpers.js';


// ─────────────────────────────────────────────────────────────
// Message shape:
// {
//   _id: string
//   text: string | null          ← null when reply is an orderCard
//   reply: string | object       ← object = { type, text, order }
//   sentBy: "User" | "Bot"
//   createdAt: ISO string
//   isRead: boolean
// }
// ─────────────────────────────────────────────────────────────

const ChatArea = ({ onClose, setPreviewImage }) => {
  const { token } = useAuth();

  const scrollRef     = useRef(null);
  const messagesEndRef = useRef(null);
  const isAtBottomRef  = useRef(true);

  const [messages,    setMessages]    = useState([]);
  const [isAtBottom,  setIsAtBottom]  = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading,   setIsLoading]   = useState(true);

  // ── Load history on mount ──────────────────────────────────
  const { data: historyData, isLoading: historyLoading } = useGetChatHistoryQuery(token, {
    skip: !token,
  });

  useEffect(() => {
    if (historyLoading) return;
 
    if (historyData?.conversations?.length > 0) {
      const allMessages = historyData.conversations
        .flatMap((conv) => conv.messages)
        .flatMap((msg) => [
          {
            _id:       `${msg._id}-user`,
            text:      msg.userMessage,
            reply:     msg.userMessage,
            sentBy:    "User",
            createdAt: msg.createdAt,
            isRead:    true,
          },
          {
            _id:       `${msg._id}-bot`,
            text:      msg.botReply,
            reply:     msg.botReply,  // stored as plain text in DB
            sentBy:    "Bot",
            createdAt: msg.createdAt,
            isRead:    true,
          },
        ])
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
 
      setMessages(allMessages);
    }
 
    setTimeout(() => setIsLoading(false), 800);
  }, [historyData, historyLoading]);

  // ── Scroll helpers ─────────────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setUnreadCount(0);
  };

  useEffect(() => {
    if (!isLoading) scrollToBottom();
  }, [isLoading]);

  // Scroll to bottom when a new message is added and user is already at bottom
  useEffect(() => {
    if (isAtBottomRef.current) scrollToBottom();
  }, [messages.length]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAtBottom(atBottom);
    isAtBottomRef.current = atBottom;
    if (atBottom && unreadCount > 0) setUnreadCount(0);
  };

  // ── Called by ChatInput ────────────────────────────────────
  // Phase 1: userMsg + thinkingMsg         → append both
  // Phase 2: null   + botMsg + replaceId   → swap thinking bubble
  const handleNewExchange = (userMsg, botMsg, replaceId = null) => {
    setMessages((prev) => {
      if (replaceId) {
        return prev.map((m) => (m._id === replaceId ? botMsg : m));
      }
      const next = [...prev];
      if (userMsg) next.push(userMsg);
      if (botMsg)  next.push(botMsg);
      return next;
    });

    if (!isAtBottomRef.current && !replaceId) {
      setUnreadCount((prev) => prev + 1);
    }
  };


  const renderContent = (msg) => {
    console.log('message: ', msg);
    console.log('isOrderCard: ', isOrderCard(msg?.text));

    // Thinking bubble
    if (msg.isThinking) {
      return <span className="chat-thinking">···</span>;
    }
 
    // Order card — live reply from server
    if (isOrderCard(msg?.text)) {
      return <OrderCard data={msg?.text} />;
    }
 
    const text = msg?.text || "";
 
    // File
    if (msg.fileUrl) {
      return (
        <FilePreview
          fileType={msg.fileType}
          fileUrl={msg.fileUrl}
          fileName={msg.fileName}
          onImageClick={(url) => setPreviewImage(url)}
          text={text}
          sender={msg.sentBy}
        />
      );
    }
 
    // Location
    if (text?.includes("maps.google.com") || text?.includes("google.com/maps")) {
      return (
        <a
          href={text.match(/(https?:\/\/[^\s]+)/)?.[0] || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="wa-location-card"
        >
          <div className="wa-location-map-bg">
            <FontAwesomeIcon icon={faLocationDot} className="wa-location-pin-icon" />
          </div>
          <div className="wa-location-footer">
            <span className="wa-location-title">Location</span>
            <span className="wa-location-subtitle">View on Google Maps</span>
          </div>
        </a>
      );
    }
 
    // Contact
    if (text?.startsWith("Shared Contact:")) {
      const parts = text?.replace("Shared Contact: ", "").split(" | ");
      const name  = parts[0] || "Unknown Contact";
      const phone = parts[1] || "";
      return (
        <div className="wa-contact-card">
          <div className="wa-contact-header">
            <div className="wa-contact-avatar"><FontAwesomeIcon icon={faUser} /></div>
            <div className="wa-contact-info">
              <span className="wa-contact-name">{name}</span>
              <span className="wa-contact-phone">{phone}</span>
            </div>
          </div>
          <div className="wa-contact-actions">
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="wa-contact-btn">
              Message / Call
            </a>
          </div>
        </div>
      );
    }
 
    // Plain text
    return text;
  };

  return (
    <div className="chat-container">

      {/* HEADER */}
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="chat-header-profile">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <h2>Support 24x7</h2>
        </div>
        <button onClick={onClose} className="chat-close-btn">✕</button>
      </div>

      {/* MESSAGES */}
      <div
        className="chat-messages slim-scroll"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="chat-initial-loader">
            <LoadingSpinner size={36} text="Loading chat..." />
          </div>
        ) : messages.length > 0 ? (
          <>
            {messages.map((msg, idx) => {
              const currentDate = msg.createdAt?.split("T")[0];
              const prevDate    = idx > 0 ? messages[idx - 1]?.createdAt?.split("T")[0] : null;
              const showDate    = idx === 0 || currentDate !== prevDate;

              return (
                <React.Fragment key={msg._id}>
                  {showDate && (
                    <div className="chat-date-wrapper">
                      <div className="chat-date-pill">{formatDate(currentDate)}</div>
                    </div>
                  )}

                  <div className={`chat-message ${msg.sentBy === "User" ? "user" : "bot"}`}>
                    <div className={`chat-bubble ${msg.sentBy === "User" ? "user" : "bot"}`}>

                      <div className="chat-bubble-content">
                        {renderContent(msg)}
                        
                        {/* {msg.fileUrl ? (
                          <FilePreview
                            fileType={msg.fileType}
                            fileUrl={msg.fileUrl}
                            fileName={msg.fileName}
                            onImageClick={(url) => setPreviewImage(url)}
                            text={msg.text}
                            sender={msg.sentBy}
                          />
                        ) : (msg.text?.includes("maps.google.com") || msg.text?.includes("google.com/maps")) ? (
                          <a
                            href={msg.text.match(/(https?:\/\/[^\s]+)/)?.[0] || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="wa-location-card"
                          >
                            <div className="wa-location-map-bg">
                              <FontAwesomeIcon icon={faLocationDot} className="wa-location-pin-icon" />
                            </div>
                            <div className="wa-location-footer">
                              <span className="wa-location-title">Location</span>
                              <span className="wa-location-subtitle">View on Google Maps</span>
                            </div>
                          </a>
                        ) : msg.text?.startsWith("Shared Contact:") ? (
                          (() => {
                            const parts = msg.text.replace("Shared Contact: ", "").split(" | ");
                            const name  = parts[0] || "Unknown Contact";
                            const phone = parts[1] || "";
                            return (
                              <div className="wa-contact-card">
                                <div className="wa-contact-header">
                                  <div className="wa-contact-avatar">
                                    <FontAwesomeIcon icon={faUser} />
                                  </div>
                                  <div className="wa-contact-info">
                                    <span className="wa-contact-name">{name}</span>
                                    <span className="wa-contact-phone">{phone}</span>
                                  </div>
                                </div>
                                <div className="wa-contact-actions">
                                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="wa-contact-btn">
                                    Message / Call
                                  </a>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          msg.text
                        )} */}
                      </div>

                      <div className="chat-time-wrapper">
                        <span className="chat-time">{formatTime(msg.createdAt)}</span>
                        {msg.sentBy === "User" && (
                          <FontAwesomeIcon
                            icon={faCheckDouble}
                            className={`chat-tick ${msg.isRead ? "read" : "delivered"}`}
                          />
                        )}
                      </div>

                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <div className="chat-empty">
            <FontAwesomeIcon icon={faCircleQuestion} style={{ marginRight: 5 }} />
            <div>Need any help? Just type your issue below and send it…</div>
          </div>
        )}

        <div ref={messagesEndRef} style={{ height: 16, width: "100%", flexShrink: 0 }} />
      </div>

      {/* SCROLL TO BOTTOM BUTTON */}
      {!isAtBottom && (
        <div className="chat-scroll-to-bottom" onClick={scrollToBottom}>
          <FontAwesomeIcon icon={faAnglesDown} />
          {unreadCount > 0 && (
            <span className="chat-scroll-badge">{unreadCount}</span>
          )}
        </div>
      )}

      {/* INPUT — passes callback so it can push new messages up */}
      <ChatInput onNewExchange={handleNewExchange} />
    </div>
  );
};

export default ChatArea;