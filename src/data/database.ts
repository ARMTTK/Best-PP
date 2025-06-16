import { ParkingSpot, Booking, User, Review } from '../types';

// Mock Database
export interface Database {
  users: User[];
  parkingSpots: ParkingSpot[];
  bookings: Booking[];
  reviews: Review[];
}

// Initial mock data
const initialDatabase: Database = {
  users: [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'driver@demo.com',
      phone: '+1 (555) 123-4567',
      password: 'demo123',
      userType: 'customer',
      vehicles: [
        {
          id: 'v1',
          make: 'Toyota',
          model: 'Camry',
          licensePlate: 'ABC-123',
          color: 'Silver'
        },
        {
          id: 'v2',
          make: 'Honda',
          model: 'Civic',
          licensePlate: 'XYZ-789',
          color: 'Blue'
        }
      ]
    },
    {
      id: 'owner1',
      name: 'Sarah Wilson',
      email: 'owner@demo.com',
      phone: '+1 (555) 987-6543',
      password: 'demo123',
      userType: 'owner',
      vehicles: []
    }
  ],
  parkingSpots: [
    {
      id: '1',
      name: 'Central Plaza Parking',
      address: '123 Main Street, Downtown',
      price: 25,
      priceType: 'hour',
      totalSlots: 50,
      availableSlots: 12,
      rating: 4.5,
      reviewCount: 128,
      images: [
        'https://images.pexels.com/photos/753876/pexels-photo-753876.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      amenities: ['CCTV Security', 'EV Charging', 'Covered Parking', 'Elevator Access'],
      openingHours: '24/7',
      phone: '+1 (555) 123-4567',
      description: 'Premium parking facility in the heart of downtown with state-of-the-art security and amenities.',
      lat: 40.7589,
      lng: -73.9851,
      ownerId: 'owner1',
      isActive: true
    },
    {
      id: '2',
      name: 'Riverside Mall Parking',
      address: '456 River Road, Westside',
      price: 150,
      priceType: 'day',
      totalSlots: 200,
      availableSlots: 45,
      rating: 4.2,
      reviewCount: 89,
      images: [
        'https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      amenities: ['Shopping Access', 'Food Court Nearby', 'Valet Service', 'Car Wash'],
      openingHours: '6:00 AM - 11:00 PM',
      phone: '+1 (555) 987-6543',
      description: 'Convenient mall parking with direct access to shopping and dining.',
      lat: 40.7505,
      lng: -73.9934,
      ownerId: 'owner1',
      isActive: true
    }
  ],
  bookings: [
    {
      id: 'b1',
      spotId: '1',
      userId: 'user1',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T17:00:00Z',
      vehicleId: 'v1',
      totalCost: 200,
      status: 'active',
      qrCode: 'QR_b1_1_1737123456789',
      pin: '1234',
      createdAt: '2024-01-14T10:30:00Z'
    }
  ],
  reviews: [
    {
      id: 'r1',
      userId: 'user1',
      spotId: '1',
      rating: 5,
      comment: 'Excellent parking facility with great security and easy access. Highly recommended!',
      createdAt: '2024-01-10T15:30:00Z',
      userName: 'John D.'
    }
  ]
};

// Database operations
class MockDatabase {
  private data: Database;

  constructor() {
    // Load from localStorage or use initial data
    const stored = localStorage.getItem('parkpass_database');
    this.data = stored ? JSON.parse(stored) : initialDatabase;
  }

  private save() {
    localStorage.setItem('parkpass_database', JSON.stringify(this.data));
  }

  // User operations
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = this.data.users.find(u => u.email === email && u.password === password);
    return user || null;
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: 'user_' + Date.now()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.data.users.find(u => u.id === id) || null;
  }

  // Parking spot operations
  async getAllParkingSpots(): Promise<ParkingSpot[]> {
    return this.data.parkingSpots.filter(spot => spot.isActive);
  }

  async getParkingSpotById(id: string): Promise<ParkingSpot | null> {
    return this.data.parkingSpots.find(s => s.id === id) || null;
  }

  async createParkingSpot(spotData: Omit<ParkingSpot, 'id' | 'rating' | 'reviewCount' | 'availableSlots'>): Promise<ParkingSpot> {
    const newSpot: ParkingSpot = {
      ...spotData,
      id: 'spot_' + Date.now(),
      rating: 0,
      reviewCount: 0,
      availableSlots: spotData.totalSlots,
      isActive: true
    };
    this.data.parkingSpots.push(newSpot);
    this.save();
    return newSpot;
  }

  async updateParkingSpot(id: string, updates: Partial<ParkingSpot>): Promise<ParkingSpot | null> {
    const spotIndex = this.data.parkingSpots.findIndex(s => s.id === id);
    if (spotIndex === -1) return null;

    this.data.parkingSpots[spotIndex] = { ...this.data.parkingSpots[spotIndex], ...updates };
    this.save();
    return this.data.parkingSpots[spotIndex];
  }

  async getParkingSpotsByOwner(ownerId: string): Promise<ParkingSpot[]> {
    return this.data.parkingSpots.filter(s => s.ownerId === ownerId);
  }

  // Booking operations
  async createBooking(bookingData: Omit<Booking, 'id' | 'qrCode' | 'pin' | 'createdAt'>): Promise<Booking> {
    const bookingId = 'booking_' + Date.now();
    const qrCode = `QR_${bookingId}_${bookingData.spotId}_${Date.now()}`;
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      qrCode,
      pin,
      createdAt: new Date().toISOString()
    };

    this.data.bookings.push(newBooking);
    
    // Update available slots
    const spot = await this.getParkingSpotById(bookingData.spotId);
    if (spot && spot.availableSlots > 0) {
      await this.updateParkingSpot(bookingData.spotId, {
        availableSlots: spot.availableSlots - 1
      });
    }

    this.save();
    return newBooking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return this.data.bookings.filter(b => b.userId === userId);
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.data.bookings;
  }

  async getBookingByQRCode(qrCode: string): Promise<Booking | null> {
    return this.data.bookings.find(b => b.qrCode === qrCode) || null;
  }

  async getBookingByPin(pin: string): Promise<Booking | null> {
    return this.data.bookings.find(b => b.pin === pin) || null;
  }

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking | null> {
    const bookingIndex = this.data.bookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) return null;

    const oldStatus = this.data.bookings[bookingIndex].status;
    this.data.bookings[bookingIndex].status = status;

    // Update available slots when booking is completed/cancelled
    if ((oldStatus === 'active' || oldStatus === 'pending') && (status === 'completed' || status === 'cancelled')) {
      const booking = this.data.bookings[bookingIndex];
      const spot = await this.getParkingSpotById(booking.spotId);
      if (spot) {
        await this.updateParkingSpot(booking.spotId, {
          availableSlots: spot.availableSlots + 1
        });
      }
    }

    this.save();
    return this.data.bookings[bookingIndex];
  }

  async extendBooking(id: string, additionalHours: number): Promise<Booking | null> {
    const bookingIndex = this.data.bookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) return null;

    const booking = this.data.bookings[bookingIndex];
    const newEndTime = new Date(booking.endTime);
    newEndTime.setHours(newEndTime.getHours() + additionalHours);

    // Check for conflicts with other bookings
    const spot = await this.getParkingSpotById(booking.spotId);
    if (!spot) return null;

    const conflictingBookings = this.data.bookings.filter(b => 
      b.spotId === booking.spotId && 
      b.id !== booking.id &&
      (b.status === 'active' || b.status === 'pending') &&
      new Date(b.startTime) < newEndTime &&
      new Date(b.endTime) > new Date(booking.endTime)
    );

    // Calculate available slots during extension period
    const slotsNeeded = conflictingBookings.length + 1; // +1 for current booking
    if (slotsNeeded > spot.totalSlots) {
      throw new Error('Extension not possible due to conflicting bookings');
    }

    // Calculate additional cost
    const spot_data = await this.getParkingSpotById(booking.spotId);
    if (!spot_data) return null;

    let additionalCost = 0;
    if (spot_data.priceType === 'hour') {
      additionalCost = additionalHours * spot_data.price;
    } else if (spot_data.priceType === 'day') {
      const additionalDays = Math.ceil(additionalHours / 24);
      additionalCost = additionalDays * spot_data.price;
    }

    // Update booking
    this.data.bookings[bookingIndex].endTime = newEndTime.toISOString();
    this.data.bookings[bookingIndex].totalCost += additionalCost;

    this.save();
    return this.data.bookings[bookingIndex];
  }

  // Review operations
  async createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const newReview: Review = {
      ...reviewData,
      id: 'review_' + Date.now(),
      createdAt: new Date().toISOString()
    };

    this.data.reviews.push(newReview);

    // Update spot rating
    const spotReviews = this.data.reviews.filter(r => r.spotId === reviewData.spotId);
    const avgRating = spotReviews.reduce((sum, r) => sum + r.rating, 0) / spotReviews.length;
    
    await this.updateParkingSpot(reviewData.spotId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: spotReviews.length
    });

    this.save();
    return newReview;
  }

  async getReviewsBySpot(spotId: string): Promise<Review[]> {
    return this.data.reviews.filter(r => r.spotId === spotId);
  }

  // Helper method to get next available time for a spot
  async getNextAvailableTime(spotId: string): Promise<string | null> {
    const spot = await this.getParkingSpotById(spotId);
    if (!spot) return null;

    if (spot.availableSlots > 0) {
      return new Date().toISOString(); // Available now
    }

    // Find the earliest ending booking
    const activeBookings = this.data.bookings.filter(b => 
      b.spotId === spotId && 
      (b.status === 'active' || b.status === 'pending') &&
      new Date(b.endTime) > new Date()
    );

    if (activeBookings.length === 0) {
      return new Date().toISOString(); // Available now
    }

    // Sort by end time and return the earliest
    activeBookings.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
    return activeBookings[0].endTime;
  }
}

export const database = new MockDatabase();