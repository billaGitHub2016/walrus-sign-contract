import React, { useState, useCallback } from "react";
import ContractContent from "../../components/ContractContent";
import SignatureCanvas from "../../components/SignatureCanvas";
import { generatePDF } from "../../utils/pdfGenerator";

const SignContract: React.FC = () => {
  const [signature, setSignature] = useState<string | null>(null);
  const contractRef = React.useRef<{ contractBoxRef: HTMLDivElement }>(null);

  const handleSignatureChange = useCallback((signatureImage: string) => {
    setSignature(signatureImage);
  }, []);

  debugger
  const contractDom = contractRef.current?.contractBoxRef as HTMLDivElement
  const handleSubmit = useCallback(async () => {
    if (!signature) {
      alert("请先签名");
      return;
    }

    try {
      const pdf = await generatePDF({
        contractDom,
      });
      const pdfBlob = new Blob([pdf.output("blob")], {
        type: "application/pdf",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = "signed_contract.pdf";
      link.click();
    } catch (error) {
      console.error("生成PDF时出错:", error);
      alert("生成PDF时出错，请重试");
    }
  }, [signature]);

  return (
    <div className="container w-full mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">合同签署</h1>
      <div className="flex flex-col items-center mb-4">
        <ContractContent signature={signature} ref={contractRef} />
      </div>
      <SignatureCanvas onSignatureChange={handleSignatureChange} />
      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        提交并下载PDF
      </button>
    </div>
  );
};

export default SignContract;
