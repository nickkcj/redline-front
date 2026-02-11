"use client"

import * as React from "react"
import { FilePdf, SpinnerGap } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import type { AlertWithRelationsResponse, AlertsSummaryResponse } from "@/lib/api/types/governance.types"

interface ExportReportButtonProps {
  alerts: AlertWithRelationsResponse[]
  summary: AlertsSummaryResponse
  overallScore: number | null
  overallStatus: string | null
  orgName: string
  workspaceName: string
}

export function ExportReportButton({
  alerts,
  summary,
  overallScore,
  overallStatus,
  orgName,
  workspaceName,
}: ExportReportButtonProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)

  const handleExport = async () => {
    setIsGenerating(true)
    try {
      // Dynamic import to avoid SSR issues with @react-pdf/renderer
      const [{ pdf }, { ComplianceReportPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./compliance-report-pdf"),
      ])

      const now = new Date()
      const generatedAt = now.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      const doc = ComplianceReportPDF({
        orgName,
        workspaceName,
        alerts,
        summary,
        overallScore,
        overallStatus,
        generatedAt,
      })

      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-compliance-${now.toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isGenerating || alerts.length === 0}
      className="gap-1.5"
    >
      {isGenerating ? (
        <>
          <SpinnerGap className="h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <FilePdf weight="fill" className="h-4 w-4 text-red-500" />
          Exportar PDF
        </>
      )}
    </Button>
  )
}
