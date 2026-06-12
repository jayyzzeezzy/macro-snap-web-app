// Read a File (camera capture or upload) into the base64 payload the API expects.
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      // dataUrl looks like "data:image/jpeg;base64,XXXX" — strip the prefix.
      const base64 = dataUrl.split(',')[1] ?? ''
      resolve({ base64, mimeType: file.type, dataUrl })
    }
    reader.onerror = () => reject(new Error('Could not read the selected image.'))
    reader.readAsDataURL(file)
  })
}
