import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { octoberReports } from '@/lib/test-data/october-reports'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface Photo {
  id: string
  url: string
  filename: string
  caption?: string
}

interface FullReport {
  id: string
  month: string
  executive_summary: string
  directors: { name: string; region: string; email: string }
  wins: Array<{ title: string; description: string }>
  repFirms: Array<{
    name: string
    monthly_sales: number
    ytd_sales: number
    percent_to_goal: number
    yoy_growth: number
  }>
  competitors: Array<{
    name: string
    what_were_seeing: string
    our_response: string
  }>
  regionalPerformance: {
    monthly_sales: number
    monthly_goal: number
    ytd_sales: number
    ytd_goal: number
    open_orders: number
    pipeline: number
  } | null
  keyInitiatives: {
    key_projects: string
    distribution_updates: string
    challenges_blockers: string
  } | null
  marketingEvents: {
    events_attended: string
    marketing_campaigns: string
  } | null
  marketTrends: string
  followUps: string
  photos: Photo[]
}

async function fetchFullReport(reportId: string): Promise<FullReport | null> {
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select(`
      *,
      directors (id, name, region, email)
    `)
    .eq('id', reportId)
    .single()

  if (reportError || !report) return null

  const [
    { data: wins },
    { data: repFirms },
    { data: competitors },
    { data: regionalPerformance },
    { data: keyInitiatives },
    { data: marketingEvents },
    { data: marketTrends },
    { data: followUps },
    { data: photos }
  ] = await Promise.all([
    supabase.from('wins').select('*').eq('report_id', reportId),
    supabase.from('rep_firms').select('*').eq('report_id', reportId),
    supabase.from('competitors').select('*').eq('report_id', reportId),
    supabase.from('regional_performance').select('*').eq('report_id', reportId).single(),
    supabase.from('key_initiatives').select('*').eq('report_id', reportId).single(),
    supabase.from('marketing_events').select('*').eq('report_id', reportId).single(),
    supabase.from('market_trends').select('*').eq('report_id', reportId).single(),
    supabase.from('follow_ups').select('*').eq('report_id', reportId).single(),
    supabase.from('photos').select('*').eq('report_id', reportId)
  ])

  return {
    ...report,
    wins: wins || [],
    repFirms: repFirms || [],
    competitors: competitors || [],
    regionalPerformance: regionalPerformance || null,
    keyInitiatives: keyInitiatives || null,
    marketingEvents: marketingEvents || null,
    marketTrends: marketTrends?.observations || '',
    followUps: followUps?.content || '',
    photos: photos || []
  }
}

// Convert test report to FullReport format
function getTestReport(testId: string): FullReport | null {
  const idx = parseInt(testId.replace('test-', ''))
  const testReport = octoberReports[idx]
  if (!testReport) return null

  return {
    id: testId,
    month: testReport.month,
    executive_summary: testReport.executiveSummary,
    directors: {
      name: testReport.directorName,
      region: testReport.region,
      email: '',
    },
    wins: testReport.wins.map(w => ({ title: w.title, description: w.description })),
    repFirms: [],
    competitors: testReport.competitors.map(c => ({
      name: c.name,
      what_were_seeing: c.whatWereSeeing,
      our_response: c.ourResponse,
    })),
    regionalPerformance: {
      monthly_sales: testReport.monthlySales,
      monthly_goal: testReport.monthlyGoal,
      ytd_sales: testReport.ytdSales,
      ytd_goal: testReport.ytdGoal,
      open_orders: testReport.openOrders,
      pipeline: testReport.pipeline,
    },
    keyInitiatives: {
      key_projects: testReport.keyProjects,
      distribution_updates: '',
      challenges_blockers: '',
    },
    marketingEvents: {
      events_attended: testReport.eventsAttended,
      marketing_campaigns: testReport.marketingCampaigns,
    },
    marketTrends: testReport.marketTrends,
    followUps: testReport.followUps,
    photos: [],
  }
}

