import { Search, Calendar, LayoutGrid, List } from 'lucide-react'
import { format } from 'date-fns'

export default function TopBar() {
  const today = new Date()
  
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar size={18} />
          <span className="text-sm font-medium">
            {format(today, 'EEEE, do MMMM')}
          </span>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button className="p-2 bg-gray-800 text-white rounded">
            <LayoutGrid size={18} />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
