export async function fetchPdfAsBase64(pdfUrl: string): Promise<string> {
  const response = await fetch(pdfUrl);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result?.toString().split(',')[1]; // Strip data URL prefix
      if (base64String) resolve(base64String);
      else reject("Failed to convert PDF to base64");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob); // will produce "data:application/pdf;base64,..."
  });
}
