// Social follow links are placeholders until the real Platinum Ethiopia accounts are provided.
export const SOCIAL_TASKS = [
  { id: "telegram", name: "Telegram", action: "ቻናላችንን ይቀላቀሉ", url: "https://t.me/" },
  { id: "tiktok", name: "TikTok", action: "TikTok ላይ ይከተሉን", url: "https://www.tiktok.com/" },
  { id: "youtube", name: "YouTube", action: "ሰብስክራይብ ያድርጉ", url: "https://www.youtube.com/" },
  { id: "facebook", name: "Facebook", action: "ገጻችንን ላይክ ያድርጉ", url: "https://www.facebook.com/" },
  { id: "instagram", name: "Instagram", action: "Instagram ላይ ይከተሉን", url: "https://www.instagram.com/" },
] as const;
export type TaskId = (typeof SOCIAL_TASKS)[number]["id"];
