'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// Get base URL for images (works in browser context)
const getImageUrl = (path: string) => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  return path
}

// Image paths
const IMAGES = {
  logoReverse: '/logos/sonance_logo_reverse.png',
  logoDark: '/logos/sonance_logo_dark.png',
  beamIcon: '/logos/sonance_beam_icon.png',
}

// Sonance Brand Colors
const COLORS = {
  charcoal: '#333F48',
  blue: '#00A3E1',
  lightGrey: '#D9D9D6',
  white: '#FFFFFF',
  green: '#00B2A9',
  red: '#E53935',
}

// Status colors for OKR
const STATUS_COLORS = {
  on_track: '#4CAF50',
  behind: '#FF9800',
  in_danger: '#F44336',
}

// Placeholder OKR data
const placeholderOKRs = [
  { objective: 'TBD', update: '', nextSteps: '', status: 'on_track' as const },
  { objective: 'TBD', update: 'WILL BE UPDATED', nextSteps: 'FOR 2026', status: 'on_track' as const },
  { objective: 'TBD', update: '', nextSteps: '', status: 'on_track' as const },
]

// Styles
const styles = StyleSheet.create({
  // ==================== COVER PAGE ====================
  coverPage: {
    backgroundColor: COLORS.charcoal,
    padding: 50,
    position: 'relative',
  },
  coverLogo: {
    width: 152,
    height: 24,
  },
  coverTitleBlock: {
    marginTop: 120,
  },
  titleLine: {
    width: 350,
    height: 2,
    backgroundColor: COLORS.blue,
    marginBottom: 25,
  },
  coverTitle: {
    fontSize: 32,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  coverSubtitle: {
    fontSize: 18,
    color: COLORS.white,
    marginTop: 8,
  },
  coverAccent: {
    fontSize: 12,
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 30,
  },
  coverBeam: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 180,
    height: 270,
    opacity: 0.7,
  },

  // ==================== CONTENT PAGES ====================
  page: {
    padding: 50,
    paddingBottom: 80,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.charcoal,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.blue,
  },
  headerLogo: {
    width: 120,
    height: 19,
  },
  headerDate: {
    fontSize: 9,
    color: COLORS.charcoal,
    opacity: 0.6,
  },

  // ==================== FOOTER ====================
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.charcoal,
    paddingVertical: 12,
    paddingHorizontal: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'column',
  },
  footerBrand: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footerUrl: {
    fontSize: 8,
    color: COLORS.blue,
    marginTop: 2,
  },
  footerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  pageNumber: {
    fontSize: 9,
    color: COLORS.white,
    opacity: 0.7,
  },
  footerBeam: {
    width: 50,
    height: 75,
    opacity: 0.5,
  },

  // ==================== SECTION TITLES ====================
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 15,
  },

  // ==================== STATS GRID ====================
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  statBox: {
    width: '23%',
    backgroundColor: COLORS.blue,
    padding: 12,
    borderRadius: 4,
  },
  statBoxGreen: {
    backgroundColor: COLORS.green,
  },
  statBoxDark: {
    backgroundColor: COLORS.charcoal,
  },
  statLabel: {
    fontSize: 7,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.9,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 4,
  },
  statSub: {
    fontSize: 7,
    color: COLORS.white,
    opacity: 0.7,
    marginTop: 2,
  },

  // ==================== TABLES ====================
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.charcoal,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  tableRowAlt: {
    backgroundColor: '#F5F5F5',
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.charcoal,
  },
  tableCellGreen: {
    color: COLORS.green,
    fontWeight: 'bold',
  },
  tableCellRed: {
    color: COLORS.red,
    fontWeight: 'bold',
  },

  // ==================== OKR SECTION ====================
  okrTable: {
    marginBottom: 15,
  },
  okrHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
    paddingBottom: 8,
    marginBottom: 8,
  },
  okrHeaderCell: {
    fontSize: 9,
    color: COLORS.blue,
    fontWeight: 'bold',
  },
  okrRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  okrNumber: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: STATUS_COLORS.on_track,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  okrNumberText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  okrCell: {
    fontSize: 9,
    color: COLORS.charcoal,
    flex: 1,
  },
  statusLegend: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 6,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 8,
    color: COLORS.charcoal,
  },

  // ==================== SUMMARY & BULLETS ====================
  summaryText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: COLORS.charcoal,
    whiteSpace: 'pre-wrap',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.blue,
    marginRight: 10,
    marginTop: 4,
  },
  bulletDotDark: {
    backgroundColor: COLORS.charcoal,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
    color: COLORS.charcoal,
  },

  // ==================== MARKDOWN PARSING ====================
  mdH1: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  mdH2: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.charcoal,
    marginTop: 12,
    marginBottom: 6,
  },
  mdParagraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: COLORS.charcoal,
    marginBottom: 8,
  },
  mdBold: {
    fontWeight: 'bold',
  },
  mdBulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 10,
  },
  mdBulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.blue,
    marginRight: 8,
    marginTop: 5,
  },
  mdBulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
    color: COLORS.charcoal,
  },

  // ==================== BACK PAGE ====================
  backPage: {
    backgroundColor: COLORS.charcoal,
    padding: 50,
    position: 'relative',
  },
  backLogo: {
    width: 180,
    height: 28,
    marginBottom: 30,
  },
  backText: {
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 5,
  },
  backAddress: {
    fontSize: 9,
    color: COLORS.white,
    opacity: 0.6,
    marginTop: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  backWebsite: {
    fontSize: 10,
    color: COLORS.blue,
    marginTop: 8,
    fontWeight: 'bold',
  },
  backBeam: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 180,
    height: 270,
    opacity: 0.7,
  },
})

