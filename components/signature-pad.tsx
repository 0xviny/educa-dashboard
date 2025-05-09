// components/signature-pad.tsx
"use client";

import React, { forwardRef, useRef, useState, useEffect, useImperativeHandle } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Undo2, Check } from "lucide-react";

export interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  height?: number;
  width?: number;
  isConfirmed?: boolean;
}

export interface SignaturePadRef {
  clear: () => void;
  getDataURL: (type?: string, encoderOptions?: number) => string | undefined;
  isEmpty: () => boolean;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onSave, height = 200, width = 500, isConfirmed = false }, ref) => {
    const signatureRef = useRef<SignatureCanvas>(null);
    const [empty, setEmpty] = useState(true);
    const [confirmed, setConfirmed] = useState(isConfirmed);

    useEffect(() => {
      setConfirmed(isConfirmed);
    }, [isConfirmed]);

    // Expor métodos via ref
    useImperativeHandle(
      ref,
      () => ({
        clear: () => {
          signatureRef.current?.clear();
          setEmpty(true);
          setConfirmed(false);
        },
        getDataURL: (type?: string, encoderOptions?: number) => {
          return signatureRef.current?.toDataURL(type, encoderOptions);
        },
        isEmpty: () => {
          return signatureRef.current?.isEmpty() ?? true;
        },
      }),
      []
    );

    const handleClear = () => {
      signatureRef.current?.clear();
      setEmpty(true);
      setConfirmed(false);
    };

    const handleSave = () => {
      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        const dataUrl = signatureRef.current.toDataURL("image/png");
        onSave(dataUrl);
        setConfirmed(true);
      }
    };

    const handleBegin = () => {
      setEmpty(false);
      setConfirmed(false);
    };

    return (
      <div className="flex flex-col space-y-2">
        <div
          className={`border rounded-md overflow-hidden ${
            confirmed ? "border-green-500 bg-green-50" : "border-gray-200"
          }`}
        >
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: "signature-canvas",
              width,
              height,
              style: {
                width: "100%",
                height: `${height}px`,
                backgroundColor: confirmed ? "#f0fdf4" : "#fff",
              },
            }}
            onBegin={handleBegin}
          />
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" size="sm" onClick={handleClear}>
            <Undo2 className="mr-2 h-4 w-4" />
            Limpar
          </Button>
          <Button
            type="button"
            variant={confirmed ? "outline" : "default"}
            size="sm"
            onClick={handleSave}
            disabled={empty || confirmed}
            className={
              confirmed ? "border-green-500 text-green-600" : "bg-purple-600 hover:bg-purple-700"
            }
          >
            <Check className={`mr-2 h-4 w-4 ${confirmed ? "text-green-600" : ""}`} />
            {confirmed ? "Assinatura Confirmada" : "Confirmar Assinatura"}
          </Button>
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";
