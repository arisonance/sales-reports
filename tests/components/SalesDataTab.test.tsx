import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SalesDataTab from '@/components/ReportForm/SalesDataTab'
import type { ReportData, ChannelConfig } from '@/app/report/page'

const createMockData = (overrides?: Partial<ReportData>): ReportData => ({
  directorId: 'test-director',
  directorName: 'Test Director',
  region: 'West',
  email: 'test@test.com',
  month: '2026-02',
  executiveSummary: '',
  wins: [{ id: '1', title: '', description: '' }],
  followUps: '',
  monthlySales: 0,
  monthlyGoal: 0,
  ytdSales: 0,
  ytdGoal: 0,
  openOrders: 0,
  pipeline: 0,
  repFirms: [],
  competitors: [{ id: '1', name: '', whatWereSeeing: '', ourResponse: '' }],
  marketTrends: '',
  industryInfo: '',
  keyProjects: '',
  distributionUpdates: '',
  challengesBlockers: '',
  eventsAttended: '',
  marketingCampaigns: '',
  photos: [],
  goodJobs: [{ id: '1', personName: '', reason: '' }],
  ...overrides,
})

const repFirmConfig: ChannelConfig = {
  channel_types: ['rep_firm'],
  uses_direct_customers: false,
  entities: [],
  customers: [],
}

const directCustomerConfig: ChannelConfig = {
  channel_types: [],
  uses_direct_customers: true,
  entities: [],
  customers: [{ id: 'c1', name: 'Acme Corp' }],
}

