import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Car, 
  MapPin,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { database } from '../data/database';
import { useAuth } from '../context/AuthContext';
import { Booking, ParkingSpot, User as UserType } from '../types';

export const AdminBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [spots, setSpots] = useState<{ [key: string]: ParkingSpot }>({});
  const [users, setUsers] = useState<{ [key: string]: UserType }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBookingsData();
    }
  }, [user]);

  const loadBookingsData = async () => {
    try {
      // Get all spots owned by this user
      const ownerSpots = await database.getParkingSpotsByOwner(user!.id);
      const spotIds = ownerSpots.map(spot => spot.id);
      
      // Get all bookings for these spots
      const allBookings = await database.getAllBookings();
      const ownerBookings = allBookings.filter(booking => spotIds.includes(booking.spotId));
      
      // Create spots lookup
      const spotsLookup: { [key: string]: ParkingSpot } = {};
      ownerSpots.forEach(spot => {
        spotsLookup[spot.id] = spot;
      });
      
      // Get user details for bookings
      const userIds = [...new Set(ownerBookings.map(b => b.userId))];
      const usersLookup: { [key: string]: UserType } = {};
      
      for (const userId of userIds) {
        const userData = await database.getUserById(userId);
        if (userData) {
          usersLookup[userId] = userData;
        }
      }
      
      setBookings(ownerBookings);
      setSpots(spotsLookup);
      setUsers(usersLookup);
    } catch (error) {
      console.error('Error loading bookings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const spot = spots[booking.spotId];
    const customer = users[booking.userId];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSpot = spot?.name.toLowerCase().includes(query);
      const matchesCustomer = customer?.name.toLowerCase().includes(query) || customer?.email.toLowerCase().includes(query);
      const matchesBookingId = booking.id.toLowerCase().includes(query);
      
      if (!matchesSpot && !matchesCustomer && !matchesBookingId) {
        return false;
      }
    }
    
    // Status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false;
    }
    
    // Date filter
    if (dateFilter) {
      const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
      if (bookingDate !== dateFilter) {
        return false;
      }
    }
    
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      await database.updateBookingStatus(bookingId, newStatus);
      await loadBookingsData(); // Reload data
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error updating booking status');
    }
  };

  const exportBookings = () => {
    const csvContent = [
      ['Booking ID', 'Customer', 'Parking Spot', 'Date', 'Time', 'Duration', 'Amount', 'Status'].join(','),
      ...filteredBookings.map(booking => {
        const spot = spots[booking.spotId];
        const customer = users[booking.userId];
        const startDateTime = formatDateTime(booking.startTime);
        const endDateTime = formatDateTime(booking.endTime);
        
        return [
          booking.id,
          customer?.name || 'Unknown',
          spot?.name || 'Unknown',
          startDateTime.date,
          `${startDateTime.time} - ${endDateTime.time}`,
          calculateDuration(booking.startTime, booking.endTime),
          `$${booking.totalCost}`,
          booking.status
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(1)}h`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bookings Management
          </h1>
          <p className="text-gray-600">
            View and manage all bookings for your parking spots
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            
            <button
              onClick={exportBookings}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Total Bookings', value: bookings.length, color: 'blue' },
            { label: 'Active', value: bookings.filter(b => b.status === 'active').length, color: 'green' },
            { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'yellow' },
            { label: 'Today\'s Revenue', value: `$${bookings.filter(b => new Date(b.startTime).toDateString() === new Date().toDateString()).reduce((sum, b) => sum + b.totalCost, 0)}`, color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Bookings ({filteredBookings.length})
            </h3>
          </div>
          
          {filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Customer</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Parking Spot</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Date & Time</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Duration</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Amount</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const spot = spots[booking.spotId];
                    const customer = users[booking.userId];
                    const startDateTime = formatDateTime(booking.startTime);
                    const endDateTime = formatDateTime(booking.endTime);
                    
                    return (
                      <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{customer?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-600">{customer?.email || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{spot?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{startDateTime.date}</p>
                            <p className="text-sm text-gray-600">{startDateTime.time} - {endDateTime.time}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-900">{calculateDuration(booking.startTime, booking.endTime)}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900">${booking.totalCost}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="capitalize">{booking.status}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                              <Eye className="h-4 w-4 text-gray-500" />
                            </button>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, 'active')}
                                  className="p-1 hover:bg-green-100 rounded transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                  className="p-1 hover:bg-red-100 rounded transition-colors"
                                  title="Cancel"
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </button>
                              </>
                            )}
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' || dateFilter
                  ? 'Try adjusting your filters to see more results.'
                  : 'Bookings will appear here when customers book your parking spots.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};