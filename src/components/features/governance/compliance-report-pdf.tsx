"use client"

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"
import type { AlertWithRelationsResponse, AlertsSummaryResponse } from "@/lib/api/types/governance.types"

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1f2937" },
  cover: { flex: 1, justifyContent: "center", alignItems: "center" },
  coverTitleRed: { fontSize: 28, fontFamily: "Helvetica-Bold", color: "#dc2626" },
  coverTitleBlack: { fontSize: 28, fontFamily: "Helvetica-Bold", color: "#111827" },
  coverSubtitle: { fontSize: 16, color: "#6b7280", marginBottom: 40, marginTop: 8 },
  coverOrg: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  coverWorkspace: { fontSize: 12, color: "#6b7280", marginBottom: 20 },
  coverDate: { fontSize: 11, color: "#9ca3af" },
  sectionTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 12, color: "#111827", borderBottomWidth: 2, borderBottomColor: "#dc2626", paddingBottom: 4 },
  summaryGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  summaryCard: { flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 6, padding: 12, alignItems: "center" },
  summaryValue: { fontSize: 24, fontFamily: "Helvetica-Bold" },
  summaryLabel: { fontSize: 8, color: "#6b7280", marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginTop: 8 },
  statusText: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  artifactHeader: { backgroundColor: "#f9fafb", padding: 10, borderRadius: 4, marginBottom: 6, marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  artifactTitle: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  artifactStats: { flexDirection: "row", gap: 8 },
  statChip: { fontSize: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f9fafb", paddingVertical: 6, paddingHorizontal: 4, gap: 8, borderBottomWidth: 2, borderBottomColor: "#e5e7eb", marginBottom: 2 },
  tableHeaderText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase" },
  violationRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingVertical: 6, gap: 8 },
  violationIndex: { width: 24, fontSize: 9, color: "#9ca3af", textAlign: "right", paddingTop: 1 },
  violationSeverity: { width: 60, paddingTop: 1 },
  severityBadge: { fontSize: 7, fontFamily: "Helvetica-Bold", paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3, textAlign: "center" },
  violationContent: { flex: 1 },
  violationTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  violationDesc: { fontSize: 8, color: "#4b5563", lineHeight: 1.4 },
  violationAction: { fontSize: 8, color: "#059669", marginTop: 3, fontStyle: "italic" },
  violationStatus: { width: 65, paddingTop: 1 },
  statusSmall: { fontSize: 7, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3, textAlign: "center" },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#9ca3af" },
})

interface ComplianceReportProps {
  orgName: string
  workspaceName: string
  alerts: AlertWithRelationsResponse[]
  summary: AlertsSummaryResponse
  overallScore: number | null
  overallStatus: string | null
  generatedAt: string
}

function sevColor(s: string) {
  if (s === "CRITICAL") return { bg: "#fef2f2", text: "#dc2626" }
  if (s === "WARNING") return { bg: "#fffbeb", text: "#d97706" }
  return { bg: "#eff6ff", text: "#2563eb" }
}

function sevLabel(s: string) {
  if (s === "CRITICAL") return "CR\u00CDTICA"
  if (s === "WARNING") return "ALERTA"
  return "INFO"
}

function statusColor(s: string) {
  if (s === "RESOLVED") return { bg: "#f0fdf4", text: "#16a34a" }
  if (s === "FALSE_POSITIVE") return { bg: "#f9fafb", text: "#6b7280" }
  if (s === "ACKNOWLEDGED") return { bg: "#fffbeb", text: "#d97706" }
  return { bg: "#f9fafb", text: "#94a3b8" }
}

function statusLabel(s: string) {
  if (s === "RESOLVED") return "Resolvido"
  if (s === "FALSE_POSITIVE") return "Falso Pos."
  if (s === "ACKNOWLEDGED") return "Reconhecido"
  return "Aberto"
}

