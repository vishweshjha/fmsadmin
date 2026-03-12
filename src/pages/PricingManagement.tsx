import { useState } from 'react'
import { Plus, Edit, Trash2, DollarSign, TrendingUp, MapPin } from 'lucide-react'

const services = [
  {
    id: 1,
    name: 'House Cleaning - Basic',
    basePrice: 500,
    city: 'Mumbai',
    surgeMultiplier: 1.5,
    providerCommission: 70,
    vendorCommission: 10,
    status: 'Active'
  },
  {
    id: 2,
    name: 'House Cleaning - Premium',
    basePrice: 1200,
    city: 'Mumbai',
    surgeMultiplier: 1.8,
    providerCommission: 75,
    vendorCommission: 12,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Plumbing Service',
    basePrice: 800,
    city: 'Delhi',
    surgeMultiplier: 2.0,
    providerCommission: 80,
    vendorCommission: 8,
    status: 'Active'
  },
  {
    id: 4,
    name: 'Electrical Repair',
    basePrice: 1500,
    city: 'Bangalore',
    surgeMultiplier: 1.6,
    providerCommission: 75,
    vendorCommission: 10,
    status: 'Active'
  },
]

const surgeRules = [
  {
    id: 1,
    name: 'Peak Hours (9 AM - 6 PM)',
    multiplier: 1.5,
    days: 'Mon-Fri',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Weekend Surge',
    multiplier: 1.8,
    days: 'Sat-Sun',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Holiday Surge',
    multiplier: 2.0,
    days: 'Public Holidays',
    status: 'Active'
  },
]

export default function PricingManagement() {
  const [activeTab, setActiveTab] = useState<'services' | 'surge' | 'commission'>('services')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pricing & Commission Management</h1>
          <p className="text-gray-500 mt-1">Configure pricing rules and commission structures</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Plus size={18} />
          Add New Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Services</p>
              <p className="text-3xl font-bold mt-2">24</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Pricing Rules</p>
              <p className="text-3xl font-bold mt-2">18</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Provider Commission</p>
              <p className="text-3xl font-bold mt-2">75%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Cities Configured</p>
              <p className="text-3xl font-bold mt-2">12</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <MapPin size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'services'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Service Pricing
            </button>
            <button
              onClick={() => setActiveTab('surge')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'surge'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Surge Pricing Rules
            </button>
            <button
              onClick={() => setActiveTab('commission')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'commission'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Commission Structure
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Base Price (₹)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Surge Multiplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider Commission (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor Commission (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{service.city}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₹{service.basePrice}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{service.surgeMultiplier}x</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{service.providerCommission}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{service.vendorCommission}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {service.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Edit size={18} />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'surge' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rule Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Multiplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {surgeRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{rule.multiplier}x</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{rule.days}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {rule.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Edit size={18} />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'commission' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Default Commission Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provider Commission (%)
                    </label>
                    <input
                      type="number"
                      defaultValue={75}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Commission (%)
                    </label>
                    <input
                      type="number"
                      defaultValue={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <button className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                  Update Default Commission
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
