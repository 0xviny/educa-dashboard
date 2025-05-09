"use client";

import { useState, useEffect } from "react";
import { Loader2, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import { BlobProvider, DocumentProps } from "@react-pdf/renderer";
import AdvertenciaPDF from "./advertencia-pdf";

interface PDFViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  advertencia: any;
  assinaturas?: {
    aluno?: string;
    professor?: string;
    direcao?: string;
    responsavel?: string;
  };
  fileName?: string;
}

export function PDFViewerDialog({
  isOpen,
  onClose,
  advertencia,
  assinaturas = {},
  fileName = "advertencia.pdf",
}: PDFViewerDialogProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const pdfDocument = (
    <AdvertenciaPDF
      advertencia={advertencia}
      assinaturaAluno={assinaturas.aluno}
      assinaturaProfessor={assinaturas.professor}
      assinaturaDirecao={assinaturas.direcao}
      assinaturaResponsavel={assinaturas.responsavel}
    />
  ) as React.ReactElement<DocumentProps>;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle>Download de Advertência</DialogTitle>
          <DialogDescription>
            Clique no botão abaixo para baixar o documento de advertência.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-10">
          <FileText className="h-16 w-16 text-primary mb-4" />
          <p className="text-center mb-6">
            O documento de advertência para <strong>{advertencia.aluno}</strong> está pronto para
            download.
          </p>

          <BlobProvider document={pdfDocument}>
            {({ url, loading, error }) => {
              if (loading) {
                return (
                  <Button disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando PDF...
                  </Button>
                );
              }

              if (error || !url) {
                return (
                  <Button variant="destructive" disabled>
                    Erro ao gerar PDF
                  </Button>
                );
              }

              return (
                <a href={url} download={fileName}>
                  <Button
                    size="lg"
                    onClick={() =>
                      toast({
                        title: "Download iniciado",
                        description: "O PDF está sendo baixado para o seu dispositivo.",
                      })
                    }
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Baixar PDF
                  </Button>
                </a>
              );
            }}
          </BlobProvider>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default { PDFViewerDialog };
