/**
 * Format ISO date string to "Jan 2025" format
 * @param dateString - ISO date string (e.g., "2025-01-01T00:00:00.000Z")
 * @returns Formatted date string (e.g., "Jan 2025")
 */
export const formatPublicationDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

/**
 * Format ISO date string to full date format "January 1, 2025"
 * @param dateString - ISO date string
 * @returns Formatted full date string
 */
export const formatFullDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

/**
 * Format ISO date string to short date format "Jan 1"
 * @param dateString - ISO date string
 * @returns Formatted short date string
 */
export const formatShortDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
