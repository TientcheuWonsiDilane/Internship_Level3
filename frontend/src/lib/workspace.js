export const idOf = (value) => {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || value.id || "");
  return String(value);
};

export const asList = (res, ...keys) => {
  if (Array.isArray(res)) return res;
  for (const key of keys) {
    if (Array.isArray(res?.[key])) return res[key];
  }
  if (Array.isArray(res?.message)) return res.message;
  return [];
};

export const asItem = (res, ...keys) => {
  for (const key of keys) {
    const value = res?.[key];
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
  }
  if (res?.message && typeof res.message === "object" && !Array.isArray(res.message)) {
    return res.message;
  }
  return res && typeof res === "object" ? res : null;
};

export const initialsOf = (name) =>
  String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

export const roleLabel = (role) => {
  if (role === "team_head") return "Team Head";
  if (role === "developer") return "Developer";
  return role ? String(role).replace(/_/g, " ") : "Member";
};

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
