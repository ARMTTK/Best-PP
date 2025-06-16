import React, { useState, useEffect } from 'react';
import { 
  Star, 
  User, 
  MapPin, 
  Calendar,
  Search,
  Filter,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Award
} from 'lucide-react';
import { database } from '../data/database';
import { useAuth } from '../context/AuthContext';
import { Review, ParkingSpot, User as UserType } from '../types';

export const AdminReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [spots, setSpots] = useState<{ [key: string]: ParkingSpot }>({});
  const [users, setUsers] = useState<{ [key: string]: UserType }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [spotFilter, setSpotFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReviewsData();
    }
  }, [user]);

  const loadReviewsData = async () => {
    try {
      // Get all spots owned by this user
      const ownerSpots = await database.getParkingSpotsByOwner(user!.id);
      
      // Get all reviews for these spots
      const allReviews: Review[] = [];
      for (const spot of ownerSpots) {
        const spotReviews = await database.getReviewsBySpot(spot.id);
        allReviews.push(...spotReviews);
      }
      
      // Create spots lookup
      const spotsLookup: { [key: string]: ParkingSpot } = {};
      ownerSpots.forEach(spot => {
        spotsLookup[spot.id] = spot;
      });
      
      // Get user details for reviews
      const userIds = [...new Set(allReviews.map(r => r.userId))];
      const usersLookup: { [key: string]: UserType } = {};
      
      for (const userId of userIds) {
        const userData = await database.getUserById(userId);
        if (userData) {
          usersLookup[userId] = userData;
        }
      }
      
      setReviews(allReviews);
      setSpots(spotsLookup);
      setUsers(usersLookup);
    } catch (error) {
      console.error('Error loading reviews data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const spot = spots[review.spotId];
    const customer = users[review.userId];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSpot = spot?.name.toLowerCase().includes(query);
      const matchesCustomer = customer?.name.toLowerCase().includes(query);
      const matchesComment = review.comment.toLowerCase().includes(query);
      
      if (!matchesSpot && !matchesCustomer && !matchesComment) {
        return false;
      }
    }
    
    // Rating filter
    if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) {
      return false;
    }
    
    // Spot filter
    if (spotFilter !== 'all' && review.spotId !== spotFilter) {
      return false;
    }
    
    return true;
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reviews & Ratings
          </h1>
          <p className="text-gray-600">
            Monitor customer feedback and improve your parking spots
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {renderStars(Math.round(averageRating))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{reviews.length}</div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => r.rating >= 4).length}
                </div>
                <div className="text-sm text-gray-600">Positive Reviews</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Rating Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Rated Spots */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rated Parking Spots</h3>
            <div className="space-y-3">
              {Object.values(spots)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5)
                .map((spot, index) => (
                  <div key={spot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{spot.name}</p>
                        <p className="text-sm text-gray-600">{spot.reviewCount} reviews</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold">{spot.rating}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as any)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            
            <select
              value={spotFilter}
              onChange={(e) => setSpotFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Parking Spots</option>
              {Object.values(spots).map(spot => (
                <option key={spot.id} value={spot.id}>{spot.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Customer Reviews ({filteredReviews.length})
            </h3>
          </div>
          
          {filteredReviews.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredReviews.map((review) => {
                const spot = spots[review.spotId];
                const customer = users[review.userId];
                
                return (
                  <div key={review.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {review.userName}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span>{spot?.name}</span>
                              <span>•</span>
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Helpful</span>
                          </button>
                          <button className="text-gray-600 hover:text-blue-600 transition-colors">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-600">
                {searchQuery || ratingFilter !== 'all' || spotFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Customer reviews will appear here after they use your parking spots.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};