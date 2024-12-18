import React, { useState, useCallback } from 'react';
import { Card, message } from 'antd';
import ContractContent from '../../components/ContractContent';
import SignatureCanvas from '../../components/SignatureCanvas';
import { generatePDF } from '../../utils/pdfGenerator';
import { useCurrentAccount } from '@mysten/dapp-kit';
const basePublisherUrl = 'https://publisher.walrus-testnet.walrus.space'
const baseAggregatorUrl = 'https://aggregator.walrus-testnet.walrus.space'

const SignContract: React.FC = () => {
    const [signature, setSignature] = useState<string | null>(null);
    const contractRef = React.useRef<{ contractBoxRef: HTMLDivElement }>(null);
    debugger
    const account = useCurrentAccount();

    const handleSignatureChange = useCallback((signatureImage: string) => {
        setSignature(signatureImage);
    }, []);

    const contractDom = contractRef.current?.contractBoxRef as HTMLDivElement;
    const handleSubmit = useCallback(async () => {
        if (!signature) {
            alert('请先签名');
            return;
        }

        try {
            const pdf = await generatePDF({
                contractDom,
            });
            const pdfBlob = new Blob([pdf.output('blob')], {
                type: 'application/pdf',
            });
            // const link = document.createElement('a');
            // link.href = URL.createObjectURL(pdfBlob);
            // link.download = 'signed_contract.pdf';
            // link.click();
            const pdfFile = new File([pdfBlob], `签署合同_${new Date().toISOString()}}.pdf`, { type: 'application/pdf' });
            storeBlob(pdfFile).then(() => {

            }).catch(err => {
                console.error(err);
            })
        } catch (error) {
            console.error('生成PDF时出错:', error);
            // alert('生成PDF时出错，请重试');
        }
    }, [signature]);

    /**
     * Stores the file from the HTML form on Walrus.
     */
    const storeBlob = (file: any) => {
        if (!account) {
            message.warning('请先连接钱包')
            return Promise.reject('请先连接钱包');
        }
        const numEpochs = 7;

        // Submit a PUT request with the file's content as the body to the /v1/store endpoint.
        const sendToParam = `&send_object_to=${account.address}`;
        return fetch(`${basePublisherUrl}/v1/store?epochs=${numEpochs}${sendToParam}`, {
            method: 'PUT',
            body: file,
        }).then(response => {
            if (response.status === 200) {
                // Parse successful responses as JSON, and return it along with the
                // mime type from the the file input element.
                return response.json().then(info => {
                    console.log(info);
                    return { info: info, media_type: file.type };
                });
            } else {
                throw new Error('保存文件失败');
            }
        });
    }

    const blobUrl = `${baseAggregatorUrl}/v1/JSQY98zZkSqZ9pLqjNYTDCREbzohf6ExNosL1bn340w`;

    return (
        <div className='container w-full mx-auto p-4'>
            <h1 className='text-2xl font-bold mb-4'>合同签署</h1>
            <div className='flex flex-col items-center mb-4'>
                <ContractContent signature={signature} ref={contractRef} />
            </div>
            <SignatureCanvas onSignatureChange={handleSignatureChange} />
            <button
                onClick={handleSubmit}
                className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            >
                提交并下载PDF
            </button>

            <a href="${blobUrl}"></a>
        </div>
    );
};

export default SignContract;