interface RegionData {
  region: string
  director: string
  monthlySales: number
  monthlyGoal: number
  percentToGoal: number
  pipeline: number
  status: string
}

interface GlobalSummaryPDFProps {
  periodType: 'month' | 'quarter'
  periodValue: string
  summaryText: string
  data: {
    totalMonthlySales: number
    totalMonthlyGoal: number
    totalYtdSales: number
    totalYtdGoal: number
    totalPipeline: number
    totalOpenOrders: number
    submittedReports: number
    totalDirectors: number
    regions: RegionData[]
    topWins: string[]
    competitiveThemes: string[]
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatPeriod = (periodType: string, periodValue: string) => {
  if (periodType === 'quarter') {
    const [year, q] = periodValue.split('-')
    return `${q} ${year}`
  }
  return new Date(periodValue + '-01').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
}

// Helper to get percentage cell color
const getPercentStyle = (percent: number) => {
  return percent >= 100 ? styles.tableCellGreen : styles.tableCellRed
}

// Parse inline bold markers (**text**) and return Text components
const parseInlineMarkdown = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = []
  const regex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Text before bold
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    // Bold text
    parts.push(<Text key={match.index} style={styles.mdBold}>{match[1]}</Text>)
    lastIndex = match.index + match[0].length
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

// Parse full Markdown text and return array of components
const parseMarkdownToComponents = (markdown: string): React.ReactNode[] => {
  const components: React.ReactNode[] = []
  const lines = markdown.split('\n')
  let bulletItems: string[] = []

  const flushBullets = () => {
    if (bulletItems.length > 0) {
      bulletItems.forEach((item, idx) => {
        components.push(
          <View key={`bullet-${components.length}-${idx}`} style={styles.mdBulletItem}>
            <View style={styles.mdBulletDot} />
            <Text style={styles.mdBulletText}>{parseInlineMarkdown(item)}</Text>
          </View>
        )
      })
      bulletItems = []
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()

    // Skip empty lines
    if (!trimmed) {
      flushBullets()
      return
    }

    // H1: # Header
    if (trimmed.startsWith('# ')) {
      flushBullets()
      components.push(
        <Text key={`h1-${idx}`} style={styles.mdH1}>
          {trimmed.slice(2)}
        </Text>
      )
      return
    }

    // H2: ## Header
    if (trimmed.startsWith('## ')) {
      flushBullets()
      components.push(
        <Text key={`h2-${idx}`} style={styles.mdH2}>
          {trimmed.slice(3)}
        </Text>
      )
      return
    }

    // Bullet: - item or * item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      bulletItems.push(trimmed.slice(2))
      return
    }

    // Regular paragraph
    flushBullets()
    components.push(
      <Text key={`p-${idx}`} style={styles.mdParagraph}>
        {parseInlineMarkdown(trimmed)}
      </Text>
    )
  })

  // Flush any remaining bullets
  flushBullets()

  return components
}

// Footer Component
const PageFooter = () => (
  <View style={styles.footerWrapper} fixed>
    <View style={styles.footerLeft}>
      <Text style={styles.footerBrand}>Sonance Field Team Report</Text>
      <Text style={styles.footerUrl}>sonance.com</Text>
    </View>
    <View style={styles.footerCenter}>
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
    <Image src={getImageUrl(IMAGES.beamIcon)} style={styles.footerBeam} />
  </View>
)

// Status Indicator Component
const StatusIndicator = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.statusItem}>
    <View style={[styles.statusDot, { backgroundColor: color }]} />
    <Text style={styles.statusLabel}>{label}</Text>
  </View>
)

