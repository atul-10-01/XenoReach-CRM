import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, subHours } from 'date-fns';

const COLORS = ['#15803d', '#EF4444', '#F59E0B'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}{entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DatePresetButton = ({ label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
      active
        ? 'bg-blue-100 text-blue-700 border border-blue-200'
        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
    }`}
  >
    {label}
  </button>
);

export default function CampaignHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [activePreset, setActivePreset] = useState('30d');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/analytics/campaigns', {
        params: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd')
        }
      });
      setData(response.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching campaign stats');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const handlePresetClick = (preset) => {
    setActivePreset(preset);
    const now = new Date();
    switch (preset) {
      case '24h':
        setStartDate(subHours(now, 24));
        break;
      case '7d':
        setStartDate(subDays(now, 7));
        break;
      case '30d':
        setStartDate(subDays(now, 30));
        break;
      default:
        break;
    }
    setEndDate(now);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Calculate total stats for pie chart
  const totalStats = data.reduce((acc, campaign) => ({
    sent: acc.sent + campaign.sent,
    failed: acc.failed + campaign.failed,
    pending: acc.pending + campaign.pending
  }), { sent: 0, failed: 0, pending: 0 });

  const pieData = [
    { name: 'Sent', value: totalStats.sent },
    { name: 'Failed', value: totalStats.failed },
    { name: 'Pending', value: totalStats.pending }
  ];

  return (
    <div className="p-2 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8 gap-4">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">📊 Campaign Analytics</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <DatePresetButton
                label="Last 24 Hours"
                onClick={() => handlePresetClick('24h')}
                active={activePreset === '24h'}
              />
              <DatePresetButton
                label="Last 7 Days"
                onClick={() => handlePresetClick('7d')}
                active={activePreset === '7d'}
              />
              <DatePresetButton
                label="Last 30 Days"
                onClick={() => handlePresetClick('30d')}
                active={activePreset === '30d'}
              />
            </div>
            <div className="flex gap-2">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    setActivePreset(null);
                  }}
                  maxDate={endDate}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date) => {
                    setEndDate(date);
                    setActivePreset(null);
                  }}
                  minDate={startDate}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </LocalizationProvider>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-2">
          {/* Success Rate Chart */}
          <div className="bg-white p-2 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-800">Success Rate Over Time</h2>
            <div className="h-[250px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 13 }}
                  />
                  <YAxis unit="%" tick={{ fontSize: 13 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 14, marginTop: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#15803d" 
                    name="Success Rate" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Message Status Distribution Pie Chart */}
          <div className="bg-white p-2 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-800">Overall Message Status</h2>
            <div className="h-[250px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, x, y }) => (
                      <text
                        x={x}
                        y={y - 10}
                        fill="#333"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={14}
                      >
                        {`${name} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    )}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 14, marginTop: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sent vs Failed Chart */}
          <div className="bg-white p-2 sm:p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-800">Message Status Distribution</h2>
            <div className="h-[250px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barCategoryGap={24}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 13 }}
                  />
                  <YAxis tick={{ fontSize: 13 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 14, marginTop: 8 }}
                  />
                  <Bar dataKey="sent" fill="#15803d" name="Sent" />
                  <Bar dataKey="failed" fill="#EF4444" name="Failed" />
                  <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Campaign Stats Table */}
        <div className="mt-4 sm:mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="p-2 sm:p-6">
            <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-800">Campaign Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs sm:text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((campaign) => (
                    <tr key={campaign.campaignId} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{campaign.name}</td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{campaign.segmentName}</td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{campaign.total}</td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{campaign.sent}</td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{campaign.failed}</td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{campaign.pending}</td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.successRate >= 90 ? 'bg-green-100 text-green-800' :
                          campaign.successRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {campaign.successRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 