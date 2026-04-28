/**
 * Icon — icone SVG inline lucide-style.
 * Porting 1:1 dal prototipo (src/ui.jsx).
 */

import { ReactElement } from "react";

export type IconName =
  | "play" | "pause" | "record" | "chevron" | "chevrond" | "chevronu" | "chevronl"
  | "arrow" | "mic" | "video" | "upload" | "paperclip" | "check" | "x"
  | "search" | "plus" | "send" | "folder" | "home" | "book" | "users"
  | "inbox" | "chat" | "settings" | "calendar" | "clock" | "loop" | "speed"
  | "bookmark" | "note" | "bell" | "pencil" | "file" | "music" | "frame"
  | "tag" | "download" | "star" | "sparkle" | "eye" | "grid" | "list"
  | "filter" | "menu" | "warning" | "tip" | "skip" | "rewind";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
  color?: string;
}

const PATHS: Record<IconName, ReactElement> = {
  play: <polygon points="7,5 19,12 7,19" />,
  pause: <g><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></g>,
  record: <circle cx="12" cy="12" r="6" />,
  chevron: <polyline points="9 6 15 12 9 18" fill="none" />,
  chevrond: <polyline points="6 9 12 15 18 9" fill="none" />,
  chevronu: <polyline points="6 15 12 9 18 15" fill="none" />,
  chevronl: <polyline points="15 6 9 12 15 18" fill="none" />,
  arrow: <g><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></g>,
  mic: <g><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/></g>,
  video: <g><rect x="3" y="6" width="13" height="12" rx="2"/><polygon points="16 10 22 6 22 18 16 14"/></g>,
  upload: <g><path d="M12 16V4"/><polyline points="6 10 12 4 18 10"/><path d="M4 20h16"/></g>,
  paperclip: <path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5L10.5 17.5a2 2 0 0 1-3-3L15 7"/>,
  check: <polyline points="4 12 10 18 20 6" fill="none"/>,
  x: <g><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></g>,
  search: <g><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></g>,
  plus: <g><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></g>,
  send: <g><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></g>,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
  home: <g><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></g>,
  book: <path d="M4 4h11a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4z"/>,
  users: <g><circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M16 20a5 5 0 0 1 6-4"/></g>,
  inbox: <g><path d="M3 13l3-8h12l3 8"/><path d="M3 13v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-6a2 2 0 0 1-4 0H3z"/></g>,
  chat: <path d="M4 4h16v12H8l-4 4z"/>,
  settings: <g><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.5a7 7 0 0 0 2-1.2l2.4.9 2-3.4-2-1.6A7 7 0 0 0 19 12z"/></g>,
  calendar: <g><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></g>,
  clock: <g><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></g>,
  loop: <g><polyline points="17 3 21 7 17 11"/><path d="M3 13v-2a4 4 0 0 1 4-4h14"/><polyline points="7 21 3 17 7 13"/><path d="M21 11v2a4 4 0 0 1-4 4H3"/></g>,
  speed: <g><circle cx="12" cy="13" r="8"/><path d="M12 13l4-3"/><path d="M8 3h8"/></g>,
  bookmark: <path d="M6 3h12v18l-6-4-6 4z"/>,
  note: <g><path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4"/></g>,
  bell: <g><path d="M6 9a6 6 0 0 1 12 0v5l2 2H4l2-2z"/><path d="M10 20a2 2 0 0 0 4 0"/></g>,
  pencil: <g><path d="M4 20l4-1 11-11-3-3L5 16z"/><line x1="14" y1="6" x2="17" y2="9"/></g>,
  file: <g><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></g>,
  music: <g><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/></g>,
  frame: <g><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="8" y1="5" x2="8" y2="19"/><line x1="16" y1="5" x2="16" y2="19"/></g>,
  tag: <g><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/></g>,
  download: <g><path d="M12 4v12"/><polyline points="6 10 12 16 18 10"/><path d="M4 20h16"/></g>,
  star: <polygon points="12 3 15 9.5 22 10.3 17 15 18.3 22 12 18.5 5.7 22 7 15 2 10.3 9 9.5"/>,
  sparkle: <g><path d="M12 3v18"/><path d="M3 12h18"/><path d="M5.5 5.5l13 13"/><path d="M18.5 5.5l-13 13"/></g>,
  eye: <g><circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/></g>,
  grid: <g><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></g>,
  list: <g><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></g>,
  filter: <polygon points="3 4 21 4 14 13 14 21 10 19 10 13"/>,
  menu: <g><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></g>,
  warning: <g><path d="M12 4l10 17H2z"/><line x1="12" y1="10" x2="12" y2="15"/><circle cx="12" cy="18" r="0.6" fill="currentColor"/></g>,
  tip: <g><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c1 1 1.5 2 1.5 3.5h5c0-1.5.5-2.5 1.5-3.5A6 6 0 0 0 12 3z"/></g>,
  skip: <g><polygon points="5 4 15 12 5 20"/><line x1="19" y1="5" x2="19" y2="19"/></g>,
  rewind: <g><polygon points="19 20 9 12 19 4"/><line x1="5" y1="5" x2="5" y2="19"/></g>,
};

export function Icon({ name, size = 16, stroke = 1.6, className = "", color }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
