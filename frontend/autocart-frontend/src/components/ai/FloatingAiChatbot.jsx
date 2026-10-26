import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { parseNaturalLanguageCarQuery } from "../../services/aiFilterService";
import { FaPaperPlane, FaTimes, FaChevronRight } from "react-icons/fa";
import "./FloatingAiChatbot.css";

const DEFAULT_CHIPS = [
  { label: "🚙 SUVs under 15 Lakh", query: "SUVs under 15 Lakh" },
  { label: "💰 Cars under 10 Lakh", query: "Cars under 10 Lakh" },
  { label: "⚡ Electric Cars", query: "Electric cars" },
  { label: "🏎️ Top Sedans", query: "Sedans" }
];

function FloatingAiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastFilters, setLastFilters] = useState(null);
  const [lastFailedQuery, setLastFailedQuery] = useState(null);
  const navigate = useNavigate();
  const chatBottomRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      intent: "GREETING",
      text: "Hello! 👋 I'm your AutoCart Car Advisor. Looking for a new ride today? Tell me what you have in mind—such as your preferred budget, body type (SUV, Sedan, Hatchback), or fuel choice!",
      matchedModel: null,
      quickReplies: DEFAULT_CHIPS,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    if (chatBottomRef.current && isOpen) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (customText) => {
    const textToSend = customText || inputMessage;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const result = await parseNaturalLanguageCarQuery(textToSend, messages, lastFilters);

      if (result) {
        const isSearchWithResults =
          (result.intent === "SEARCH" || result.intent === "FOLLOW_UP") &&
          Array.isArray(result.backendVehicles) &&
          result.backendVehicles.length > 0;

        // Track filters across multi-turn conversation only on search / follow_up
        if ((result.intent === "SEARCH" || result.intent === "FOLLOW_UP") && result.extractedFilters && (
          result.extractedFilters.brand ||
          result.extractedFilters.bodyType ||
          result.extractedFilters.fuelType ||
          result.extractedFilters.transmission ||
          result.extractedFilters.minPrice ||
          result.extractedFilters.maxPrice
        )) {
          setLastFilters(result.extractedFilters);
        }

        // Dispatch filter sync for explore vehicles grid ONLY if SEARCH or FOLLOW_UP and vehicles returned
        if (isSearchWithResults) {
          window.dispatchEvent(new CustomEvent("autocart:ai-filter-apply", { detail: result }));
        }

        const replyText = result.reply || result.aiExplanation || "Here is what I found for you.";

        const botMsg = {
          id: Date.now() + 1,
          sender: "bot",
          text: replyText,
          intent: result.intent,
          matchedModel: isSearchWithResults ? result.matchedModel : null,
          parsedFilters: result.extractedFilters,
          quickReplies: result.quickReplies && result.quickReplies.length > 0 ? result.quickReplies : [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const botMsg = {
          id: Date.now() + 1,
          sender: "bot",
          intent: "UNKNOWN",
          text: "I am an automotive advisor for AutoCart! I specialize in helping you explore and compare cars by budget, brand, body type, and fuel. What kind of vehicle are you looking for?",
          matchedModel: null,
          quickReplies: DEFAULT_CHIPS,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error("AI Chatbot Error:", err);
      setLastFailedQuery(textToSend);
      const errorMsg = {
        id: Date.now() + 1,
        sender: "bot",
        isError: true,
        intent: "UNKNOWN",
        retryQuery: textToSend,
        text: "Sorry, I encountered an issue while processing your request. Please check your connection and try again.",
        matchedModel: null,
        quickReplies: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModelPage = (modelId) => {
    setIsOpen(false);
    navigate(`/models/${modelId}`);
  };

  const latestBotIndex = messages.map((m) => m.sender).lastIndexOf("bot");

  return (
    <>
      {/* 1. FLOATING PILL TRIGGER BUTTON */}
      <div className="floating-ai-trigger-container">
        <button
          className="floating-ai-pill-btn shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
          title="Open AutoCart Car Advisor"
        >
          <span className="ai-bot-avatar">🤖</span>
          <span className="ai-btn-text">AI Assistant</span>
        </button>
      </div>

      {/* 2. CHATBOT MODAL WINDOW */}
      {isOpen && (
        <div className="ai-chatbot-window shadow-2xl">
          {/* HEADER */}
          <div className="ai-chat-header">
            <div className="d-flex align-items-center gap-2">
              <div className="header-avatar">🤖</div>
              <div>
                <h6 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                  AutoCart Car Advisor
                </h6>
                <small className="text-light text-opacity-75">Online • Real-time Car Recommendations & Specs</small>
              </div>
            </div>

            <button
              className="btn btn-link text-white text-opacity-75 p-0 border-0"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="ai-chat-messages">
            {messages.map((msg, index) => {
              const isLatestBot = msg.sender === "bot" && index === latestBotIndex;

              return (
                <div
                  key={msg.id}
                  className={`chat-message-row ${msg.sender === "user" ? "message-user" : "message-bot"}`}
                >
                  <div className={`message-bubble shadow-sm ${msg.isError ? "error-bubble" : ""}`}>
                    <div className="message-text" style={{ whiteSpace: "pre-line" }}>{msg.text}</div>

                    {/* INLINE RETRY BUTTON */}
                    {msg.isError && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger mt-2 d-flex align-items-center gap-1 inline-retry-btn"
                        onClick={() => handleSendMessage(msg.retryQuery || lastFailedQuery)}
                      >
                        <span>🔄 Retry</span>
                      </button>
                    )}

                    {/* CAR SPECIFICATION CARD: ONLY SEARCH/FOLLOW_UP WITH REAL MATCHED MODEL */}
                    {(msg.intent === "SEARCH" || msg.intent === "FOLLOW_UP") && msg.matchedModel && (
                      <div className="ai-car-spec-card mt-3">
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <img
                            src={msg.matchedModel.image}
                            alt={msg.matchedModel.name}
                            className="car-thumb rounded-3"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#1e293b"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="32">🚘</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Vehicle Preview</text></svg>'
                              )}`;
                            }}
                          />
                          <div>
                            <h6 className="fw-bold text-dark mb-0">
                              {msg.matchedModel.brandName} {msg.matchedModel.name}
                            </h6>
                            <span className="badge bg-primary-subtle text-primary fw-bold" style={{ fontSize: "0.72rem" }}>
                              {msg.matchedModel.bodyType}
                            </span>
                            <div className="fw-bold text-success mt-1 small">
                              {msg.matchedModel.priceFormatted}
                            </div>
                          </div>
                        </div>

                        {/* SPEC GRID */}
                        <div className="spec-mini-grid">
                          <div className="spec-item">
                            <span>⚙️ Engine</span>
                            <strong>{msg.matchedModel.engine}</strong>
                          </div>
                          <div className="spec-item">
                            <span>⚡ Power</span>
                            <strong>{msg.matchedModel.power}</strong>
                          </div>
                          <div className="spec-item">
                            <span>🔄 Torque</span>
                            <strong>{msg.matchedModel.torque}</strong>
                          </div>
                          <div className="spec-item">
                            <span>⛽ Mileage</span>
                            <strong>{msg.matchedModel.mileage}</strong>
                          </div>
                          <div className="spec-item">
                            <span>🛡️ Safety</span>
                            <strong>{msg.matchedModel.safety}</strong>
                          </div>
                          <div className="spec-item">
                            <span>🪑 Seating</span>
                            <strong>{msg.matchedModel.seating}</strong>
                          </div>
                        </div>

                        {/* NAVIGATE TO MODEL PAGE BUTTON */}
                        <button
                          className="btn btn-primary btn-sm w-100 mt-3 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2"
                          onClick={() => handleOpenModelPage(msg.matchedModel.id)}
                        >
                          <span>🏎️ Open {msg.matchedModel.brandName} {msg.matchedModel.name} Page</span>
                          <FaChevronRight size={12} />
                        </button>
                      </div>
                    )}

                    <div className="message-time">{msg.timestamp}</div>
                  </div>

                  {/* CHIPS ONLY UNDER THE LATEST ASSISTANT MESSAGE AND NONE WHILE LOADING */}
                  {isLatestBot && !loading && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="ai-chat-quick-suggestions">
                      {msg.quickReplies.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="quick-chip"
                          onClick={() => handleSendMessage(chip.query)}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="chat-message-row message-bot">
                <div className="message-bubble typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="ai-chat-input-container"
          >
            <input
              type="text"
              className="form-control border-0"
              placeholder="Ask for recommendations, specs, budget..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
              disabled={loading || !inputMessage.trim()}
              style={{ width: "40px", height: "40px" }}
            >
              <FaPaperPlane size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default FloatingAiChatbot;
