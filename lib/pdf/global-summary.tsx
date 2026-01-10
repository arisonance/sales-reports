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

// Image paths - Sonance brand assets
const IMAGES = {
  logoReverse: '/logos/sonance_logo_reverse.png',
  logoDark: '/logos/sonance_logo_dark.png',
  beamIcon: '/logos/sonance_beam_icon.png',
}

// Sonance Brand Colors (exact hex values from brand guidelines)
const COLORS = {
  charcoal: '#333F48',    // Primary body text
  blue: '#00A3E1',        // Accent, headers
  lightGrey: '#D9D9D6',   // Backgrounds
  white: '#FFFFFF',       // Reverse elements
  green: '#00B2A9',       // Foundation/success
  red: '#E53935',         // Danger/negative
}

// Status colors for OKR tracking
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

// ==================== STYLES - Sonance Brand Excellence ====================
const styles = StyleSheet.create({
  // ==================== COVER PAGE ====================
  coverPage: {
    backgroundColor: COLORS.charcoal,
    padding: 0,
    position: 'relative',
  },
  coverHeader: {
    backgroundColor: COLORS.blue,
    height: 8,
  },
  coverContent: {
    padding: 50,
    paddingTop: 40,
  },
  coverLogo: {
    width: 160,
    height: 25,
  },
  coverTitleBlock: {
    marginTop: 100,
  },
  titleAccentLine: {
    width: 80,
    height: 4,
    backgroundColor: COLORS.blue,
    marginBottom: 20,
  },
  coverTitle: {
    fontSize: 38,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 4,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 24,
    color: COLORS.white,
    letterSpacing: 2,
    opacity: 0.9,
  },
  coverMeta: {
    marginTop: 60,
  },
  coverMetaLabel: {
    fontSize: 10,
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 6,
  },
  coverMetaValue: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  coverFooter: {
    position: 'absolute',
    bottom: 50,
    left: 50,
  },
  coverFooterText: {
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.5,
    letterSpacing: 1,
  },
  coverBeam: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 200,
    height: 300,
    opacity: 0.6,
  },

  // ==================== CONTENT PAGES ====================
  page: {
    padding: 50,
    paddingTop: 40,
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
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.blue,
  },
  headerLogo: {
    width: 110,
    height: 17,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 8,
    color: COLORS.charcoal,
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.5,
  },
  headerDate: {
    fontSize: 10,
    color: COLORS.charcoal,
    fontWeight: 'bold',
    marginTop: 2,
  },

  // ==================== FOOTER ====================
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.charcoal,
    paddingVertical: 14,
    paddingHorizontal: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'column',
  },
  footerBrand: {
    fontSize: 8,
    color: COLORS.white,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footerUrl: {
    fontSize: 7,
    color: COLORS.blue,
    marginTop: 3,
    letterSpacing: 1,
  },
  footerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  pageNumber: {
    fontSize: 9,
    color: COLORS.white,
    opacity: 0.6,
  },
  footerBeam: {
    width: 40,
    height: 60,
    opacity: 0.4,
  },

  // ==================== SECTION TITLES ====================
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 25,
    marginBottom: 18,
  },
  sectionTitleWithLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 18,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  sectionTitleLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.lightGrey,
    marginLeft: 15,
  },

  // ==================== STATS GRID ====================
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  statBox: {
    width: '23%',
    backgroundColor: COLORS.blue,
    padding: 15,
    borderRadius: 6,
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
    letterSpacing: 1.5,
    opacity: 0.85,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statSub: {
    fontSize: 7,
    color: COLORS.white,
    opacity: 0.6,
    marginTop: 4,
  },

  // ==================== TABLES ====================
  table: {
    marginBottom: 25,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.charcoal,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  tableRowAlt: {
    backgroundColor: '#F8F9FA',
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
    marginBottom: 20,
  },
  okrHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.lightGrey,
    paddingBottom: 10,
    marginBottom: 12,
  },
  okrHeaderCell: {
    fontSize: 9,
    color: COLORS.blue,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  okrRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  okrNumber: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: STATUS_COLORS.on_track,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  okrNumberText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  okrCell: {
    fontSize: 9,
    color: COLORS.charcoal,
    flex: 1,
    lineHeight: 1.5,
  },
  statusLegend: {
    flexDirection: 'row',
    gap: 25,
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 14,
    height: 8,
    borderRadius: 2,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 8,
    color: COLORS.charcoal,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ==================== SUMMARY & BULLETS ====================
  summaryText: {
    fontSize: 10,
    lineHeight: 1.7,
    color: COLORS.charcoal,
    whiteSpace: 'pre-wrap',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.blue,
    marginRight: 12,
    marginTop: 5,
  },
  bulletDotDark: {
    backgroundColor: COLORS.charcoal,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.6,
    color: COLORS.charcoal,
  },

  // ==================== MARKDOWN PARSING ====================
  mdH1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 12,
  },
  mdH2: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.charcoal,
    marginTop: 16,
    marginBottom: 10,
  },
  mdParagraph: {
    fontSize: 10,
    lineHeight: 1.7,
    color: COLORS.charcoal,
    marginBottom: 10,
  },
  mdBold: {
    fontWeight: 'bold',
  },
  mdBulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 12,
  },
  mdBulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.blue,
    marginRight: 10,
    marginTop: 5,
  },
  mdBulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.6,
    color: COLORS.charcoal,
  },

  // ==================== PHOTO HIGHLIGHTS ====================
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 15,
  },
  photoCard: {
    width: '47%',
    marginBottom: 15,
  },
  photoImage: {
    width: '100%',
    height: 140,
    objectFit: 'cover',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  photoCaption: {
    marginTop: 8,
    paddingLeft: 2,
  },
  photoCaptionText: {
    fontSize: 9,
    color: COLORS.charcoal,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  photoCaptionMeta: {
    fontSize: 8,
    color: COLORS.charcoal,
    opacity: 0.6,
  },

  // ==================== BACK PAGE ====================
  backPage: {
    backgroundColor: COLORS.charcoal,
    padding: 0,
    position: 'relative',
  },
  backHeader: {
    backgroundColor: COLORS.blue,
    height: 8,
  },
  backContent: {
    padding: 50,
    paddingTop: 60,
  },
  backLogo: {
    width: 200,
    height: 32,
    marginBottom: 40,
  },
  backTagline: {
    fontSize: 20,
    color: COLORS.white,
    fontStyle: 'italic',
    marginBottom: 40,
    opacity: 0.9,
  },
  backText: {
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.7,
    marginBottom: 6,
    lineHeight: 1.6,
  },
  backDivider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.blue,
    marginVertical: 25,
  },
  backAddress: {
    fontSize: 9,
    color: COLORS.white,
    opacity: 0.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 20,
  },
  backWebsite: {
    fontSize: 12,
    color: COLORS.blue,
    marginTop: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  backBeam: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 200,
    height: 300,
    opacity: 0.6,
  },
})

