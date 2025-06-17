import React, { useState, useEffect } from 'react';
import { 
  User, 
  Car, 
  Receipt, 
  Bell, 
  Shield, 
  LogOut,
  Edit,
  Plus,
  Trash2,
  Download,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { database } from '../data/database';
import { User as UserType, Vehicle } from '../types';

export const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'vehicles' | 'receipts' | 'settings'>('profile');
  const [user, setUser] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    licensePlate: '',
    color: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      loadUserData();
    }
  }, [authUser]);

  const loadUserData = async () => {
    try {
      const userData = await database.getUserById(authUser!.id);
      setUser(userData);
      if (userData) {
        setEditForm({
          name: userData.name,
          email: userData.email,
          phone: userData.phone
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'vehicles', label: 'My Vehicles', icon: Car },
    { id: 'receipts', label: 'Payment History', icon: Receipt },
    { id: 'settings', label: 'Settings', icon: Shield },
  ];

  const mockReceipts = [
    {
      id: 'r1',
      date: '2024-01-15',
      spotName: 'Central Plaza Parking',
      amount: 200,
      method: 'Credit Card'
    },
    {
      id: 'r2', 
      date: '2024-01-12',
      spotName: 'Riverside Mall Parking',
      amount: 100,
      method: 'QR Payment'
    }
  ];

  const handleProfileSave = async () => {
    try {
      // In real app, update user in database
      console.log('Updating user profile:', editForm);
      
      // Update local state
      if (user) {
        const updatedUser = { ...user, ...editForm };
        setUser(updatedUser);
      }
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Check vehicle limit
    if (user.vehicles.length >= 3) {
      alert('You can only add up to 3 vehicles.');
      return;
    }

    try {
      const vehicle: Vehicle = {
        id: 'v_' + Date.now(),
        ...newVehicle
      };

      // In real app, add vehicle to database
      console.log('Adding vehicle:', vehicle);
      
      // Update local state
      const updatedUser = {
        ...user,
        vehicles: [...user.vehicles, vehicle]
      };
      setUser(updatedUser);
      
      setNewVehicle({
        make: '',
        model: '',
        licensePlate: '',
        color: ''
      });
      setShowAddVehicle(false);
      alert('Vehicle added successfully!');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Error adding vehicle. Please try again.');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!user) return;
    
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        // In real app, delete from database
        console.log('Deleting vehicle:', vehicleId);
        
        // Update local state
        const updatedUser = {
          ...user,
          vehicles: user.vehicles.filter(v => v.id !== vehicleId)
        };
        setUser(updatedUser);
        
        alert('Vehicle deleted successfully!');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Error deleting vehicle. Please try again.');
      }
    }
  };

  const ProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleProfileSave}
                className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={isEditing ? editForm.name : user?.name || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              readOnly={!isEditing}
              className={`w-full px-3 py-2 border border-gray-200 rounded-lg ${
                isEditing ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={isEditing ? editForm.email : user?.email || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              readOnly={!isEditing}
              className={`w-full px-3 py-2 border border-gray-200 rounded-lg ${
                isEditing ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={isEditing ? editForm.phone : user?.phone || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              readOnly={!isEditing}
              className={`w-full px-3 py-2 border border-gray-200 rounded-lg ${
                isEditing ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Since
            </label>
            <input
              type="text"
              value="January 2024"
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const VehiclesSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">My Vehicles</h3>
            <p className="text-sm text-gray-600">You can add up to 3 vehicles ({user?.vehicles.length || 0}/3)</p>
          </div>
          <button 
            onClick={() => setShowAddVehicle(true)}
            disabled={user?.vehicles.length >= 3}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Vehicle</span>
          </button>
        </div>

        <div className="space-y-4">
          {user?.vehicles && user.vehicles.length > 0 ? (
            user.vehicles.map((vehicle) => (
              <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {vehicle.make} {vehicle.model}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {vehicle.licensePlate} • {vehicle.color}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No vehicles added yet</p>
              <p className="text-sm">Add your first vehicle to start booking parking spots</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ReceiptsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export All</span>
          </button>
        </div>

        <div className="space-y-4">
          {mockReceipts.map((receipt) => (
            <div key={receipt.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {receipt.spotName}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{new Date(receipt.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{receipt.method}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    ${receipt.amount}
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SettingsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Notifications</p>
                <p className="text-sm text-gray-600">Receive booking alerts and updates</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Enable
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <LogOut className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">Sign Out</p>
                <p className="text-sm text-gray-600">Sign out of your account</p>
              </div>
            </div>
            <button className="text-red-600 hover:text-red-800 font-medium transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return <ProfileSection />;
      case 'vehicles': return <VehiclesSection />;
      case 'receipts': return <ReceiptsSection />;
      case 'settings': return <SettingsSection />;
      default: return <ProfileSection />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User data not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add New Vehicle</h3>
                <button
                  onClick={() => setShowAddVehicle(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make
                  </label>
                  <input
                    type="text"
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, make: e.target.value }))}
                    placeholder="e.g., Toyota"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="e.g., Camry"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={newVehicle.licensePlate}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                    placeholder="e.g., ABC-123"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="e.g., Silver"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddVehicle(false)}
                    className="flex-1 border border-gray-200 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};