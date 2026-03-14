/**
 * Type guard to check if a value is a non-null object
 */
export function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Type guard to check if a value is a string or undefined
 */
export function isStringOrUndefined(v: unknown): v is string | undefined {
  return v === undefined || typeof v === "string";
}

/**
 * Check if current time falls within optional start/end ISO date strings
 */
export function passesTimeWindow(
  startsAt: string | undefined,
  endsAt: string | undefined
): boolean {
  const now = new Date();

  if (startsAt) {
    const startDate = new Date(startsAt);
    if (isNaN(startDate.getTime()) || now < startDate) {
      return false;
    }
  }

  if (endsAt) {
    const endDate = new Date(endsAt);
    if (isNaN(endDate.getTime()) || now > endDate) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a path matches include/exclude rules
 */
export function passesPathRules(
  includePaths: string[] | undefined,
  excludePaths: string[] | undefined,
  currentPath: string
): boolean {
  // If exclude paths are specified, current path must not match any
  if (excludePaths && excludePaths.length > 0) {
    if (excludePaths.some((pattern) => matchesPathPattern(currentPath, pattern))) {
      return false;
    }
  }

  // If include paths are specified, current path must match at least one
  if (includePaths && includePaths.length > 0) {
    return includePaths.some((pattern) => matchesPathPattern(currentPath, pattern));
  }

  // If no include paths specified, pass by default (unless excluded above)
  return true;
}

/**
 * Check if a path matches a pattern (supports wildcards)
 */
function matchesPathPattern(path: string, pattern: string): boolean {
  // Convert glob-style pattern to regex
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape regex special chars
    .replace(/\*/g, ".*") // * matches any characters
    .replace(/\?/g, "."); // ? matches single character

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * Validate a bilingual block with required and optional fields
 */
export function validateBilingualBlock(
  translations: unknown,
  requiredFields: string[],
  optionalFields: string[]
): boolean {
  if (!isObject(translations)) {
    return false;
  }

  // Check for required language keys
  if (!isObject(translations.es) || !isObject(translations.en)) {
    return false;
  }

  const es = translations.es as Record<string, unknown>;
  const en = translations.en as Record<string, unknown>;

  // Validate required fields exist and are strings
  for (const field of requiredFields) {
    if (typeof es[field] !== "string" || typeof en[field] !== "string") {
      return false;
    }
  }

  // Validate optional fields are strings if present
  for (const field of optionalFields) {
    if (field in es && typeof es[field] !== "string") {
      return false;
    }
    if (field in en && typeof en[field] !== "string") {
      return false;
    }
  }

  return true;
}

/**
 * Validate that a value is undefined or a string array
 */
export function validateOptionalPathList(v: unknown): boolean {
  if (v === undefined) {
    return true;
  }

  if (!Array.isArray(v)) {
    return false;
  }

  return v.every((item) => typeof item === "string");
}
