import React, { useRef, useState, useCallback } from "react";
import { Button } from "antd";

interface SignatureCanvasProps {
  onSignatureChange: (signatureImage: string) => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  }, []);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureImage = canvas.toDataURL();
      onSignatureChange(signatureImage);
    }
  }, [onSignatureChange]);

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000";

        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      }
    },
    [isDrawing]
  );

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
      onSignatureChange("");
    }
  }, [onSignatureChange]);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">手写签名：</h3>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        className="border border-gray-300"
      />
      <Button onClick={clearSignature} className="mt-2">
        清除签名
      </Button>
    </div>
  );
};

export default SignatureCanvas;