// ==================== INTERFACES ====================
interface RegionData {
  region: string
  director: string
  monthlySales: number
  monthlyGoal: number
  percentToGoal: number
  pipeline: number
  status: string
}

interface PhotoData {
  id: string
  url: string
  filename: string
  caption?: string
  directorName: string
  region: string
}

interface GlobalSummaryPDFProps {
  periodType: 'month' | 'quarter'
  periodValue: string
  summaryText: string
  photos?: PhotoData[]
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

// ==================== HELPER FUNCTIONS ====================
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
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(<Text key={match.index} style={styles.mdBold}>{match[1]}</Text>)
    lastIndex = match.index + match[0].length
  }

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

    if (!trimmed) {
      flushBullets()
      return
    }

    if (trimmed.startsWith('# ')) {
      flushBullets()
      components.push(
        <Text key={`h1-${idx}`} style={styles.mdH1}>
          {trimmed.slice(2)}
        </Text>
      )
      return
    }

    if (trimmed.startsWith('## ')) {
      flushBullets()
      components.push(
        <Text key={`h2-${idx}`} style={styles.mdH2}>
          {trimmed.slice(3)}
        </Text>
      )
      return
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      bulletItems.push(trimmed.slice(2))
      return
    }

    flushBullets()
    components.push(
      <Text key={`p-${idx}`} style={styles.mdParagraph}>
        {parseInlineMarkdown(trimmed)}
      </Text>
    )
  })

  flushBullets()
  return components
}

