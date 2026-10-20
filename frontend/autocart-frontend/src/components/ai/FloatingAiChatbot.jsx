import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { parseNaturalLanguageCarQuery } from "../../services/aiFilterService";
import { FaRobot, FaPaperPlane, FaTimes, FaTimesCircle, FaChevronRight, FaMagic, FaExchangeAlt, FaShieldAlt } from "react-icons/fa";
import "./FloatingAiChatbot.css";

function FloatingAiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const chatBottomRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! 👋 I am your AutoCart AI Assistant. Ask me anything about car specifications or describe your dream car (e.g. 'Show me SUVs under 15 Lakh with automatic transmission'), and I will find the car and open its page for you!",
      matchedModel: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    if (chatBottomRef.current && isOpen) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

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
      const result = await parseNaturalLanguageCarQuery(textToSend);

      const hasModel = result && result.matchedModel;
      const confidenceOk = result && result.confidence >= 0.4;

      if (!result || (!hasModel && !result.brand && !result.bodyType) || !confidenceOk) {
        const botMsg = {
          id: Date.now() + 1,
          sender: "bot",
          text: `I couldn't match any car search filters for "${textToSend}". Try asking e.g. "Show me SUVs under 15 Lakh with automatic transmission" or "Honda Amaze specifications".`,
          matchedModel: null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Dispatch event to sync Explore Vehicles grid in real time
        window.dispatchEvent(new CustomEvent("autocart:ai-filter-apply", { detail: result }));

        const botMsg = {
          id: Date.now() + 1,
          sender: "bot",
          text: result.aiExplanation,
          matchedModel: result.matchedModel,
          parsedFilters: result,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error("AI Chatbot Error:", err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Sorry, an error occurred while looking up car specifications. Please try again.",
        matchedModel: null,
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

  return (
    <>
      {/* 1. FLOATING PILL TRIGGER BUTTON MATCHING SCREENSHOT */}
      <div className="floating-ai-trigger-container">
        <button
          className="floating-ai-pill-btn shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
          title="Open AutoCart AI Assistant"
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
                  AutoCart AI Assistant
                </h6>
                <small className="text-light text-opacity-75">Online • Real-time Car Finder & Specifications</small>
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
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message-row ${msg.sender === "user" ? "message-user" : "message-bot"}`}
              >
                <div className="message-bubble shadow-sm">
                  <div className="message-text">{msg.text}</div>

                  {/* CAR SPECIFICATION CARD */}
                  {msg.matchedModel && (
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
              </div>
            ))}

            {loading && (
              <div className="chat-message-row message-bot">
                <div className="message-bubble loading-bubble">
                  <span className="spinner-grow spinner-grow-sm text-primary me-2" role="status"></span>
                  <span>🤖 AI analyzing specification database...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* QUICK SUGGESTIONS STRIP */}
          <div className="ai-chat-quick-suggestions">
            <button
              className="quick-chip"
              onClick={() => handleSendMessage("Honda Amaze specs")}
            >
              🚗 Honda Amaze Specs
            </button>
            <button
              className="quick-chip"
              onClick={() => handleSendMessage("SUVs under 15 Lakh with automatic transmission")}
            >
              🚙 SUVs under 15 Lakh
            </button>
            <button
              className="quick-chip"
              onClick={() => handleSendMessage("Volkswagen Virtus specifications")}
            >
              🏎️ VW Virtus Specs
            </button>
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
              placeholder="Ask AI for car specs or describe what you need..."
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
