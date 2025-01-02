export function isSupportedFileExtension(path: string | undefined) {
  const validExtensions = ['.js', '.ts', '.tsx'];

  if (path === undefined) {
    return false;
  }

  const fileExtension = path.slice(path.lastIndexOf('.'));

  return validExtensions.includes(fileExtension);
}
