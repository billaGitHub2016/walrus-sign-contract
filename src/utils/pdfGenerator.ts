import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export const generatePDF = async ({
    contractDom,
}: {
    contractDom: HTMLElement
}): Promise<jsPDF> => {
    //   const content = document.querySelector('.container') as HTMLElement;
    const content = contractDom;
    if (!content) throw new Error('无法找到合同内容');

    const scale = 2;
    const containerWidth = content.offsetWidth;
    const containerHeight = content.offsetHeight;

    const canvas = await html2canvas(content, {
        scale: scale,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const contentWidth = containerWidth * scale;
    const contentHeight = containerHeight * scale;

    const pdfWidth = A4_WIDTH_MM;
    const pdfHeight = (contentHeight * pdfWidth) / contentWidth;

    let position = 0;
    while (position < contentHeight) {
        const canvasSlice = document.createElement('canvas');
        const sliceContext = canvasSlice.getContext('2d');

        canvasSlice.width = contentWidth;
        canvasSlice.height = Math.min(pdfHeight * (contentWidth / pdfWidth), contentHeight - position);

        sliceContext?.drawImage(
            canvas,
            0,
            position,
            contentWidth,
            canvasSlice.height,
            0,
            0,
            contentWidth,
            canvasSlice.height
        );

        const imgData = canvasSlice.toDataURL('image/jpeg', 1.0);

        if (position > 0) {
            pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        position += canvasSlice.height;
    }

    //   // 添加签名到最后一页
    //   const signatureImg = new Image();
    //   signatureImg.src = signature;
    //   pdf.addImage(signatureImg, 'PNG', 10, A4_HEIGHT_MM - 50, 50, 25, undefined, 'FAST');

    return pdf;
};

