import type { MessageItem } from "@trustvibe/shared";
import type { DemoThread, Message } from "../types";

function mapItemToMessage(item: MessageItem): Message {
  return {
    id: item.id,
    threadId: `thread-${item.projectId}`,
    senderId: item.senderId,
    text: item.body,
    timestamp: item.createdAt,
    read: true,
  };
}

export function mapMessagesToThread(
  projectId: string,
  projectTitle: string,
  participants: string[],
  messages: MessageItem[]
): DemoThread {
  return {
    id: `thread-${projectId}`,
    participants,
    projectId,
    projectTitle,
    messages: messages.map(mapItemToMessage),
  };
}
