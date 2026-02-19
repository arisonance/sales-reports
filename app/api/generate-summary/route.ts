import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY

const anthropic = apiKey ? new Anthropic({ apiKey }) : null

interface ReportData {
  directorName: string
  region: string
  month: string
  wins: Array<{ title: string; description: string }>
  followUps: string
  monthlySales: number
  monthlyGoal: number
  ytdSales: number
  ytdGoal: number
  openOrders: number
  pipeline: number
  repFirms: Array<{
    name: string
    monthlySales: number
    ytdSales: number
    percentToGoal: number
    yoyGrowth: number
  }>
  competitors: Array<{
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
  goodJobs: Array<{ personName: string; reason: string }>
}

function formatReportForPrompt(data: ReportData): string {
  const sections: string[] = []

  // Basic info
  sections.push(`Report by: ${data.directorName}`)
  sections.push(`Region: ${data.region}`)
  sections.push(`Month: ${data.month}`)

  // Wins & Highlights
  const validWins = data.wins.filter(w => w.title || w.description)
  if (validWins.length > 0) {
    sections.push('\n## Wins & Highlights')
    validWins.forEach(win => {
      if (win.title) sections.push(`- ${win.title}: ${win.description || ''}`)
    })
  }

  // Follow Ups
  if (data.followUps) {
    sections.push('\n## Working On & Follow Ups')
    sections.push(data.followUps)
  }

  // Sales Performance
  if (data.monthlySales || data.ytdSales || data.pipeline) {
    sections.push('\n## Sales Performance')
    if (data.monthlySales) sections.push(`- Monthly Sales: $${data.monthlySales.toLocaleString()}`)
    if (data.monthlyGoal) sections.push(`- Monthly Goal: $${data.monthlyGoal.toLocaleString()}`)
    if (data.ytdSales) sections.push(`- YTD Sales: $${data.ytdSales.toLocaleString()}`)
    if (data.ytdGoal) sections.push(`- YTD Goal: $${data.ytdGoal.toLocaleString()}`)
    if (data.openOrders) sections.push(`- Open Orders: $${data.openOrders.toLocaleString()}`)
    if (data.pipeline) sections.push(`- Pipeline: $${data.pipeline.toLocaleString()}`)
  }

  // Rep Firms
  const validRepFirms = data.repFirms.filter(r => r.name)
  if (validRepFirms.length > 0) {
    sections.push('\n## Rep Firm Performance')
    validRepFirms.forEach(firm => {
      sections.push(`- ${firm.name}: Monthly $${firm.monthlySales.toLocaleString()}, YTD $${firm.ytdSales.toLocaleString()}, ${firm.percentToGoal}% to goal, ${firm.yoyGrowth}% YoY growth`)
    })
  }

  // Competition
  const validCompetitors = data.competitors.filter(c => c.name || c.whatWereSeeing)
  if (validCompetitors.length > 0) {
    sections.push('\n## Competitive Intelligence')
    validCompetitors.forEach(comp => {
      if (comp.name) sections.push(`- ${comp.name}: ${comp.whatWereSeeing || ''} ${comp.ourResponse ? `(Our response: ${comp.ourResponse})` : ''}`)
    })
  }

  // Market Trends
  if (data.marketTrends) {
    sections.push('\n## Market Trends')
    sections.push(data.marketTrends)
  }

  // Industry Info
  if (data.industryInfo) {
    sections.push('\n## Industry Info')
    sections.push(data.industryInfo)
  }

  // Key Initiatives
  if (data.keyProjects || data.distributionUpdates || data.challengesBlockers) {
    sections.push('\n## Key Initiatives')
    if (data.keyProjects) sections.push(`Key Projects: ${data.keyProjects}`)
    if (data.distributionUpdates) sections.push(`Distribution Updates: ${data.distributionUpdates}`)
    if (data.challengesBlockers) sections.push(`Challenges/Blockers: ${data.challengesBlockers}`)
  }

  // Marketing & Events
  if (data.eventsAttended || data.marketingCampaigns) {
    sections.push('\n## Marketing & Events')
    if (data.eventsAttended) sections.push(`Events Attended: ${data.eventsAttended}`)
    if (data.marketingCampaigns) sections.push(`Marketing Campaigns: ${data.marketingCampaigns}`)
  }

  // Good Jobs / Recognition
  const validGoodJobs = data.goodJobs.filter(g => g.personName)
  if (validGoodJobs.length > 0) {
    sections.push('\n## Peer Recognition')
    validGoodJobs.forEach(gj => {
      sections.push(`- ${gj.personName}: ${gj.reason || ''}`)
    })
  }

  return sections.join('\n')
}

export async function POST(request: NextRequest) {
  try {
    if (!anthropic) {
      console.error('ANTHROPIC_API_KEY is not configured')
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact your administrator.' },
        { status: 503 }
      )
    }

    const reportData: ReportData = await request.json()

    const formattedReport = formatReportForPrompt(reportData)

    // Check if there's meaningful content to summarize
    if (formattedReport.split('\n').length < 5) {
      return NextResponse.json(
        { error: 'Please add more content to your report before generating a summary.' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are helping a Sonance regional sales director create an executive summary for their monthly field report. Sonance is a premium audio company known for architectural speakers and professional audio solutions.

Based on the following report content, write a concise 3-5 sentence executive summary that:
1. Highlights the most important wins and achievements
2. Summarizes key sales performance (if data provided)
3. Notes any significant competitive intelligence or market trends
4. Mentions priority follow-ups or initiatives

Write in a professional, confident tone. Be specific about numbers and company names when available. Do not use bullet points - write in flowing paragraph form.

Here is the report content:

${formattedReport}`
        }
      ]
    })

    // Extract text from response
    const textContent = message.content.find(block => block.type === 'text')
    const summary = textContent ? textContent.text : ''

    return NextResponse.json({ summary })
  } catch (error: unknown) {
    console.error('Error generating summary:', error)

    // Surface specific Anthropic API errors
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as { status: number; message?: string }
      if (apiError.status === 401) {
        return NextResponse.json(
          { error: 'AI service authentication failed. Please contact your administrator.' },
          { status: 503 }
        )
      }
      if (apiError.status === 429) {
        return NextResponse.json(
          { error: 'AI service is temporarily busy. Please wait a moment and try again.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again.' },
      { status: 500 }
    )
  }
}
