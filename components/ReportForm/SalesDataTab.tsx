'use client'

import { ReportData } from '@/app/report/page'

interface Props {
  data: ReportData
  updateData: (updates: Partial<ReportData>) => void
}

export default function SalesDataTab({ data, updateData }: Props) {
  const addRepFirm = () => {
    const newRepFirm = {
      id: Date.now().toString(),
      name: '',
      monthlySales: 0,
      ytdSales: 0,
      percentToGoal: 0,
      yoyGrowth: 0,
    }
    updateData({ repFirms: [...data.repFirms, newRepFirm] })
  }

  const updateRepFirm = (id: string, field: string, value: string | number) => {
    const updatedRepFirms = data.repFirms.map((firm) =>
      firm.id === id ? { ...firm, [field]: value } : firm
    )
    updateData({ repFirms: updatedRepFirms })
  }

  const removeRepFirm = (id: string) => {
    if (data.repFirms.length <= 1) return
    updateData({ repFirms: data.repFirms.filter((firm) => firm.id !== id) })
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US')
  }

  const parseNumber = (value: string) => {
    return parseInt(value.replace(/,/g, '')) || 0
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#333F48] uppercase tracking-wide">Regional Performance</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
            Monthly Sales ($)
          </label>
          <input
            type="text"
            value={formatNumber(data.monthlySales)}
            onChange={(e) => updateData({ monthlySales: parseNumber(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
            Monthly Goal ($)
          </label>
          <input
            type="text"
            value={formatNumber(data.monthlyGoal)}
            onChange={(e) => updateData({ monthlyGoal: parseNumber(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
            YTD Sales ($)
          </label>
          <input
            type="text"
            value={formatNumber(data.ytdSales)}
            onChange={(e) => updateData({ ytdSales: parseNumber(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
            YTD Goal ($)
          </label>
          <input
            type="text"
            value={formatNumber(data.ytdGoal)}
            onChange={(e) => updateData({ ytdGoal: parseNumber(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
            Open Orders ($)
          </label>
          <input
            type="text"
            value={formatNumber(data.openOrders)}
            onChange={(e) => updateData({ openOrders: parseNumber(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
            Pipeline ($)
          </label>
          <input
            type="text"
            value={formatNumber(data.pipeline)}
            onChange={(e) => updateData({ pipeline: parseNumber(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
          />
        </div>
      </div>

      <div className="border-t border-[#D9D9D6] pt-6">
        <h2 className="text-xl font-bold text-[#333F48] mb-4 uppercase tracking-wide">Rep Firm Performance</h2>

        {data.repFirms.map((firm, index) => (
          <div key={firm.id} className="bg-[#00A3E1]/10 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-[#333F48] uppercase tracking-wide">Rep Firm #{index + 1}</span>
              {data.repFirms.length > 1 && (
                <button
                  onClick={() => removeRepFirm(firm.id)}
                  className="text-red-500 hover:text-red-700 text-sm uppercase tracking-wide"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
                  Rep Firm Name
                </label>
                <input
                  type="text"
                  value={firm.name}
                  onChange={(e) => updateRepFirm(firm.id, 'name', e.target.value)}
                  placeholder="e.g., Pro Tech"
                  className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
                  Monthly Sales ($)
                </label>
                <input
                  type="text"
                  value={formatNumber(firm.monthlySales)}
                  onChange={(e) => updateRepFirm(firm.id, 'monthlySales', parseNumber(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
                  YTD Sales ($)
                </label>
                <input
                  type="text"
                  value={formatNumber(firm.ytdSales)}
                  onChange={(e) => updateRepFirm(firm.id, 'ytdSales', parseNumber(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
                  % to Goal
                </label>
                <input
                  type="number"
                  value={firm.percentToGoal}
                  onChange={(e) => updateRepFirm(firm.id, 'percentToGoal', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#333F48] mb-1 uppercase tracking-wide">
                  YoY Growth %
                </label>
                <input
                  type="number"
                  value={firm.yoyGrowth}
                  onChange={(e) => updateRepFirm(firm.id, 'yoyGrowth', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg bg-white text-[#333F48] focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1]"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addRepFirm}
          className="px-4 py-2 bg-[#00B2A9] text-white rounded-lg hover:bg-[#009990] transition-colors font-semibold uppercase tracking-wide"
        >
          + Add Another Rep Firm
        </button>
      </div>
    </div>
  )
}
