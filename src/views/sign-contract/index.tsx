import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Card, Modal, ModalProps, Button } from "antd";
import ContractContent from "../../components/ContractContent";
import SignatureCanvas from "../../components/SignatureCanvas";
import { generatePDF } from "../../utils/pdfGenerator";

const SignContract: React.FC = () => {
  const [signature, setSignature] = useState<string | null>(null);
  const contractRef = React.useRef<{ contractBoxRef: HTMLDivElement }>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLogding] = useState(false);

  const onSignatureConfirm = useCallback((signatureImage: string | null) => {
    setSignature(signatureImage);
    setOpen(false);
  }, []);

  debugger;
  // const contractDom = contractRef.current?.contractBoxRef as HTMLDivElement;
  const handleSubmit = useCallback(async () => {
    if (!signature) {
      alert("请先签名");
      return;
    }

    try {
      const pdf = await generatePDF({
        contractDom: contractRef.current?.contractBoxRef as HTMLDivElement,
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

  const onCancel = () => {
    setOpen(false);
  };

  return (
    <div className="container w-full h-full flex flex-col mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">合同签署</h1>
      <Card className="flex-grow overflow-auto">
        <div className="flex flex-col items-center mb-4">
          <ContractContent signature={signature} ref={contractRef} />
        </div>
        {/* <SignatureCanvas onSignatureChange={handleSignatureChange} /> */}
      </Card>
      <div className="w-full flex flex-end justify-end">
        <Button onClick={() => setOpen(true)} className="mr-3">
          签名
        </Button>
        <Button type="primary" onClick={handleSubmit}>
          提交
        </Button>
      </div>
      <SignModal
        onSignatureConfirm={onSignatureConfirm}
        open={open}
        loading={loading}
        onCancel={onCancel}
      ></SignModal>
    </div>
  );
};

interface SignModalProps
  extends Omit<ModalProps, "open" | "onOk" | "onCancel"> {
  onSignatureConfirm: (signature: string | null) => void;
  open: boolean;
  loading: boolean;
  onOk?: (value?: any) => Promise<void>;
  onCancel?: () => void;
}
const SignModal = (props: SignModalProps) => {
  return (
    <Modal
      title="签署合同"
      open={props.open}
      onCancel={props.onCancel}
      confirmLoading={props.loading}
      footer={null}
      width={"480px"}
    >
      <SignatureCanvas onSignatureConfirm={props.onSignatureConfirm} />
    </Modal>
  );
};

export default SignContract;
