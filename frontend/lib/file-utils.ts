export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read file as data URL."));
      }
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Unable to read file."));
    };

    reader.readAsDataURL(file);
  });
