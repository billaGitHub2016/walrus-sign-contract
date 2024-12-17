import React, { forwardRef, useImperativeHandle } from "react";

interface ContractContentProps {
  signature: string | null;
}

const ContractContent = forwardRef(({signature}: ContractContentProps, refInstance) => {
    const contractBoxRef = React.useRef<HTMLDivElement>(null);
    useImperativeHandle(refInstance, () => ({ contractBoxRef: contractBoxRef.current }));
    
    return (
        <div className="full-width h-full p-4 overflow-y-auto" ref={contractBoxRef}>
          <div className="text-center w-full mb-4">
            <h2 className="text-2xl font-bold mb-4">xxx合同</h2>
          </div>
          <p>这是一份示例合同，用于演示合同签署流程。</p>
          <p>
            <strong>加粗</strong>
            <em>斜体</em>
          </p>
          <ul>
            <li>第一点</li>
            <li>第二点</li>
            <li>第三点</li>
          </ul>
          <p className="h-28 w-64 relative">
            <span className="absolute bottom-0 left-0">合同签署人：_______________________</span>
            {signature && <img src={signature} className="absolute h-20 bottom-0 right-4"></img>}
          </p>
          <div className="h-52"></div>
        </div>
      );
});

export default ContractContent;
function useRef<T>(arg0: null) {
    throw new Error("Function not implemented.");
}

