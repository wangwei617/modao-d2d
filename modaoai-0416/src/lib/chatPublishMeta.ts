export type ChatPublishMeta = {
  slug: string;
  live: boolean;
};

function storageKey(chatLabel: string) {
  return `modao_d2d_chat_publish:${encodeURIComponent(chatLabel)}`;
}

export function setChatPublishMeta(chatLabel: string, meta: ChatPublishMeta | null): void {
  if (!chatLabel) return;
  try {
    if (meta === null) {
      localStorage.removeItem(storageKey(chatLabel));
      return;
    }
    localStorage.setItem(storageKey(chatLabel), JSON.stringify(meta));
  } catch (e) {
    console.warn('setChatPublishMeta failed', e);
  }
}

export function getChatPublishMeta(chatLabel: string): ChatPublishMeta | null {
  if (!chatLabel) return null;
  try {
    const raw = localStorage.getItem(storageKey(chatLabel));
    if (!raw) return null;
    return JSON.parse(raw) as ChatPublishMeta;
  } catch {
    return null;
  }
}

/** 当前对话是否曾发布且仍为在线 */
export function isChatPublishedLive(chatLabel: string): boolean {
  const m = getChatPublishMeta(chatLabel);
  return m?.live === true;
}

/** 删除对话后清理侧栏关联的发布记录 */
export function clearChatPublishMetaForChat(chatLabel: string): void {
  setChatPublishMeta(chatLabel, null);
}
