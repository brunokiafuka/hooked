export function isSupportedFileExtension(path: string) {
  const validExtensions = [".js", ".ts", ".tsx", ".jsx"];

  const fileExtension = path.slice(path.lastIndexOf("."));

  return validExtensions.includes(fileExtension);
}
