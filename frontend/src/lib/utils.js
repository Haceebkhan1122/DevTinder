export const fullName = (user) => [user?.firstName, user?.lastName].filter(Boolean).join(" ");

export const initials = (user) =>
  [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((name) => name[0].toUpperCase())
    .join("") || "?";

// Backend sets this generic picture when the user has no photo; we show initials instead
export const DEFAULT_PHOTO_URL =
  "https://img.magnific.com/free-vector/user-circles-set_78370-4704.jpg?semt=ais_hybrid&w=740&q=80";

export const hasRealPhoto = (user) => Boolean(user?.photoUrl) && user.photoUrl !== DEFAULT_PHOTO_URL;

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const timeAgo = (date) => {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
};
