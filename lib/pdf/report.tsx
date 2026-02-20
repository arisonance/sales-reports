'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

export interface SingleReportData {
  directorName: string
  region: string
  email: string
  month: string
  executiveSummary: string
  wins: Array<{ id: string; title: string; description: string }>
  followUps: string
  monthlySales: number
  monthlyGoal: number
  ytdSales: number
  ytdGoal: number
  openOrders: number
  pipeline: number
  repFirms: Array<{
    id: string
    name: string
    monthlySales: number
    ytdSales: number
    percentToGoal: number
    yoyGrowth: number
    entityType: string
  }>
  competitors: Array<{
    id: string
    name: string
    whatWereSeeing: string
    ourResponse: string
  }>
  marketTrends: string
  industryInfo: string
  keyProjects: string
  distributionUpdates: string
  challengesBlockers: string
  eventsAttended: string
  marketingCampaigns: string
  photos: Array<{ id: string; filename: string; url: string }>
  goodJobs: Array<{ id: string; personName: string; reason: string }>
}

interface Props {
  report: SingleReportData
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#0ea5e9',
    marginBottom: 16,
  },
  metaGrid: {
    marginBottom: 14,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  metaRow: {
    marginBottom: 3,
  },
  label: {
    fontSize: 9,
    color: '#6b7280',
  },
  value: {
    fontSize: 10,
    color: '#111827',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0284c7',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  line: {
    marginBottom: 4,
    lineHeight: 1.4,
  },
  row: {
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
})

const formatMonth = (month: string) => {
  if (!month) return ''
  return new Date(`${month}-01`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0)

export function SingleReportPDF({ report }: Props) {
  const namedRepFirms = report.repFirms.filter(firm => firm.name)
  const namedCompetitors = report.competitors.filter(competitor => competitor.name)
  const namedWins = report.wins.filter(win => win.title)
  const namedGoodJobs = report.goodJobs.filter(goodJob => goodJob.personName)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Regional Sales Director Monthly Report</Text>
        <Text style={styles.subtitle}>{formatMonth(report.month)}</Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaRow}>
            <Text style={styles.label}>Director</Text>
            <Text style={styles.value}>{report.directorName || 'N/A'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.label}>Region</Text>
            <Text style={styles.value}>{report.region || 'N/A'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{report.email || 'N/A'}</Text>
          </View>
        </View>

        {report.executiveSummary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.line}>{report.executiveSummary}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regional Performance</Text>
          <Text style={styles.line}>Monthly Sales: {formatCurrency(report.monthlySales)} (Goal: {formatCurrency(report.monthlyGoal)})</Text>
          <Text style={styles.line}>YTD Sales: {formatCurrency(report.ytdSales)} (Goal: {formatCurrency(report.ytdGoal)})</Text>
          <Text style={styles.line}>Open Orders: {formatCurrency(report.openOrders)} | Pipeline: {formatCurrency(report.pipeline)}</Text>
        </View>

        {namedRepFirms.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sales Channel Performance</Text>
            {namedRepFirms.map(firm => (
              <View key={firm.id} style={styles.row}>
                <Text style={styles.line}>{firm.name} ({firm.entityType})</Text>
                <Text style={styles.line}>
                  Monthly: {formatCurrency(firm.monthlySales)} | YTD: {formatCurrency(firm.ytdSales)} | % to Goal: {firm.percentToGoal}% | YoY: {firm.yoyGrowth}%
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {namedWins.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wins & Highlights</Text>
            {namedWins.map(win => (
              <View key={win.id} style={styles.row}>
                <Text style={styles.line}>{win.title}</Text>
                {win.description ? <Text style={styles.line}>{win.description}</Text> : null}
              </View>
            ))}
            {report.followUps ? <Text style={styles.line}>Follow-ups: {report.followUps}</Text> : null}
          </View>
        ) : null}

        {namedCompetitors.length > 0 || report.marketTrends || report.industryInfo ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Competition & Industry</Text>
            {namedCompetitors.map(competitor => (
              <View key={competitor.id} style={styles.row}>
                <Text style={styles.line}>{competitor.name}</Text>
                {competitor.whatWereSeeing ? <Text style={styles.line}>What We&apos;re Seeing: {competitor.whatWereSeeing}</Text> : null}
                {competitor.ourResponse ? <Text style={styles.line}>Our Response: {competitor.ourResponse}</Text> : null}
              </View>
            ))}
            {report.marketTrends ? <Text style={styles.line}>Market Trends: {report.marketTrends}</Text> : null}
            {report.industryInfo ? <Text style={styles.line}>Industry Info: {report.industryInfo}</Text> : null}
          </View>
        ) : null}

        {(report.keyProjects || report.distributionUpdates || report.challengesBlockers) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Initiatives</Text>
            {report.keyProjects ? <Text style={styles.line}>Key Projects: {report.keyProjects}</Text> : null}
            {report.distributionUpdates ? <Text style={styles.line}>Distribution Updates: {report.distributionUpdates}</Text> : null}
            {report.challengesBlockers ? <Text style={styles.line}>Challenges & Blockers: {report.challengesBlockers}</Text> : null}
          </View>
        ) : null}

        {(report.eventsAttended || report.marketingCampaigns) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Marketing & Events</Text>
            {report.eventsAttended ? <Text style={styles.line}>Events Attended: {report.eventsAttended}</Text> : null}
            {report.marketingCampaigns ? <Text style={styles.line}>Marketing Campaigns: {report.marketingCampaigns}</Text> : null}
          </View>
        ) : null}

        {(namedGoodJobs.length > 0 || report.photos.length > 0) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recognition & Photos</Text>
            {namedGoodJobs.map(goodJob => (
              <Text key={goodJob.id} style={styles.line}>
                Good Job: {goodJob.personName}{goodJob.reason ? ` - ${goodJob.reason}` : ''}
              </Text>
            ))}
            {report.photos.length > 0 ? (
              <Text style={styles.line}>
                Photos: {report.photos.map(photo => photo.filename).join(', ')}
              </Text>
            ) : null}
          </View>
        ) : null}
      </Page>
    </Document>
  )
}