export function ComplianceReportPDF({
  orgName,
  workspaceName,
  alerts,
  summary,
  overallScore,
  overallStatus,
  generatedAt,
}: ComplianceReportProps) {
  const score = overallScore ?? (alerts.length > 0 ? Math.max(0, 100 - (summary.critical * 15 + summary.warning * 5 + summary.info * 1)) : 100)
  const status = overallStatus ?? (summary.critical > 0 ? "BLOQUEADO" : "APROVADO")
  const isBlocked = status === "BLOQUEADO"
  const resolvedCount = alerts.filter((a) => a.status === "RESOLVED" || a.status === "FALSE_POSITIVE").length
  const resolvedPercent = alerts.length > 0 ? Math.round((resolvedCount / alerts.length) * 100) : 0

  // Group by artifact
  const groups: Record<string, { title: string; alerts: AlertWithRelationsResponse[]; critical: number; warning: number; info: number }> = {}
  for (const alert of alerts) {
    const key = alert.artifact?.id || "unknown"
    if (!groups[key]) {
      groups[key] = { title: alert.artifact?.title || "Artefato", alerts: [], critical: 0, warning: 0, info: 0 }
    }
    groups[key].alerts.push(alert)
    if (alert.severity === "CRITICAL") groups[key].critical++
    else if (alert.severity === "WARNING") groups[key].warning++
    else groups[key].info++
  }

  return (
    <Document>
      {/* COVER */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.coverTitleRed}>RedLine</Text>
          </View>
          <Text style={styles.coverSubtitle}>Compliance & Governance Engine</Text>
          <Text style={styles.coverOrg}>{orgName}</Text>
          <Text style={styles.coverWorkspace}>{workspaceName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: isBlocked ? "#fef2f2" : "#f0fdf4" }]}>
            <Text style={[styles.statusText, { color: isBlocked ? "#dc2626" : "#16a34a" }]}>{status}</Text>
          </View>
          <Text style={[styles.coverDate, { marginTop: 30 }]}>Gerado em {generatedAt}</Text>
        </View>
        <View style={styles.footer}>
          <Text>RedLine Governance Report</Text>
          <Text>{generatedAt}</Text>
        </View>
      </Page>

      {/* SUMMARY + VIOLATIONS - all in one flowing page */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>Resumo Executivo</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: isBlocked ? "#dc2626" : "#16a34a" }]}>{score}</Text>
            <Text style={styles.summaryLabel}>Score de Compliance</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#dc2626" }]}>{summary.critical}</Text>
            <Text style={styles.summaryLabel}>{`Viola\u00e7\u00f5es Cr\u00edticas`}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#d97706" }]}>{summary.warning}</Text>
            <Text style={styles.summaryLabel}>Alertas</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#2563eb" }]}>{summary.info}</Text>
            <Text style={styles.summaryLabel}>Informativos</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{alerts.length}</Text>
            <Text style={styles.summaryLabel}>{`Total de Viola\u00e7\u00f5es`}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#16a34a" }]}>{resolvedPercent}%</Text>
            <Text style={styles.summaryLabel}>{`Remedia\u00e7\u00e3o (${resolvedCount}/${alerts.length})`}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{Object.keys(groups).length}</Text>
            <Text style={styles.summaryLabel}>Artefatos Analisados</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Detalhamento por Artefato</Text>

        {Object.values(groups).map((group, gi) => (
          <View key={gi}>
            <View style={styles.artifactHeader} wrap={false}>
              <Text style={styles.artifactTitle}>{group.title}</Text>
              <View style={styles.artifactStats}>
                {group.critical > 0 && (
                  <Text style={[styles.statChip, { backgroundColor: "#fef2f2", color: "#dc2626" }]}>{`${group.critical} cr\u00edticas`}</Text>
                )}
                {group.warning > 0 && (
                  <Text style={[styles.statChip, { backgroundColor: "#fffbeb", color: "#d97706" }]}>{group.warning} alertas</Text>
                )}
                {group.info > 0 && (
                  <Text style={[styles.statChip, { backgroundColor: "#eff6ff", color: "#2563eb" }]}>{group.info} info</Text>
                )}
              </View>
            </View>

            <View style={styles.tableHeader} wrap={false}>
              <Text style={[styles.tableHeaderText, { width: 24 }]}>#</Text>
              <Text style={[styles.tableHeaderText, { width: 60 }]}>Sev.</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>{`Descri\u00e7\u00e3o`}</Text>
              <Text style={[styles.tableHeaderText, { width: 65 }]}>Status</Text>
            </View>

            {group.alerts.map((alert, ai) => {
              const sc = sevColor(alert.severity)
              const stc = statusColor(alert.status)
              return (
                <View key={alert.id} style={styles.violationRow} wrap={false}>
                  <Text style={styles.violationIndex}>{ai + 1}</Text>
                  <View style={styles.violationSeverity}>
                    <Text style={[styles.severityBadge, { backgroundColor: sc.bg, color: sc.text }]}>{sevLabel(alert.severity)}</Text>
                  </View>
                  <View style={styles.violationContent}>
                    <Text style={styles.violationTitle}>{alert.title}</Text>
                    <Text style={styles.violationDesc}>{alert.description}</Text>
                    {alert.suggestedAction ? <Text style={styles.violationAction}>{`A\u00e7\u00e3o: ${alert.suggestedAction}`}</Text> : null}
                  </View>
                  <View style={styles.violationStatus}>
                    <Text style={[styles.statusSmall, { backgroundColor: stc.bg, color: stc.text }]}>{statusLabel(alert.status)}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text>RedLine Governance Report</Text>
          <Text>{generatedAt}</Text>
        </View>
      </Page>
    </Document>
  )
}
