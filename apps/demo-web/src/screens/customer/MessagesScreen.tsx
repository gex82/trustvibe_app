import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Send, FolderOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { useRuntime } from "../../context/RuntimeContext";
import { getInitialThreads } from "../../data/messages";
import { findUserById } from "../../data/users";
import type { Contractor, Message, MessageThread } from "../../types";
import TopBar from "../../components/layout/TopBar";
import Avatar from "../../components/ui/Avatar";
import { formatTime } from "../../utils/formatters";
import { getLocalizedField } from "../../utils/localization";
import {
  listMessages as listMessagesApi,
  sendMessage as sendMessageApi,
} from "../../services/api";

export default function MessagesScreen() {
  const { currentUser } = useAuth();
  const { t, lang, locale } = useApp();
  const { dataMode } = useRuntime();
  const [searchParams] = useSearchParams();
  const contractorIdParam = searchParams.get("contractor");
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  const buildInitialThreads = (): MessageThread[] => {
    const baseThreads = getInitialThreads(lang);

    if (!contractorIdParam || !currentUser) return baseThreads;

    const existing = baseThreads.find(
      (th) =>
        th.participants.includes(contractorIdParam) &&
        th.participants.includes(currentUser.id)
    );
    if (existing) return baseThreads;

    const contractor = findUserById(contractorIdParam, lang) as Contractor | null;
    if (!contractor) return baseThreads;

    const newThread: MessageThread = {
      id: `thread-${contractorIdParam}-${Date.now()}`,
      participants: [currentUser.id, contractorIdParam],
      projectId: "",
      projectTitle: contractor.businessName ?? contractor.name,
      messages: [],
    };
    return [newThread, ...baseThreads];
  };

  const resolveInitialActiveThread = (seedThreads: MessageThread[]): MessageThread | null => {
    if (contractorIdParam && currentUser) {
      const match = seedThreads.find(
        (th) =>
          th.participants.includes(contractorIdParam) &&
          th.participants.includes(currentUser.id)
      );
      if (match) return match;
    }
    return seedThreads[0] ?? null;
  };

  // Build initial threads — add a new thread if ?contractor= param is present and thread doesn't exist yet
  const [threads, setThreads] = useState<MessageThread[]>(() => buildInitialThreads());

  // Set active thread: if ?contractor= is specified, find that thread; otherwise use first thread
  const [activeThread, setActiveThread] = useState<MessageThread | null>(() =>
    resolveInitialActiveThread(threads)
  );

  const [input, setInput] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length]);

  useEffect(() => {
    const nextThreads = buildInitialThreads();
    setThreads(nextThreads);
    setActiveThread(resolveInitialActiveThread(nextThreads));
    // Reset composer so message language is consistent after toggles.
    setInput("");
  }, [lang, contractorIdParam, currentUser?.id]);

  useEffect(() => {
    if (dataMode !== "live" || !activeThread?.projectId) {
      return;
    }

    void (async () => {
      try {
        const response = await listMessagesApi({
          projectId: activeThread.projectId,
          limit: 50,
        });

        const mapped = response.messages.map((item) => ({
          id: item.id,
          threadId: activeThread.id,
          senderId: item.senderId,
          text: getLocalizedField(
            item as unknown as Record<string, unknown>,
            "body",
            lang,
            item.body
          ),
          timestamp: item.createdAt,
          read: true,
        }));

        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === activeThread.id ? { ...thread, messages: mapped } : thread
          )
        );
        setActiveThread((prev) =>
          prev ? { ...prev, messages: mapped } : prev
        );
      } catch {
        // keep existing thread data on failures
      }
    })();
  }, [activeThread?.id, activeThread?.projectId, dataMode, lang]);

  const sendMessage = () => {
    if (!input.trim() || !activeThread || !currentUser) return;
    const localMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId: activeThread.id,
      senderId: currentUser.id,
      text: input.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };

    if (dataMode === "live" && activeThread.projectId) {
      void (async () => {
        try {
          const response = await sendMessageApi({
            projectId: activeThread.projectId,
            body: input.trim(),
          });
          const remoteMessage: Message = {
            id: response.message.id,
            threadId: activeThread.id,
            senderId: response.message.senderId,
            text: getLocalizedField(
              response.message as unknown as Record<string, unknown>,
              "body",
              lang,
              response.message.body
            ),
            timestamp: response.message.createdAt,
            read: true,
          };
          setThreads((prev) =>
            prev.map((th) =>
              th.id === activeThread.id
                ? { ...th, messages: [...th.messages, remoteMessage] }
                : th
            )
          );
          setActiveThread((prev) =>
            prev ? { ...prev, messages: [...prev.messages, remoteMessage] } : null
          );
        } catch {
          setThreads((prev) =>
            prev.map((th) =>
              th.id === activeThread.id
                ? { ...th, messages: [...th.messages, localMessage] }
                : th
            )
          );
          setActiveThread((prev) =>
            prev ? { ...prev, messages: [...prev.messages, localMessage] } : null
          );
        }
      })();
      setInput("");
      return;
    }

    setThreads((prev) =>
      prev.map((th) =>
        th.id === activeThread.id
          ? { ...th, messages: [...th.messages, localMessage] }
          : th
      )
    );
    setActiveThread((prev) =>
      prev ? { ...prev, messages: [...prev.messages, localMessage] } : null
    );
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!activeThread) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <TopBar title={t("nav.messages")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <FolderOpen size={36} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">{t("msg.empty")}</p>
          <p className="text-gray-400 text-sm mt-1">{t("msg.emptySub")}</p>
        </div>
      </div>
    );
  }

  const otherUserId = activeThread.participants.find((p) => p !== currentUser?.id);
  const otherUser = findUserById(otherUserId ?? "", lang);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 pressable"
          style={{ display: "none" }}
        />
        {otherUser && <Avatar src={otherUser.avatarUrl} name={otherUser.name} size="sm" />}
        <div>
          <p className="font-bold text-gray-900 text-[14px]">
            {otherUser?.role === "contractor"
              ? (otherUser as Contractor).businessName ?? otherUser.name
              : otherUser?.name}
          </p>
          <p className="text-gray-400 text-[11px] truncate max-w-[200px]">
            {activeThread.projectTitle}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {activeThread.messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <p className="text-gray-400 text-[13px]">{t("msg.startConversation")}</p>
          </div>
        )}
        {activeThread.messages.map((msg, i) => {
          const isMe = msg.senderId === currentUser?.id;
          const showAvatar =
            !isMe &&
            (i === 0 || activeThread.messages[i - 1]?.senderId !== msg.senderId);

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
            >
              {!isMe && (
                <div className="w-7 flex-shrink-0">
                  {showAvatar && otherUser && (
                    <Avatar src={otherUser.avatarUrl} name={otherUser.name} size="xs" />
                  )}
                </div>
              )}
              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    isMe
                      ? "bg-teal-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1">
                  {formatTime(msg.timestamp, locale)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-3 py-3 flex items-end gap-2">
        <input
          data-testid="messages-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t("msg.placeholder")}
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          data-testid="messages-send"
          className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center pressable disabled:opacity-40"
        >
          <Send size={15} className="text-white" />
        </button>
      </div>
    </div>
  );
}