describe('SalesDataTab', () => {
  describe('Regional Performance', () => {
    it('renders all 6 regional performance fields', () => {
      render(
        <SalesDataTab
          data={createMockData()}
          updateData={() => {}}
          channelConfig={repFirmConfig}
        />
      )

      // Some labels appear in both regional and entity sections, so use getAllByText
      expect(screen.getAllByText('Monthly Sales ($)').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Monthly Goal ($)')).toBeInTheDocument()
      expect(screen.getAllByText('YTD Sales ($)').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('YTD Goal ($)')).toBeInTheDocument()
      expect(screen.getByText('Open Orders ($)')).toBeInTheDocument()
      expect(screen.getByText('Pipeline ($)')).toBeInTheDocument()
    })

    it('displays formatted values for non-zero regional fields', () => {
      render(
        <SalesDataTab
          data={createMockData({ monthlySales: 50000, monthlyGoal: 100000 })}
          updateData={() => {}}
          channelConfig={repFirmConfig}
        />
      )

      const inputs = screen.getAllByRole('textbox')
      // First two textboxes are Monthly Sales and Monthly Goal
      expect(inputs[0]).toHaveValue('50,000')
      expect(inputs[1]).toHaveValue('100,000')
    })

    it('calls updateData when a regional field is edited', async () => {
      const user = userEvent.setup()
      const updateData = vi.fn()
      render(
        <SalesDataTab
          data={createMockData()}
          updateData={updateData}
          channelConfig={repFirmConfig}
        />
      )

      const inputs = screen.getAllByRole('textbox')
      const monthlySalesInput = inputs[0]
      await user.click(monthlySalesInput)
      await user.type(monthlySalesInput, '75000')
      await user.tab() // blur triggers onChange
      expect(updateData).toHaveBeenCalledWith({ monthlySales: 75000 })
    })
  })

  describe('Phantom entity fix', () => {
    it('renders empty section with phantom row when no entities exist', () => {
      render(
        <SalesDataTab
          data={createMockData({ repFirms: [] })}
          updateData={() => {}}
          channelConfig={repFirmConfig}
        />
      )

      expect(screen.getByText('Rep Firm #1')).toBeInTheDocument()
    })

    it('promotes phantom entity to real on name input', async () => {
      const user = userEvent.setup()
      const updateData = vi.fn()

      render(
        <SalesDataTab
          data={createMockData({ repFirms: [] })}
          updateData={updateData}
          channelConfig={repFirmConfig}
        />
      )

      const nameInput = screen.getByPlaceholderText(/e\.g\., Pro Tech/i)
      await user.type(nameInput, 'A')

      expect(updateData).toHaveBeenCalled()
      const lastCall = updateData.mock.calls[updateData.mock.calls.length - 1][0]
      expect(lastCall.repFirms).toHaveLength(1)
      expect(lastCall.repFirms[0].entityType).toBe('rep_firm')
      expect(lastCall.repFirms[0].name).toBe('A')
      // Should not have phantom ID
      expect(lastCall.repFirms[0].id).not.toMatch(/^empty-/)
    })

    it('promotes phantom entity on currency field blur', async () => {
      const user = userEvent.setup()
      const updateData = vi.fn()

      render(
        <SalesDataTab
          data={createMockData({ repFirms: [] })}
          updateData={updateData}
          channelConfig={repFirmConfig}
        />
      )

      // Find the entity Monthly Sales input (after the 6 regional ones)
      const allTextboxes = screen.getAllByRole('textbox')
      // Regional: 6, entity name: 1, entity monthly sales: 1, entity ytd sales: 1
      // The entity monthly sales is index 7
      const entityMonthlySales = allTextboxes[7]
      await user.click(entityMonthlySales)
      await user.type(entityMonthlySales, '5000')
      await user.tab()

      expect(updateData).toHaveBeenCalled()
      const calls = updateData.mock.calls
      const lastCall = calls[calls.length - 1][0]
      expect(lastCall.repFirms).toHaveLength(1)
      expect(lastCall.repFirms[0].monthlySales).toBe(5000)
      expect(lastCall.repFirms[0].id).not.toMatch(/^empty-/)
    })
  })

  describe('Entity management', () => {
    it('adds a new entity when clicking add button', async () => {
      const user = userEvent.setup()
      const updateData = vi.fn()
      const data = createMockData({
        repFirms: [{ id: '1', name: 'Firm A', monthlySales: 100, ytdSales: 500, percentToGoal: 50, yoyGrowth: 10, entityType: 'rep_firm' }],
      })

      render(
        <SalesDataTab
          data={data}
          updateData={updateData}
          channelConfig={repFirmConfig}
        />
      )

      const addButton = screen.getByText(/Add Another Rep Firm/i)
      await user.click(addButton)
      expect(updateData).toHaveBeenCalled()
      const call = updateData.mock.calls[0][0]
      expect(call.repFirms).toHaveLength(2)
      expect(call.repFirms[1].entityType).toBe('rep_firm')
    })

    it('does not show remove button when only one entity exists', () => {
      const data = createMockData({
        repFirms: [{ id: '1', name: 'Firm A', monthlySales: 0, ytdSales: 0, percentToGoal: 0, yoyGrowth: 0, entityType: 'rep_firm' }],
      })

      render(
        <SalesDataTab
          data={data}
          updateData={() => {}}
          channelConfig={repFirmConfig}
        />
      )

      expect(screen.queryByText('Remove')).not.toBeInTheDocument()
    })

    it('shows remove button when multiple entities exist', () => {
      const data = createMockData({
        repFirms: [
          { id: '1', name: 'Firm A', monthlySales: 0, ytdSales: 0, percentToGoal: 0, yoyGrowth: 0, entityType: 'rep_firm' },
          { id: '2', name: 'Firm B', monthlySales: 0, ytdSales: 0, percentToGoal: 0, yoyGrowth: 0, entityType: 'rep_firm' },
        ],
      })

      render(
        <SalesDataTab
          data={data}
          updateData={() => {}}
          channelConfig={repFirmConfig}
        />
      )

      expect(screen.getAllByText('Remove')).toHaveLength(2)
    })
  })

  describe('Channel configuration', () => {
    it('shows direct customer section when uses_direct_customers is true', () => {
      render(
        <SalesDataTab
          data={createMockData({ repFirms: [] })}
          updateData={() => {}}
          channelConfig={directCustomerConfig}
        />
      )

      expect(screen.getByText('Direct Customer Performance')).toBeInTheDocument()
    })

    it('shows all 3 entity types when no channels configured', () => {
      const noConfig: ChannelConfig = {
        channel_types: [],
        uses_direct_customers: false,
        entities: [],
        customers: [],
      }

      render(
        <SalesDataTab
          data={createMockData({ repFirms: [] })}
          updateData={() => {}}
          channelConfig={noConfig}
        />
      )

      expect(screen.getByText('Rep Firm Performance')).toBeInTheDocument()
      expect(screen.getByText('Distributor Performance')).toBeInTheDocument()
      expect(screen.getByText('Strategic Account Performance')).toBeInTheDocument()
    })

    it('shows customer dropdown when customers are configured', () => {
      render(
        <SalesDataTab
          data={createMockData({ repFirms: [] })}
          updateData={() => {}}
          channelConfig={directCustomerConfig}
        />
      )

      expect(screen.getByText(/Select Customer/)).toBeInTheDocument()
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
  })

  describe('Percentage fields', () => {
    it('renders percentage fields with step attribute', () => {
      const data = createMockData({
        repFirms: [{ id: '1', name: 'Firm A', monthlySales: 0, ytdSales: 0, percentToGoal: 0, yoyGrowth: 0, entityType: 'rep_firm' }],
      })

      render(
        <SalesDataTab
          data={data}
          updateData={() => {}}
          channelConfig={repFirmConfig}
        />
      )

      const numberInputs = screen.getAllByRole('spinbutton')
      expect(numberInputs).toHaveLength(2) // % to Goal + YoY Growth
      expect(numberInputs[0]).toHaveAttribute('step', '0.1')
      expect(numberInputs[1]).toHaveAttribute('step', '0.1')
    })

    it('shows empty for zero percentage values', () => {
      const data = createMockData({
        repFirms: [{ id: '1', name: 'Firm A', monthlySales: 0, ytdSales: 0, percentToGoal: 0, yoyGrowth: 0, entityType: 'rep_firm' }],
      })

      render(
        <SalesDataTab
          data={data}
          updateData={() => {}}
          channelConfig={repFirmConfig}
        />
      )

      const numberInputs = screen.getAllByRole('spinbutton')
      expect(numberInputs[0]).toHaveValue(null) // empty, not 0
      expect(numberInputs[1]).toHaveValue(null)
    })
  })
})
