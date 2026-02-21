import type { MessageItem } from "@trustvibe/shared";
import type { DemoThread, Message } from "../types";
import { getLocalizedField, type DemoLang } from "../utils/localization";

function mapItemToMessage(item: MessageItem, lang: DemoLang): Message {
  return {
    id: item.id,
    threadId: `thread-${item.projectId}`,
    senderId: item.senderId,
    text: getLocalizedField(
      item as unknown as Record<string, unknown>,
      "body",
      lang,
      item.body
    ),
    timestamp: item.createdAt,
    read: true,
  };
}

export function mapMessagesToThread(
  projectId: string,
  projectTitle: string,
  participants: string[],
  messages: MessageItem[],
  lang: DemoLang = "en"
): DemoThread {
  return {
    id: `thread-${projectId}`,
    participants,
    projectId,
    projectTitle,
    messages: messages.map((item) => mapItemToMessage(item, lang)),
  };
}
