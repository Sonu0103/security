/**
 * Sanitizes user input by removing potentially dangerous characters and HTML tags
 * @param {string} input - The input string to sanitize
 * @returns {string} The sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== "string") return "";

  // Remove HTML tags
  const withoutTags = input.replace(/<[^>]*>/g, "");

  // Remove special characters that could be used for XSS
  const sanitized = withoutTags
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();

  return sanitized;
};
