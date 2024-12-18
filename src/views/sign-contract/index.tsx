import React, { useState, useCallback, useEffect } from 'react';
import { Card, message } from 'antd';
import ContractContent from '../../components/ContractContent';
import SignatureCanvas from '../../components/SignatureCanvas';
import { generatePDF } from '../../utils/pdfGenerator';
import {
    useCurrentAccount,
    useSignAndExecuteTransaction,
    useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from '@mysten/sui/transactions';
import { SuiObjectResponse } from '@mysten/sui/client';

const basePublisherUrl = 'https://publisher.walrus-testnet.walrus.space'
const baseAggregatorUrl = 'https://aggregator.walrus-testnet.walrus.space'

const packageId = '0xcf280c19a379c971f27aaf653471b4fdf1a1544ac5741b6814e4327cc03a9fd6'
const mintedRecordsId = '0x0db6151e9f0014fb77fae0b8006211b8f7964355842c94725e86abfa477dc688'

const SignContract: React.FC = () => {
    const [signature, setSignature] = useState<string | null>(null);
    const contractRef = React.useRef<{ contractBoxRef: HTMLDivElement }>(null);

    debugger
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
                mintNft()
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
        debugger
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

    const mintNft = () => {
        const txb = new Transaction();

        txb.setGasBudget(100000000);

        txb.moveCall({
            target: `${packageId}::c_nft::mint`,
            arguments: [
                txb.object(mintedRecordsId),
                txb.pure.string("合约"),
                txb.pure.string("https://avatars.githubusercontent.com/u/9780825?v=4"),
                txb.pure.address(account?.address as string),
                txb.pure.string("JSQY98zZkSqZ9pLqjNYTDCREbzohf6ExNosL1bn340w"),
                txb.pure.u64(1),
                txb.pure.u64(8),
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
                },
                onError: (err) => {
                    console.log("transaction error: " + err);
                },
            }
        );
    }

    const getAllNfts = async () => {
        let hasNextPage = true;
        let nextCursor: string | null = null;
        let allObjects: SuiObjectResponse[] = [];
        while (hasNextPage) {
            const response = await suiClient.getOwnedObjects({
                owner: account?.address as string,
                options: {
                    showContent: true,
                    showDisplay: true,
                    showType: true,
                },
                cursor: nextCursor,
                filter: {
                    StructType: `${packageId}::c_nft::CNFT`,
                },
            });

            allObjects = allObjects.concat(response.data);
            console.log('object res = ', response);
            hasNextPage = response.hasNextPage;
            nextCursor = response.nextCursor ?? null;
        }
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

            <button onClick={getAllNfts}>nft</button>

            <a href="${blobUrl}"></a>
        </div>
    );
};

export default SignContract;
