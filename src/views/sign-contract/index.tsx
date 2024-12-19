import React, {
    useState,
    useCallback
} from "react";
import { Card, Modal, ModalProps, Button, message } from "antd";
import ContractContent from "../../components/ContractContent";
import SignatureCanvas from "../../components/SignatureCanvas";
import { generatePDF } from "../../utils/pdfGenerator";
import {
    useCurrentAccount,
    useSignAndExecuteTransaction,
    useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const basePublisherUrl = "https://publisher.walrus-testnet.walrus.space";
export const baseAggregatorUrl = "https://aggregator.walrus-testnet.walrus.space";
export const packageId =
    "0x2becf080a4d6db051568251d0c4fee5bbd5fd16578064199c8f320fe56d37177";
const mintedRecordsId =
    "0x9939005e3c795003f83f0e8427f94811babe32be46788facab0c25c8231b5f1a";

const SignContract: React.FC = () => {
    const [signature, setSignature] = useState<string | null>(null);
    const contractRef = React.useRef<{ contractBoxRef: HTMLDivElement }>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLogding] = useState(false);

    const account = useCurrentAccount();
    const suiClient = useSuiClient();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction({
        execute: async ({ bytes, signature }) =>
            await suiClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    // Raw effects are required so the effects can be reported back to the wallet
                    showRawEffects: true,
                    showEffects: true,
                    showEvents: true,
                },
            }),
    });

    const onSignatureConfirm = useCallback((signatureImage: string | null) => {
        setSignature(signatureImage);
        setOpen(false);
    }, []);

    // const contractDom = contractRef.current?.contractBoxRef as HTMLDivElement;
    const handleSubmit = useCallback(async () => {
        if (!signature) {
            message.warning("请先签名");
            return;
        }
        if (!account) {
            message.warning("请先连接钱包");
            return;
        }

        try {
            setLogding(true);
            const pdf = await generatePDF({
                contractDom: contractRef.current?.contractBoxRef as HTMLDivElement,
            });
            const pdfBlob = new Blob([pdf.output("blob")], {
                type: "application/pdf",
            });
            const fileName = `签署合同_${new Date().toISOString()}.pdf`;
            const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });
            // const link = document.createElement("a");
            // link.href = URL.createObjectURL(pdfBlob);
            // link.download = "signed_contract.pdf";
            // link.click();
            const blobInfo = await storeBlob(pdfFile);
            console.log("blobInfo = ", blobInfo);
            let info: any = {
                name: fileName,
                imgUrl: "https://avatars.githubusercontent.com/u/9780825?v=4",
            };
            if ("alreadyCertified" in blobInfo.info) {
                info = {
                    ...info,
                    blob_id: blobInfo.info.alreadyCertified.blobObject.blobId,
                    end_epoch: blobInfo.info.alreadyCertified.blobObject.storage.endEpoch,
                    start_epoch: blobInfo.info.alreadyCertified.blobObject.storage.startEpoch,
                };
            } else if ("newlyCreated" in blobInfo.info) {
                info = {
                    ...info,
                    blob_id: blobInfo.info.newlyCreated.blobObject.blobId,
                    end_epoch: blobInfo.info.newlyCreated.blobObject.storage.endEpoch,
                    start_epoch: blobInfo.info.newlyCreated.blobObject.storage.startEpoch,
                };
            } else {
                throw Error("保存合同失败");
            }
            await mintNft(info);
            message.success("合同提交成功");
        } catch (error: any) {
            console.error("提交失败:", error);
            // alert("生成PDF时出错，请重试");
            message.error(error.message);
        } finally {
            setLogding(false);
        }
    }, [signature, account]);

    const storeBlob = (file: any): Promise<any> => {
        if (!account) {
            message.warning("请先连接钱包");
            return Promise.reject("请先连接钱包");
        }
        const numEpochs = 7;

        // Submit a PUT request with the file's content as the body to the /v1/store endpoint.
        const sendToParam = `&send_object_to=${account.address}`;
        return fetch(
            `${basePublisherUrl}/v1/store?epochs=${numEpochs}${sendToParam}`,
            {
                method: "PUT",
                body: file,
            }
        ).then((response) => {
            if (response.status === 200) {
                // Parse successful responses as JSON, and return it along with the
                // mime type from the the file input element.
                return response.json().then((info) => {
                    console.log(info);
                    return { info: info, media_type: file.type };
                });
            } else {
                throw new Error("保存文件失败");
            }
        });
    };

    const mintNft = ({
        name,
        imgUrl,
        blob_id,
        start_epoch,
        end_epoch,
    }: {
        name: string;
        imgUrl: string;
        blob_id: string;
        start_epoch: string;
        end_epoch: string;
    }) => {
        return new Promise((resolve, reject) => {
            const txb = new Transaction();

            txb.setGasBudget(100000000);

            txb.moveCall({
                target: `${packageId}::c_nft::mint`,
                arguments: [
                    txb.object(mintedRecordsId),
                    txb.pure.string(name),
                    txb.pure.string(imgUrl),
                    txb.pure.address(account?.address as string),
                    txb.pure.string(blob_id),
                    txb.pure.u64(start_epoch),
                    txb.pure.u64(end_epoch),
                    txb.object("0x6"),
                ],
                typeArguments: [],
            });

            signAndExecute(
                {
                    transaction: txb,
                },
                {
                    onSuccess: async (data) => {
                        console.log("transaction digest: " + JSON.stringify(data));
                        if (data.effects?.status.status === "success") {
                            resolve(data);
                        } else {
                            reject(new Error("铸造NFT失败，请稍后重试"));
                        }
                    },
                    onError: (err) => {
                        console.log("transaction error: " + err);
                        reject(new Error(`铸造NFT失败:${err.message}，请稍后重试`));
                    },
                }
            );
        });
    };

    const onCancel = () => {
        setOpen(false);
    };

    return (
        <div className="container w-full h- flex flex-col mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">合同签署</h1>
            <Card className="flex-grow overflow-auto">
                <div className="flex flex-col items-center mb-4">
                    <ContractContent signature={signature} ref={contractRef} />
                </div>
                {/* <SignatureCanvas onSignatureChange={handleSignatureChange} /> */}
            </Card>
            <div className="w-full flex flex-end justify-end">
                <Button onClick={() => setOpen(true)} className="mr-3" disabled={loading}>
                    签名
                </Button>
                <Button type="primary" onClick={handleSubmit} loading={loading}>
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
