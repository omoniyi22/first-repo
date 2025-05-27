import { jsPDF } from "jspdf";

// Convert image (URL/base64) to Base64-encoded PDF
export async function imageToBase64PDF(imageSrc) {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imageSrc;

  return new Promise((resolve) => {
    img.onload = () => {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (img.height * pageWidth) / img.width;

      pdf.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

      // Get Base64 PDF (Data URI string)
      const temp = pdf.output('datauristring'); // starts with "data:application/pdf;base64,..."
        const base64PDF = temp.split(',')[1]; 
      resolve(base64PDF);
    };
  });
}


export const convertImagesToPDF = async (imageFiles: File[]): Promise<Blob> => {
  const pdf = new jsPDF();
  
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    
    // Create a URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    // Load the image
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = imageUrl;
    });
    
    // Add new page for all images except the first one
    if (i > 0) {
      pdf.addPage();
    }
    
    // Calculate dimensions to fit the page
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgRatio = img.height / img.width;
    
    let imgWidth = pageWidth;
    let imgHeight = imgWidth * imgRatio;
    
    // If image is too tall, scale by height instead
    if (imgHeight > pageHeight) {
      imgHeight = pageHeight;
      imgWidth = imgHeight / imgRatio;
    }
    
    // Center the image on the page
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    
    pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
    
    // Clean up the URL
    URL.revokeObjectURL(imageUrl);
  }
  
  // Return the PDF as a blob
  return pdf.output('blob');
};