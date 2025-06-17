import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Save
} from 'lucide-react';
import { database } from '../data/database';
import { ParkingSpot } from '../types';

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'blocked' | 'maintenance';
  reason?: string;
  slotsAffected: number;
}

interface WeeklySchedule {
  [key: string]: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export const ManageAvailability: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false);
  const [newBlock, setNewBlock] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    status: 'blocked' as 'blocked' | 'maintenance',
    reason: '',
    slotsAffected: 1
  });

  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: { enabled: true, startTime: '08:00', endTime: '18:00' },
    tuesday: { enabled: true, startTime: '08:00', endTime: '18:00' },
    wednesday: { enabled: true, startTime: '08:00', endTime: '18:00' },
    thursday: { enabled: true, startTime: '08:00', endTime: '18:00' },
    friday: { enabled: true, startTime: '08:00', endTime: '18:00' },
    saturday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    sunday: { enabled: false, startTime: '10:00', endTime: '16:00' }
  });

  // Mock time slots data
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (id) {
      loadSpotData();
    }
  }, [id]);

  const loadSpotData = async () => {
    try {
      const spotData = await database.getParkingSpotById(id!);
      setSpot(spotData);
      
      // Load existing time slots (in real app, this would come from database)
      const mockSlots: TimeSlot[] = [
        {
          id: '1',
          date: '2024-01-20',
          startTime: '14:00',
          endTime: '16:00',
          status: 'blocked',
          reason: 'Private event',
          slotsAffected: 10
        },
        {
          id: '2',
          date: '2024-01-22',
          startTime: '08:00',
          endTime: '12:00',
          status: 'maintenance',
          reason: 'Cleaning and maintenance',
          slotsAffected: 25
        }
      ];
      setTimeSlots(mockSlots);
    } catch (error) {
      console.error('Error loading spot data:', error);
    }
  };

  if (!spot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading availability settings...</p>
        </div>
      </div>
    );
  }

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      ...newBlock
    };
    setTimeSlots(prev => [...prev, newSlot]);
    setNewBlock({
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      status: 'blocked',
      reason: '',
      slotsAffected: 1
    });
    setShowAddBlock(false);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (confirm('Are you sure you want to remove this time block?')) {
      setTimeSlots(prev => prev.filter(slot => slot.id !== blockId));
    }
  };

  const handleWeeklyScheduleChange = (day: string, field: string, value: any) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const saveWeeklySchedule = () => {
    // In real app, save to database
    console.log('Saving weekly schedule:', weeklySchedule);
    alert('Weekly schedule saved successfully!');
    setShowWeeklySchedule(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'blocked': return <XCircle className="h-4 w-4" />;
      case 'maintenance': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredSlots = timeSlots.filter(slot => slot.date === selectedDate);

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday', 
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Availability
            </h1>
            <p className="text-gray-600 mb-4">
              {spot.name} - Control when your parking spots are available
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">Total Slots: {spot.totalSlots}</p>
                  <p className="text-sm text-blue-700">Currently Available: {spot.availableSlots}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.round(((spot.totalSlots - spot.availableSlots) / spot.totalSlots) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowWeeklySchedule(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Weekly Schedule</span>
            </button>
            <button
              onClick={() => setShowAddBlock(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Block Time</span>
            </button>
          </div>

          {/* Date Selector */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <Calendar className="h-5 w-5 text-gray-600" />
              <label className="block text-sm font-medium text-gray-700">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Time Blocks for Selected Date */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Time Blocks for {new Date(selectedDate).toLocaleDateString()}
            </h3>
            
            {filteredSlots.length > 0 ? (
              <div className="space-y-4">
                {filteredSlots.map((slot) => (
                  <div key={slot.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(slot.status)}`}>
                          {getStatusIcon(slot.status)}
                          <span className="capitalize">{slot.status}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {slot.slotsAffected} slots affected
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBlock(slot.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {slot.reason && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Reason:</strong> {slot.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No time blocks set for this date</p>
                <p className="text-sm">All slots are available during operating hours</p>
              </div>
            )}
          </div>

          {/* All Time Blocks */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Upcoming Time Blocks
            </h3>
            
            {timeSlots.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Slots</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Reason</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot) => (
                      <tr key={slot.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{new Date(slot.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{slot.startTime} - {slot.endTime}</td>
                        <td className="py-3 px-4">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.status)}`}>
                            {getStatusIcon(slot.status)}
                            <span className="capitalize">{slot.status}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{slot.slotsAffected}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{slot.reason || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                              <Edit className="h-4 w-4 text-gray-500" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBlock(slot.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No time blocks configured</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Schedule Modal */}
        {showWeeklySchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Weekly Operating Schedule</h3>
                  <button
                    onClick={() => setShowWeeklySchedule(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(dayNames).map(([key, dayName]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={weeklySchedule[key].enabled}
                            onChange={(e) => handleWeeklyScheduleChange(key, 'enabled', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="font-medium text-gray-900">{dayName}</span>
                        </div>
                        {weeklySchedule[key].enabled && (
                          <span className="text-sm text-green-600 font-medium">Open</span>
                        )}
                      </div>
                      
                      {weeklySchedule[key].enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Opening Time
                            </label>
                            <input
                              type="time"
                              value={weeklySchedule[key].startTime}
                              onChange={(e) => handleWeeklyScheduleChange(key, 'startTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Closing Time
                            </label>
                            <input
                              type="time"
                              value={weeklySchedule[key].endTime}
                              onChange={(e) => handleWeeklyScheduleChange(key, 'endTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={() => setShowWeeklySchedule(false)}
                    className="flex-1 border border-gray-200 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveWeeklySchedule}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Schedule</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Block Modal */}
        {showAddBlock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Block Time Slot</h3>
                  <button
                    onClick={() => setShowAddBlock(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleAddBlock} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newBlock.date}
                      onChange={(e) => setNewBlock(prev => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newBlock.startTime}
                        onChange={(e) => setNewBlock(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newBlock.endTime}
                        onChange={(e) => setNewBlock(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={newBlock.status}
                      onChange={(e) => setNewBlock(prev => ({ ...prev, status: e.target.value as 'blocked' | 'maintenance' }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="blocked">Blocked</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slots Affected
                    </label>
                    <input
                      type="number"
                      value={newBlock.slotsAffected}
                      onChange={(e) => setNewBlock(prev => ({ ...prev, slotsAffected: parseInt(e.target.value) || 1 }))}
                      min="1"
                      max={spot.totalSlots}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={newBlock.reason}
                      onChange={(e) => setNewBlock(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                      placeholder="e.g., Private event, Cleaning, Repairs..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddBlock(false)}
                      className="flex-1 border border-gray-200 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add Block
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};