// ==================== COMPONENTS ====================

// Footer Component
const PageFooter = () => (
  <View style={styles.footerWrapper} fixed>
    <View style={styles.footerLeft}>
      <Text style={styles.footerBrand}>Sonance Field Team Report</Text>
      <Text style={styles.footerUrl}>www.sonance.com</Text>
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

// Section Title with Line Component
const SectionTitleWithLine = ({ children }: { children: string }) => (
  <View style={styles.sectionTitleWithLine}>
    <Text style={styles.sectionTitleText}>{children}</Text>
    <View style={styles.sectionTitleLine} />
  </View>
)

// ==================== MAIN PDF COMPONENT ====================
export const GlobalSummaryPDF = ({ periodType, periodValue, summaryText, photos = [], data }: GlobalSummaryPDFProps) => {
  const overallPercentToGoal = data.totalMonthlyGoal > 0
    ? Math.round((data.totalMonthlySales / data.totalMonthlyGoal) * 100)
    : 0

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Document>
      {/* ==================== COVER PAGE ==================== */}
      <Page size="LETTER" style={styles.coverPage}>
        <View style={styles.coverHeader} />
        <View style={styles.coverContent}>
          <Image src={getImageUrl(IMAGES.logoReverse)} style={styles.coverLogo} />

          <View style={styles.coverTitleBlock}>
            <View style={styles.titleAccentLine} />
            <Text style={styles.coverTitle}>
              {periodType === 'quarter' ? 'QUARTERLY' : 'MONTHLY'}
            </Text>
            <Text style={styles.coverSubtitle}>
              Field Team Report
            </Text>
          </View>

          <View style={styles.coverMeta}>
            <Text style={styles.coverMetaLabel}>Report Period</Text>
            <Text style={styles.coverMetaValue}>{formatPeriod(periodType, periodValue)}</Text>
          </View>

          <View style={styles.coverFooter}>
            <Text style={styles.coverFooterText}>Generated {currentDate}</Text>
          </View>
        </View>

        <Image src={getImageUrl(IMAGES.beamIcon)} style={styles.coverBeam} />
      </Page>

      {/* ==================== PERFORMANCE OVERVIEW ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={getImageUrl(IMAGES.logoDark)} style={styles.headerLogo} />
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>Field Team Report</Text>
            <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
          </View>
        </View>

        <SectionTitleWithLine>Performance Overview</SectionTitleWithLine>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{periodType === 'quarter' ? 'Quarterly' : 'Monthly'} Sales</Text>
            <Text style={styles.statValue}>{formatCurrency(data.totalMonthlySales)}</Text>
            <Text style={styles.statSub}>Goal: {formatCurrency(data.totalMonthlyGoal)}</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxGreen]}>
            <Text style={styles.statLabel}>% to Goal</Text>
            <Text style={styles.statValue}>{overallPercentToGoal}%</Text>
            <Text style={styles.statSub}>{overallPercentToGoal >= 100 ? 'On track' : `${100 - overallPercentToGoal}% behind`}</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxDark]}>
            <Text style={styles.statLabel}>Pipeline</Text>
            <Text style={styles.statValue}>{formatCurrency(data.totalPipeline)}</Text>
            <Text style={styles.statSub}>Active opportunities</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Open Orders</Text>
            <Text style={styles.statValue}>{formatCurrency(data.totalOpenOrders)}</Text>
            <Text style={styles.statSub}>Pending fulfillment</Text>
          </View>
        </View>

        <SectionTitleWithLine>Regional Performance</SectionTitleWithLine>
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
                {region.status === 'submitted' ? '✓' : '○'}
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
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>Field Team Report</Text>
            <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
          </View>
        </View>

        <SectionTitleWithLine>Current OKR Update</SectionTitleWithLine>

        <View style={styles.okrTable}>
          <View style={styles.okrHeader}>
            <Text style={[styles.okrHeaderCell, { width: '5%' }]}></Text>
            <Text style={[styles.okrHeaderCell, { width: '30%' }]}>Objective</Text>
            <Text style={[styles.okrHeaderCell, { width: '35%' }]}>Update</Text>
            <Text style={[styles.okrHeaderCell, { width: '30%' }]}>Next Steps</Text>
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
          <StatusIndicator color={STATUS_COLORS.on_track} label="On Track" />
          <StatusIndicator color={STATUS_COLORS.behind} label="Behind" />
          <StatusIndicator color={STATUS_COLORS.in_danger} label="At Risk" />
        </View>

        <PageFooter />
      </Page>

      {/* ==================== EXECUTIVE SUMMARY ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={getImageUrl(IMAGES.logoDark)} style={styles.headerLogo} />
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>Field Team Report</Text>
            <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
          </View>
        </View>

        <SectionTitleWithLine>Executive Summary</SectionTitleWithLine>
        <View>{parseMarkdownToComponents(summaryText)}</View>

        <PageFooter />
      </Page>

      {/* ==================== HIGHLIGHTS ==================== */}
      {(data.topWins.length > 0 || data.competitiveThemes.length > 0) && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Image src={getImageUrl(IMAGES.logoDark)} style={styles.headerLogo} />
            <View style={styles.headerRight}>
              <Text style={styles.headerTitle}>Field Team Report</Text>
              <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
            </View>
          </View>

          {data.topWins.length > 0 && (
            <>
              <SectionTitleWithLine>Top Wins</SectionTitleWithLine>
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
              <SectionTitleWithLine>Competitive Landscape</SectionTitleWithLine>
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

      {/* ==================== PHOTO HIGHLIGHTS ==================== */}
      {photos.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Image src={getImageUrl(IMAGES.logoDark)} style={styles.headerLogo} />
            <View style={styles.headerRight}>
              <Text style={styles.headerTitle}>Field Team Report</Text>
              <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
            </View>
          </View>

          <SectionTitleWithLine>Photo Highlights</SectionTitleWithLine>

          <View style={styles.photoGrid}>
            {photos.slice(0, 4).map((photo, idx) => (
              <View key={idx} style={styles.photoCard}>
                <Image src={photo.url} style={styles.photoImage} />
                <View style={styles.photoCaption}>
                  <Text style={styles.photoCaptionText}>
                    {photo.caption || photo.filename}
                  </Text>
                  <Text style={styles.photoCaptionMeta}>
                    {photo.directorName} • {photo.region}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <PageFooter />
        </Page>
      )}

      {/* Additional photos page if needed */}
      {photos.length > 4 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Image src={getImageUrl(IMAGES.logoDark)} style={styles.headerLogo} />
            <View style={styles.headerRight}>
              <Text style={styles.headerTitle}>Field Team Report</Text>
              <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
            </View>
          </View>

          <SectionTitleWithLine>Photo Highlights (Continued)</SectionTitleWithLine>

          <View style={styles.photoGrid}>
            {photos.slice(4, 8).map((photo, idx) => (
              <View key={idx} style={styles.photoCard}>
                <Image src={photo.url} style={styles.photoImage} />
                <View style={styles.photoCaption}>
                  <Text style={styles.photoCaptionText}>
                    {photo.caption || photo.filename}
                  </Text>
                  <Text style={styles.photoCaptionMeta}>
                    {photo.directorName} • {photo.region}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <PageFooter />
        </Page>
      )}

      {/* ==================== BACK PAGE ==================== */}
      <Page size="LETTER" style={styles.backPage}>
        <View style={styles.backHeader} />
        <View style={styles.backContent}>
          <Image src={getImageUrl(IMAGES.logoReverse)} style={styles.backLogo} />

          <Text style={styles.backTagline}>"Life is Better with Music"</Text>

          <View style={styles.backDivider} />

          <Text style={styles.backText}>
            Information in this document is subject to change.
          </Text>
          <Text style={styles.backText}>
            For the latest from Sonance, please visit our website.
          </Text>

          <Text style={styles.backAddress}>
            991 Calle Amanecer • San Clemente, CA 92673 • 949.492.7777
          </Text>
          <Text style={styles.backWebsite}>WWW.SONANCE.COM</Text>
        </View>

        <Image src={getImageUrl(IMAGES.beamIcon)} style={styles.backBeam} />
      </Page>
    </Document>
  )
}
