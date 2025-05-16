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