export const GlobalSummaryPDF = ({ periodType, periodValue, summaryText, data }: GlobalSummaryPDFProps) => {
  const overallPercentToGoal = data.totalMonthlyGoal > 0
    ? Math.round((data.totalMonthlySales / data.totalMonthlyGoal) * 100)
    : 0

  return (
    <Document>
      {/* ==================== COVER PAGE ==================== */}
      <Page size="LETTER" style={styles.coverPage}>
        <Image src={getImageUrl(IMAGES.logoReverse)} style={styles.coverLogo} />

        <View style={styles.coverTitleBlock}>
          <View style={styles.titleLine} />
          <Text style={styles.coverTitle}>
            {periodType === 'quarter' ? 'QUARTERLY' : 'MONTHLY'} REPORT
          </Text>
          <Text style={styles.coverSubtitle}>
            {formatPeriod(periodType, periodValue)}
          </Text>
          <Text style={styles.coverAccent}>
            Field Team Executive Summary
          </Text>
        </View>

        <Image src={getImageUrl(IMAGES.beamIcon)} style={styles.coverBeam} />
      </Page>

      {/* ==================== PERFORMANCE OVERVIEW ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={getImageUrl(IMAGES.logoDark)} style={styles.headerLogo} />
          <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Performance Overview</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total {periodType === 'quarter' ? 'Quarterly' : 'Monthly'} Sales</Text>
            <Text style={styles.statValue}>{formatCurrency(data.totalMonthlySales)}</Text>
            <Text style={styles.statSub}>Goal: {formatCurrency(data.totalMonthlyGoal)}</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxGreen]}>
            <Text style={styles.statLabel}>% to Goal</Text>
            <Text style={styles.statValue}>{overallPercentToGoal}%</Text>
            <Text style={styles.statSub}>{overallPercentToGoal >= 100 ? 'On track!' : `${100 - overallPercentToGoal}% behind`}</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxDark]}>
            <Text style={styles.statLabel}>Total Pipeline</Text>
            <Text style={styles.statValue}>{formatCurrency(data.totalPipeline)}</Text>
            <Text style={styles.statSub}>Active opportunities</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Open Orders</Text>
            <Text style={styles.statValue}>{formatCurrency(data.totalOpenOrders)}</Text>
            <Text style={styles.statSub}>Pending fulfillment</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Regional Performance</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '22%' }]}>Region</Text>
            <Text style={[styles.tableHeaderCell, { width: '22%' }]}>Director</Text>
            <Text style={[styles.tableHeaderCell, { width: '18%', textAlign: 'right' }]}>Sales</Text>
            <Text style={[styles.tableHeaderCell, { width: '18%', textAlign: 'right' }]}>Goal</Text>
            <Text style={[styles.tableHeaderCell, { width: '10%', textAlign: 'right' }]}>%</Text>
            <Text style={[styles.tableHeaderCell, { width: '10%', textAlign: 'center' }]}>Status</Text>
          </View>
          {data.regions.map((region, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCell, { width: '22%' }]}>{region.region}</Text>
              <Text style={[styles.tableCell, { width: '22%' }]}>{region.director}</Text>
              <Text style={[styles.tableCell, { width: '18%', textAlign: 'right' }]}>{formatCurrency(region.monthlySales)}</Text>
              <Text style={[styles.tableCell, { width: '18%', textAlign: 'right' }]}>{formatCurrency(region.monthlyGoal)}</Text>
              <Text style={[styles.tableCell, getPercentStyle(region.percentToGoal), { width: '10%', textAlign: 'right' }]}>
                {region.percentToGoal >= 100 ? '+' : ''}{region.percentToGoal}%
              </Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'center' }]}>
                {region.status === 'submitted' ? 'Done' : 'Draft'}
              </Text>
            </View>
          ))}
        </View>

        <PageFooter />
      </Page>

      {/* ==================== OKR UPDATE ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={getImageUrl(IMAGES.logoDark)} style={styles.headerLogo} />
          <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Current OKR Update</Text>

        <View style={styles.okrTable}>
          <View style={styles.okrHeader}>
            <Text style={[styles.okrHeaderCell, { width: '5%' }]}></Text>
            <Text style={[styles.okrHeaderCell, { width: '30%' }]}>Objective</Text>
            <Text style={[styles.okrHeaderCell, { width: '35%' }]}>Update</Text>
            <Text style={[styles.okrHeaderCell, { width: '30%' }]}>Next Month Steps</Text>
          </View>
          {placeholderOKRs.map((okr, idx) => (
            <View key={idx} style={styles.okrRow}>
              <View style={[styles.okrNumber, { backgroundColor: STATUS_COLORS[okr.status] }]}>
                <Text style={styles.okrNumberText}>{idx + 1}</Text>
              </View>
              <Text style={[styles.okrCell, { width: '30%' }]}>{okr.objective}</Text>
              <Text style={[styles.okrCell, { width: '35%' }]}>{okr.update}</Text>
              <Text style={[styles.okrCell, { width: '30%' }]}>{okr.nextSteps}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statusLegend}>
          <StatusIndicator color={STATUS_COLORS.on_track} label="On track" />
          <StatusIndicator color={STATUS_COLORS.behind} label="Behind" />
          <StatusIndicator color={STATUS_COLORS.in_danger} label="In Danger" />
        </View>

        <PageFooter />
      </Page>

      {/* ==================== EXECUTIVE SUMMARY ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={getImageUrl(IMAGES.logoDark)} style={styles.headerLogo} />
          <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <View>{parseMarkdownToComponents(summaryText)}</View>

        <PageFooter />
      </Page>

      {/* ==================== HIGHLIGHTS ==================== */}
      {(data.topWins.length > 0 || data.competitiveThemes.length > 0) && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Image src={getImageUrl(IMAGES.logoDark)} style={styles.headerLogo} />
            <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
          </View>

          {data.topWins.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Top Wins</Text>
              {data.topWins.map((win, idx) => (
                <View key={idx} style={styles.bulletPoint}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{win}</Text>
                </View>
              ))}
            </>
          )}

          {data.competitiveThemes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Competitive Landscape</Text>
              {data.competitiveThemes.map((theme, idx) => (
                <View key={idx} style={styles.bulletPoint}>
                  <View style={[styles.bulletDot, styles.bulletDotDark]} />
                  <Text style={styles.bulletText}>{theme}</Text>
                </View>
              ))}
            </>
          )}

          <PageFooter />
        </Page>
      )}

      {/* ==================== BACK PAGE ==================== */}
      <Page size="LETTER" style={styles.backPage}>
        <Image src={getImageUrl(IMAGES.logoReverse)} style={styles.backLogo} />

        <Text style={styles.backText}>
          Information in this document is subject to change.
        </Text>
        <Text style={styles.backText}>
          For the latest from Sonance, please visit our website: sonance.com
        </Text>

        <Text style={styles.backAddress}>
          991 Calle Amanecer | San Clemente, CA 92673 | 949.492.7777
        </Text>
        <Text style={styles.backWebsite}>WWW.SONANCE.COM</Text>

        <Image src={getImageUrl(IMAGES.beamIcon)} style={styles.backBeam} />
      </Page>
    </Document>
  )
}
