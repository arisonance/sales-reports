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
  charcoal: '#333F48',
  blue: '#00A3E1',
  lightGrey: '#D9D9D6',
  white: '#FFFFFF',
  green: '#00B2A9',
  red: '#E53935',
  yellow: '#FFC107',
  lightBlue: '#E8F7FC',
  lightGreen: '#E6F7F6',
  lightRed: '#FDEBEB',
  veryLightGrey: '#F5F6F7',
}

// ==================== STYLES ====================
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
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginTop: 25,
    marginBottom: 20,
  },
  sectionTitleWithLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  sectionTitleLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.lightGrey,
    marginLeft: 15,
  },

  // ==================== HERO CALLOUT ====================
  heroCallout: {
    backgroundColor: COLORS.lightBlue,
    padding: 24,
    borderRadius: 6,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.blue,
    marginBottom: 25,
  },
  heroText: {
    fontSize: 13,
    color: COLORS.charcoal,
    lineHeight: 1.8,
    fontWeight: 'medium',
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

  // ==================== PERFORMANCE SUMMARY ====================
  performanceBox: {
    backgroundColor: COLORS.veryLightGrey,
    padding: 20,
    borderRadius: 6,
    marginBottom: 25,
  },
  performanceText: {
    fontSize: 11,
    color: COLORS.charcoal,
    lineHeight: 1.8,
  },

  // ==================== WIN CARDS ====================
  winCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 25,
  },
  winCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  winCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  winCardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.charcoal,
    flex: 1,
    marginRight: 8,
  },
  winCardValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.green,
  },
  winCardDescription: {
    fontSize: 9,
    color: COLORS.charcoal,
    lineHeight: 1.6,
    opacity: 0.8,
    marginBottom: 8,
  },
  winCardRegion: {
    fontSize: 8,
    color: COLORS.blue,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ==================== COMPETITOR CARDS ====================
  competitorCard: {
    marginBottom: 15,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  competitorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  competitorHeaderHigh: {
    backgroundColor: COLORS.lightRed,
  },
  competitorHeaderMedium: {
    backgroundColor: '#FFF8E1',
  },
  competitorHeaderLow: {
    backgroundColor: COLORS.veryLightGrey,
  },
  competitorName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.charcoal,
  },
  threatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  threatBadgeHigh: {
    backgroundColor: COLORS.red,
  },
  threatBadgeMedium: {
    backgroundColor: COLORS.yellow,
  },
  threatBadgeLow: {
    backgroundColor: COLORS.lightGrey,
  },
  threatBadgeText: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  threatBadgeTextLight: {
    color: COLORS.white,
  },
  threatBadgeTextDark: {
    color: COLORS.charcoal,
  },
  competitorBody: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
  },
  competitorColumn: {
    flex: 1,
    paddingRight: 12,
  },
  competitorColumnLabel: {
    fontSize: 7,
    color: COLORS.charcoal,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  competitorColumnText: {
    fontSize: 9,
    color: COLORS.charcoal,
    lineHeight: 1.6,
  },

  // ==================== MARKET TRENDS CALLOUT ====================
  trendCallout: {
    backgroundColor: COLORS.veryLightGrey,
    padding: 20,
    borderRadius: 6,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.charcoal,
  },
  trendText: {
    fontSize: 11,
    color: COLORS.charcoal,
    lineHeight: 1.8,
    fontStyle: 'italic',
  },

  // ==================== RECOMMENDATIONS ====================
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  recommendationNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  recommendationNumberText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  recommendationContent: {
    flex: 1,
    paddingTop: 2,
  },
  recommendationTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.charcoal,
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 10,
    color: COLORS.charcoal,
    opacity: 0.8,
    lineHeight: 1.6,
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

interface StructuredSummary {
  overview: string
  performanceSummary: string
  topWins: Array<{
    title: string
    value: string
    region: string
    description: string
  }>
  competitorInsights: Array<{
    competitor: string
    threat: 'high' | 'medium' | 'low'
    observation: string
    response: string
  }>
  marketTrends: string
  initiatives: string
  recommendations: Array<{
    priority: number
    title: string
    description: string
  }>
  photoHighlights?: string
}

interface GlobalSummaryPDFProps {
  periodType: 'month' | 'quarter'
  periodValue: string
  structured: StructuredSummary
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

// ==================== COMPONENTS ====================

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

const SectionTitleWithLine = ({ children }: { children: string }) => (
  <View style={styles.sectionTitleWithLine}>
    <Text style={styles.sectionTitleText}>{children}</Text>
    <View style={styles.sectionTitleLine} />
  </View>
)

const HeroCallout = ({ text }: { text: string }) => (
  <View style={styles.heroCallout}>
    <Text style={styles.heroText}>{text}</Text>
  </View>
)

const WinCard = ({ win }: { win: { title: string; value: string; region: string; description: string } }) => (
  <View style={styles.winCard}>
    <View style={styles.winCardHeader}>
      <Text style={styles.winCardTitle}>{win.title}</Text>
      {win.value && <Text style={styles.winCardValue}>{win.value}</Text>}
    </View>
    <Text style={styles.winCardDescription}>{win.description}</Text>
    <Text style={styles.winCardRegion}>{win.region}</Text>
  </View>
)

const CompetitorCard = ({ insight }: { insight: { competitor: string; threat: 'high' | 'medium' | 'low'; observation: string; response: string } }) => {
  const headerStyle = insight.threat === 'high'
    ? styles.competitorHeaderHigh
    : insight.threat === 'medium'
    ? styles.competitorHeaderMedium
    : styles.competitorHeaderLow

  const badgeStyle = insight.threat === 'high'
    ? styles.threatBadgeHigh
    : insight.threat === 'medium'
    ? styles.threatBadgeMedium
    : styles.threatBadgeLow

  const badgeTextStyle = insight.threat === 'low'
    ? styles.threatBadgeTextDark
    : styles.threatBadgeTextLight

  return (
    <View style={styles.competitorCard}>
      <View style={[styles.competitorHeader, headerStyle]}>
        <Text style={styles.competitorName}>{insight.competitor}</Text>
        <View style={[styles.threatBadge, badgeStyle]}>
          <Text style={[styles.threatBadgeText, badgeTextStyle]}>{insight.threat} threat</Text>
        </View>
      </View>
      <View style={styles.competitorBody}>
        <View style={styles.competitorColumn}>
          <Text style={styles.competitorColumnLabel}>What We&apos;re Seeing</Text>
          <Text style={styles.competitorColumnText}>{insight.observation}</Text>
        </View>
        <View style={styles.competitorColumn}>
          <Text style={styles.competitorColumnLabel}>Our Response</Text>
          <Text style={styles.competitorColumnText}>{insight.response}</Text>
        </View>
      </View>
    </View>
  )
}

const RecommendationItem = ({ rec }: { rec: { priority: number; title: string; description: string } }) => (
  <View style={styles.recommendationItem}>
    <View style={styles.recommendationNumber}>
      <Text style={styles.recommendationNumberText}>{rec.priority}</Text>
    </View>
    <View style={styles.recommendationContent}>
      <Text style={styles.recommendationTitle}>{rec.title}</Text>
      <Text style={styles.recommendationDescription}>{rec.description}</Text>
    </View>
  </View>
)

// ==================== MAIN PDF COMPONENT ====================
export const GlobalSummaryPDF = ({ periodType, periodValue, structured, photos = [], data }: GlobalSummaryPDFProps) => {
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

        {/* Hero Overview Callout */}
        {structured.overview && <HeroCallout text={structured.overview} />}

        {/* Performance Summary */}
        {structured.performanceSummary && (
          <View style={styles.performanceBox}>
            <Text style={styles.performanceText}>{structured.performanceSummary}</Text>
          </View>
        )}

        {/* Market Trends */}
        {structured.marketTrends && (
          <>
            <SectionTitleWithLine>Market Trends</SectionTitleWithLine>
            <View style={styles.trendCallout}>
              <Text style={styles.trendText}>{structured.marketTrends}</Text>
            </View>
          </>
        )}

        <PageFooter />
      </Page>

      {/* ==================== KEY WINS ==================== */}
      {structured.topWins.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Image src={getImageUrl(IMAGES.logoDark)} style={styles.headerLogo} />
            <View style={styles.headerRight}>
              <Text style={styles.headerTitle}>Field Team Report</Text>
              <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
            </View>
          </View>

          <SectionTitleWithLine>Key Wins</SectionTitleWithLine>

          <View style={styles.winCardsGrid}>
            {structured.topWins.map((win, idx) => (
              <WinCard key={idx} win={win} />
            ))}
          </View>

          {/* Key Initiatives */}
          {structured.initiatives && (
            <>
              <SectionTitleWithLine>Key Initiatives</SectionTitleWithLine>
              <View style={styles.performanceBox}>
                <Text style={styles.performanceText}>{structured.initiatives}</Text>
              </View>
            </>
          )}

          <PageFooter />
        </Page>
      )}

      {/* ==================== COMPETITIVE LANDSCAPE ==================== */}
      {structured.competitorInsights.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Image src={getImageUrl(IMAGES.logoDark)} style={styles.headerLogo} />
            <View style={styles.headerRight}>
              <Text style={styles.headerTitle}>Field Team Report</Text>
              <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
            </View>
          </View>

          <SectionTitleWithLine>Competitive Landscape</SectionTitleWithLine>

          {structured.competitorInsights.map((insight, idx) => (
            <CompetitorCard key={idx} insight={insight} />
          ))}

          <PageFooter />
        </Page>
      )}

      {/* ==================== RECOMMENDATIONS ==================== */}
      {structured.recommendations.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Image src={getImageUrl(IMAGES.logoDark)} style={styles.headerLogo} />
            <View style={styles.headerRight}>
              <Text style={styles.headerTitle}>Field Team Report</Text>
              <Text style={styles.headerDate}>{formatPeriod(periodType, periodValue)}</Text>
            </View>
          </View>

          <SectionTitleWithLine>Recommendations</SectionTitleWithLine>

          {structured.recommendations.map((rec, idx) => (
            <RecommendationItem key={idx} rec={rec} />
          ))}

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
