import { SUPPORTED_EXTENSIONS } from "../config/constants";

/**
 * Checks if a file has a supported extension (.js, .ts, .tsx, .jsx)
 * @param path - The file path or name to check
 * @returns boolean - True if the file extension is supported, false otherwise
 */
export function isSupportedFileExtension(path: string) {
  const fileExtension = path.slice(path.lastIndexOf("."));

  return SUPPORTED_EXTENSIONS.includes(fileExtension);
}
