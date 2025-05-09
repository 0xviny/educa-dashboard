"use client"

import type React from "react"
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer"

// Registrar fontes
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf", // Regular 400
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1Mu51xIIzc.ttf", // Italic 400
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf", // Bold 700
      fontWeight: 700,
    },
  ],
})


// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#112233",
    paddingBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  schoolName: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 4,
  },
  schoolAddress: {
    fontSize: 9,
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    marginVertical: 15,
    textDecoration: "underline",
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  fieldLabel: {
    width: 80,
    fontWeight: 700,
  },
  fieldValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 2,
    minHeight: 16,
  },
  complaintSection: {
    marginTop: 20,
  },
  complaintHeader: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
  },
  complaintNumber: {
    width: 30,
    padding: 5,
    fontWeight: 700,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  complaintContent: {
    flex: 1,
    padding: 5,
  },
  signatureSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 5,
  },
  signatureLabel: {
    fontSize: 10,
    textAlign: "center",
  },
  signatureImage: {
    height: 50,
    marginHorizontal: "auto",
    marginVertical: 10,
    objectFit: "contain",
  },
  observation: {
    marginTop: 30,
    fontSize: 10,
    fontStyle: "italic",
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#666",
  },
})

// Tipagem explícita para o retorno do componente AdvertenciaPDF
import type { DocumentProps } from "@react-pdf/renderer"

interface AdvertenciaPDFProps {
  advertencia: {
    id: string
    alunoId: string
    aluno?: string
    turma?: string
    data: string
    motivo: string
    status: string
    professor: string
    detalhes?: string
    numero?: number
  }
  assinaturaAluno?: string
  assinaturaProfessor?: string
  assinaturaResponsavel?: string
  assinaturaDirecao?: string
  escolaNome?: string
  escolaEndereco?: string
  escolaTelefone?: string
  escolaEmail?: string
  logoUrl?: string
}

// Alterando a tipagem para garantir que retorna ReactElement<DocumentProps>
const AdvertenciaPDF = ({
  advertencia,
  assinaturaAluno,
  assinaturaProfessor,
  assinaturaDirecao,
  escolaNome = "E.E. PROFESSOR ÁLVARO ORTIZ",
  escolaEndereco = "Rua André Cursino dos Santos s/n - Bairro do São Gonçalo",
  escolaTelefone = "(12) 3621-1011",
  escolaEmail = "e011908a@educacao.sp.gov.br",
  logoUrl = "/placeholder.svg?height=200&width=200",
}: AdvertenciaPDFProps): React.ReactElement<DocumentProps> => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Image src={logoUrl || "/placeholder.svg"} style={styles.logo} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>GOVERNO DO ESTADO DE SÃO PAULO</Text>
          <Text style={styles.headerSubtitle}>SECRETARIA DE ESTADO DA EDUCAÇÃO</Text>
          <Text style={styles.headerSubtitle}>DIRETORIA DE ENSINO - REGIÃO DE TAUBATÉ</Text>
          <Text style={styles.schoolName}>{escolaNome}</Text>
          <Text style={styles.schoolAddress}>{escolaEndereco}</Text>
          <Text style={styles.schoolAddress}>Taubaté - SP - CEP 12092-090 - Tel: {escolaTelefone}</Text>
        </View>
      </View>

      {/* Título do documento */}
      <Text style={styles.title}>Ficha Individual do Aluno - Reclamação</Text>

      {/* Dados do Aluno */}
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Nome:</Text>
        <Text style={styles.fieldValue}>{advertencia.aluno}</Text>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>nº:</Text>
        <Text style={styles.fieldValue}>{advertencia.id.substring(0, 6)}</Text>
        <Text style={[styles.fieldLabel, { marginLeft: 20 }]}>Série:</Text>
        <Text style={[styles.fieldValue, { flex: 2 }]}>{advertencia.turma}</Text>
      </View>

      {/* Seções de Reclamação */}
      <View style={styles.complaintSection}>
        <View style={styles.complaintHeader}>
          <Text style={styles.complaintNumber}>1ª</Text>
          <View style={styles.complaintContent}>
            <Text>{advertencia.motivo}</Text>
            {advertencia.detalhes && <Text style={{ fontSize: 10, marginTop: 5 }}>{advertencia.detalhes}</Text>}
            <Text style={{ fontSize: 9, marginTop: 5 }}>Data: {new Date(advertencia.data).toLocaleDateString()}</Text>

            {assinaturaProfessor && (
              <>
                <Text style={{ fontSize: 9, marginTop: 10 }}>Assinatura do Professor:</Text>
                <Image src={assinaturaProfessor || "/placeholder.svg"} style={styles.signatureImage} />
              </>
            )}
          </View>
        </View>

        <View style={styles.complaintHeader}>
          <Text style={styles.complaintNumber}>2ª</Text>
          <View style={styles.complaintContent}>
            <Text style={{ color: "#888" }}>Aguardando registro...</Text>
          </View>
        </View>

        <View style={styles.complaintHeader}>
          <Text style={styles.complaintNumber}>3ª</Text>
          <View style={styles.complaintContent}>
            <Text style={{ color: "#888" }}>Aguardando registro...</Text>
          </View>
        </View>
      </View>

      {/* Observação */}
      <View style={styles.observation}>
        <Text>
          Obs: Após a terceira reclamação, aluno será informado que só virá a escola acompanhado do pai ou responsável,
          para que tome ciência sobre seu comportamento.
        </Text>
      </View>

      {/* Assinatura da Direção */}
      <View style={styles.signatureSection}>
        <Text style={{ fontSize: 10, marginTop: 30, textAlign: "center" }}>
          Assinatura Responsável por falar com o pai ou responsável
        </Text>
        {assinaturaDirecao && (
          <Image src={assinaturaDirecao || "/placeholder.svg"} style={[styles.signatureImage, { marginTop: 20 }]} />
        )}
      </View>

      {/* Rodapé */}
      <Text style={styles.footer}>
        Documento gerado em {new Date().toLocaleDateString()} às{" "}
        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </Page>
  </Document>
)

export default AdvertenciaPDF