function formatReportsForPrompt(reports: FullReport[], periodType: string, periodValue: string): string {
  const sections: string[] = []

  // Header
  const periodLabel = periodType === 'quarter'
    ? periodValue.replace('-', ' ')
    : new Date(periodValue + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  sections.push(`# Sonance Field Team Reports - ${periodLabel}`)
  sections.push(`\nTotal Reports: ${reports.length}\n`)

  // Aggregate metrics
  let totalMonthlySales = 0
  let totalMonthlyGoal = 0
  let totalYtdSales = 0
  let totalYtdGoal = 0
  let totalPipeline = 0
  let totalOpenOrders = 0

  reports.forEach(report => {
    if (report.regionalPerformance) {
      totalMonthlySales += report.regionalPerformance.monthly_sales || 0
      totalMonthlyGoal += report.regionalPerformance.monthly_goal || 0
      totalYtdSales += report.regionalPerformance.ytd_sales || 0
      totalYtdGoal += report.regionalPerformance.ytd_goal || 0
      totalPipeline += report.regionalPerformance.pipeline || 0
      totalOpenOrders += report.regionalPerformance.open_orders || 0
    }
  })

  sections.push('## Aggregate Sales Metrics')
  sections.push(`- Total Monthly Sales: $${totalMonthlySales.toLocaleString()}`)
  sections.push(`- Total Monthly Goal: $${totalMonthlyGoal.toLocaleString()}`)
  sections.push(`- Total YTD Sales: $${totalYtdSales.toLocaleString()}`)
  sections.push(`- Total YTD Goal: $${totalYtdGoal.toLocaleString()}`)
  sections.push(`- Total Pipeline: $${totalPipeline.toLocaleString()}`)
  sections.push(`- Total Open Orders: $${totalOpenOrders.toLocaleString()}`)

  // Individual reports
  reports.forEach(report => {
    const director = report.directors
    sections.push(`\n---\n## ${director.name} (${director.region})`)

    // Executive Summary
    if (report.executive_summary) {
      sections.push(`\n### Executive Summary`)
      sections.push(report.executive_summary)
    }

    // Wins
    const validWins = report.wins.filter(w => w.title)
    if (validWins.length > 0) {
      sections.push(`\n### Wins & Highlights`)
      validWins.forEach(win => {
        sections.push(`- **${win.title}**: ${win.description || ''}`)
      })
    }

    // Sales Performance
    if (report.regionalPerformance) {
      const rp = report.regionalPerformance
      sections.push(`\n### Regional Performance`)
      sections.push(`- Monthly: $${(rp.monthly_sales || 0).toLocaleString()} / $${(rp.monthly_goal || 0).toLocaleString()} goal`)
      sections.push(`- YTD: $${(rp.ytd_sales || 0).toLocaleString()} / $${(rp.ytd_goal || 0).toLocaleString()} goal`)
      if (rp.pipeline) sections.push(`- Pipeline: $${rp.pipeline.toLocaleString()}`)
      if (rp.open_orders) sections.push(`- Open Orders: $${rp.open_orders.toLocaleString()}`)
    }

    // Rep Firms
    const validRepFirms = report.repFirms.filter(r => r.name)
    if (validRepFirms.length > 0) {
      sections.push(`\n### Rep Firm Performance`)
      validRepFirms.forEach(firm => {
        sections.push(`- ${firm.name}: Monthly $${(firm.monthly_sales || 0).toLocaleString()}, ${firm.percent_to_goal || 0}% to goal, ${firm.yoy_growth || 0}% YoY`)
      })
    }

    // Competition
    const validCompetitors = report.competitors.filter(c => c.name || c.what_were_seeing)
    if (validCompetitors.length > 0) {
      sections.push(`\n### Competitive Intelligence`)
      validCompetitors.forEach(comp => {
        if (comp.name) {
          sections.push(`- **${comp.name}**: ${comp.what_were_seeing || ''}`)
          if (comp.our_response) sections.push(`  - Our response: ${comp.our_response}`)
        }
      })
    }

    // Market Trends
    if (report.marketTrends) {
      sections.push(`\n### Market Trends`)
      sections.push(report.marketTrends)
    }

    // Key Initiatives
    if (report.keyInitiatives) {
      const ki = report.keyInitiatives
      if (ki.key_projects || ki.distribution_updates || ki.challenges_blockers) {
        sections.push(`\n### Key Initiatives`)
        if (ki.key_projects) sections.push(`- Projects: ${ki.key_projects}`)
        if (ki.distribution_updates) sections.push(`- Distribution: ${ki.distribution_updates}`)
        if (ki.challenges_blockers) sections.push(`- Challenges: ${ki.challenges_blockers}`)
      }
    }

    // Follow-ups
    if (report.followUps) {
      sections.push(`\n### Working On / Follow-ups`)
      sections.push(report.followUps)
    }
  })

  return sections.join('\n')
}

// Fetch image as base64
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mediaType: string } | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Determine media type from URL or content-type
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const mediaType = contentType.split(';')[0].trim()

    return { base64, mediaType }
  } catch (error) {
    console.error('Failed to fetch image:', url, error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { reportIds, periodType, periodValue } = await request.json()

    if (!reportIds || reportIds.length === 0) {
      return NextResponse.json(
        { error: 'No reports selected' },
        { status: 400 }
      )
    }

    // Fetch all selected reports - handle both real and test reports
    const reportPromises = reportIds.map((id: string) => {
      if (id.startsWith('test-')) {
        // Return test report synchronously wrapped in Promise
        return Promise.resolve(getTestReport(id))
      }
      return fetchFullReport(id)
    })
    const reports = (await Promise.all(reportPromises)).filter(Boolean) as FullReport[]

    if (reports.length === 0) {
      return NextResponse.json(
        { error: 'No valid reports found' },
        { status: 400 }
      )
    }

    const formattedReports = formatReportsForPrompt(reports, periodType, periodValue)

    // Collect all photos from reports
    const allPhotos: Array<{ directorName: string; region: string; photo: Photo }> = []
    for (const report of reports) {
      if (report.photos && report.photos.length > 0) {
        for (const photo of report.photos) {
          allPhotos.push({
            directorName: report.directors.name,
            region: report.directors.region,
            photo
          })
        }
      }
    }

    // Build message content with images
    const messageContent: Anthropic.MessageCreateParams['messages'][0]['content'] = []

    // Add text prompt first
    const hasPhotos = allPhotos.length > 0
    const photoInstructions = hasPhotos
      ? `\n\nI'm also including ${allPhotos.length} photo(s) from the field reports. Review these images and if any are particularly noteworthy (showing significant wins, installations, events, or market presence), mention them in the summary under a "**Photo Highlights**" section. Describe what's shown and why it's significant. Only include photos that add value to the executive summary.`
      : ''

    messageContent.push({
      type: 'text',
      text: `You are helping Sonance sales leadership create a consolidated summary from multiple regional field reports. Sonance is a premium audio company known for architectural speakers and professional audio solutions.

Based on the following ${reports.length} field reports, respond with a JSON object containing structured data for a visually designed PDF report.

RESPONSE FORMAT (respond ONLY with valid JSON, no markdown code fences):
{
  "overview": "A 2-3 sentence executive highlight summarizing the most important takeaway from this period.",
  "performanceSummary": "A paragraph (3-5 sentences) summarizing overall sales performance, key metrics, and trends.",
  "topWins": [
    {
      "title": "Short title of the win",
      "value": "Dollar value if applicable (e.g., '$1.2M')",
      "region": "Region or director name",
      "description": "1-2 sentence description of why this win matters"
    }
  ],
  "competitorInsights": [
    {
      "competitor": "Competitor name",
      "threat": "high | medium | low",
      "observation": "What we're seeing from this competitor",
      "response": "Our strategic response"
    }
  ],
  "marketTrends": "A paragraph (2-4 sentences) summarizing key market observations and industry developments.",
  "initiatives": "A paragraph (2-3 sentences) summarizing key projects and any significant blockers.",
  "recommendations": [
    {
      "priority": 1,
      "title": "Short actionable recommendation title",
      "description": "1-2 sentence explanation of the recommendation"
    }
  ]${hasPhotos ? `,
  "photoHighlights": "A paragraph describing any noteworthy photos and their significance, or empty string if none are notable."` : ''}
}

IMPORTANT RULES:
- Respond ONLY with the JSON object, no additional text or markdown
- Include 3-5 top wins (most significant across all regions)
- Include 2-4 competitor insights (focus on meaningful competitive intelligence)
- Include 2-3 recommendations (prioritized 1, 2, 3)
- Be specific with numbers, company names, and regional context
- Write in a professional, executive-friendly tone
- Keep descriptions concise - this is for visual cards, not paragraphs

Here are the field reports:

${formattedReports}`
    })

    // Add photos as images (limit to 10 to avoid token limits)
    const photosToInclude = allPhotos.slice(0, 10)
    for (const { directorName, region, photo } of photosToInclude) {
      const imageData = await fetchImageAsBase64(photo.url)
      if (imageData) {
        // Add label for the image
        messageContent.push({
          type: 'text',
          text: `\n\n[Photo from ${directorName} (${region}): ${photo.filename}]`
        })
        // Add the image
        messageContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: imageData.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: imageData.base64
          }
        })
      }
    }

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: messageContent
        }
      ]
    })

    const textContent = message.content.find(block => block.type === 'text')
    const rawResponse = textContent ? textContent.text : '{}'

    // Parse JSON response
    let structured
    try {
      // Clean response - remove any markdown code fences if present
      let jsonStr = rawResponse.trim()
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7)
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3)
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3)
      }
      structured = JSON.parse(jsonStr.trim())
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      // Fallback: return the raw text as a legacy summary
      structured = {
        overview: '',
        performanceSummary: rawResponse,
        topWins: [],
        competitorInsights: [],
        marketTrends: '',
        initiatives: '',
        recommendations: [],
        photoHighlights: ''
      }
    }

    // Return structured data and photos for PDF rendering
    const photosForPdf = allPhotos.map(({ directorName, region, photo }) => ({
      id: photo.id,
      url: photo.url,
      filename: photo.filename,
      caption: photo.caption,
      directorName,
      region
    }))

    return NextResponse.json({ structured, photos: photosForPdf })
  } catch (error) {
    console.error('Error generating global summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again.' },
      { status: 500 }
    )
  }
}
