import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  MessageSquare,
  Phone,
  Plus,
  Search,
  User,
  XCircle
} from 'lucide-react';
import { useState } from 'react';

const mockBookings = [
  {
    id: 1,
    guestName: 'James Kimani',
    guestEmail: 'james.kimani@gmail.com',
    guestPhone: '+254722123456',
    guestNationality: 'Kenyan',
    guestIdNumber: '12345678',
    property: 'Sunset Apartments',
    unit: 'Apartment 2A',
    checkInDate: '2025-06-15',
    checkOutDate: '2025-06-18',
    nights: 3,
    guests: 2,
    totalAmount: 15000,
    paidAmount: 15000,
    status: 'confirmed',
    source: 'Airbnb',
    purpose: 'Business',
    bookingDate: '2025-06-01',
    specialRequests: 'Late check-in after 8PM',
    checkedIn: false,
    checkedOut: false
  },
  {
    id: 2,
    guestName: 'Sarah Mitchell',
    guestEmail: 'sarah.mitchell@email.com',
    guestPhone: '+1555234567',
    guestNationality: 'American',
    guestIdNumber: 'P123456789',
    property: 'Green Valley Condos',
    unit: 'Condo 3B',
    checkInDate: '2025-06-10',
    checkOutDate: '2025-06-12',
    nights: 2,
    guests: 1,
    totalAmount: 12000,
    paidAmount: 12000,
    status: 'checked-in',
    source: 'Booking.com',
    purpose: 'Tourism',
    bookingDate: '2025-05-25',
    specialRequests: 'Non-smoking room',
    checkedIn: true,
    checkedOut: false
  },
  {
    id: 3,
    guestName: 'David Ochieng',
    guestEmail: 'david.ochieng@yahoo.com',
    guestPhone: '+254733987654',
    guestNationality: 'Kenyan',
    guestIdNumber: '23456789',
    property: 'Riverside Studios',
    unit: 'Studio 1C',
    checkInDate: '2025-06-08',
    checkOutDate: '2025-06-09',
    nights: 1,
    guests: 1,
    totalAmount: 4500,
    paidAmount: 4500,
    status: 'checked-out',
    source: 'Direct',
    purpose: 'Personal',
    bookingDate: '2025-06-07',
    specialRequests: 'Extra towels',
    checkedIn: true,
    checkedOut: true
  },
  {
    id: 4,
    guestName: 'Maria Santos',
    guestEmail: 'maria.santos@hotmail.com',
    guestPhone: '+5511987654321',
    guestNationality: 'Brazilian',
    guestIdNumber: 'RG12345678',
    property: 'Metro Lofts',
    unit: 'Loft 2B',
    checkInDate: '2025-06-20',
    checkOutDate: '2025-06-25',
    nights: 5,
    guests: 3,
    totalAmount: 30000,
    paidAmount: 15000,
    status: 'pending-payment',
    source: 'Airbnb',
    purpose: 'Tourism',
    bookingDate: '2025-06-02',
    specialRequests: 'Airport pickup service',
    checkedIn: false,
    checkedOut: false
  },
  {
    id: 5,
    guestName: 'Ahmed Hassan',
    guestEmail: 'ahmed.hassan@gmail.com',
    guestPhone: '+254701234567',
    guestNationality: 'Kenyan',
    guestIdNumber: '34567890',
    property: 'Heritage Townhomes',
    unit: 'Townhouse 4A',
    checkInDate: '2025-06-12',
    checkOutDate: '2025-06-14',
    nights: 2,
    guests: 4,
    totalAmount: 18000,
    paidAmount: 0,
    status: 'cancelled',
    source: 'Booking.com',
    purpose: 'Family gathering',
    bookingDate: '2025-05-28',
    specialRequests: 'Ground floor access',
    checkedIn: false,
    checkedOut: false
  }
];

export function Bookings() {
  const [bookings, setBookings] = useState(mockBookings);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.unit.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || booking.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'checked-in': return 'default';
      case 'checked-out': return 'default';
      case 'pending-payment': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'checked-in': return User;
      case 'checked-out': return Calendar;
      case 'pending-payment': return Clock;
      case 'cancelled': return XCircle;
      default: return AlertCircle;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Statistics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const checkedInBookings = bookings.filter(b => b.status === 'checked-in').length;
  const pendingPayments = bookings.filter(b => b.status === 'pending-payment').length;
  const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.paidAmount, 0);
  const averageStay = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.nights, 0) / bookings.filter(b => b.status !== 'cancelled').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Short-term Bookings</h1>
          <p className="text-muted-foreground">Manage Airbnb and short-term rental reservations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddBookingOpen} onOpenChange={setIsAddBookingOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guest-name">Guest Name</Label>
                  <Input id="guest-name" placeholder="Full name as per ID" />
                </div>
                <div>
                  <Label htmlFor="guest-email">Email</Label>
                  <Input id="guest-email" type="email" placeholder="guest@email.com" />
                </div>
                <div>
                  <Label htmlFor="guest-phone">Phone Number</Label>
                  <Input id="guest-phone" placeholder="+254..." />
                </div>
                <div>
                  <Label htmlFor="guest-nationality">Nationality</Label>
                  <Input id="guest-nationality" placeholder="Kenyan" />
                </div>
                <div>
                  <Label htmlFor="guest-id">ID/Passport Number</Label>
                  <Input id="guest-id" placeholder="ID or passport number" />
                </div>
                <div>
                  <Label htmlFor="property-unit">Property & Unit</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunset-2a">Sunset Apartments - 2A</SelectItem>
                      <SelectItem value="valley-3b">Green Valley - 3B</SelectItem>
                      <SelectItem value="riverside-1c">Riverside Studios - 1C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="checkin-date">Check-in Date</Label>
                  <Input id="checkin-date" type="date" />
                </div>
                <div>
                  <Label htmlFor="checkout-date">Check-out Date</Label>
                  <Input id="checkout-date" type="date" />
                </div>
                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input id="guests" type="number" min="1" placeholder="1" />
                </div>
                <div>
                  <Label htmlFor="total-amount">Total Amount (KES)</Label>
                  <Input id="total-amount" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="source">Booking Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="airbnb">Airbnb</SelectItem>
                      <SelectItem value="booking">Booking.com</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="expedia">Expedia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="purpose">Purpose of Visit</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="tourism">Tourism</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="family">Family gathering</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="special-requests">Special Requests</Label>
                  <Textarea id="special-requests" placeholder="Any special requests or notes..." />
                </div>
                <div className="col-span-2">
                  <Button className="w-full">Create Booking</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming stays
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkedInBookings}</div>
            <p className="text-xs text-muted-foreground">
              Current guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Stay</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageStay.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              nights per booking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="checked-in">Checked In</SelectItem>
            <SelectItem value="checked-out">Checked Out</SelectItem>
            <SelectItem value="pending-payment">Pending Payment</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="Airbnb">Airbnb</SelectItem>
            <SelectItem value="Booking.com">Booking.com</SelectItem>
            <SelectItem value="Direct">Direct</SelectItem>
            <SelectItem value="Expedia">Expedia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => {
          const StatusIcon = getStatusIcon(booking.status);
          const isUpcoming = new Date(booking.checkInDate) > new Date();
          const isCurrent = new Date(booking.checkInDate) <= new Date() && new Date(booking.checkOutDate) > new Date();
          
          return (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {booking.guestName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{booking.guestName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{booking.guestNationality}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{booking.guestPhone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={getStatusColor(booking.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {booking.status.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline">{booking.source}</Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Property</span>
                    <p className="font-medium">{booking.unit}</p>
                    <p className="text-xs text-muted-foreground">{booking.property}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration</span>
                    <p className="font-medium">{booking.nights} nights</p>
                    <p className="text-xs text-muted-foreground">{booking.guests} guests</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check-in</span>
                    <p className="font-medium">{formatDate(booking.checkInDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check-out</span>
                    <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Paid</span>
                    <span className={`font-medium ${booking.paidAmount < booking.totalAmount ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatCurrency(booking.paidAmount)}
                    </span>
                  </div>
                  {booking.paidAmount < booking.totalAmount && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Outstanding</span>
                      <span className="font-medium text-destructive">
                        {formatCurrency(booking.totalAmount - booking.paidAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {booking.specialRequests && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-1">Special Requests</p>
                    <p className="text-xs text-muted-foreground">{booking.specialRequests}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  {booking.status === 'confirmed' && isUpcoming && (
                    <Button size="sm" className="flex-1">
                      <User className="h-4 w-4 mr-2" />
                      Check In
                    </Button>
                  )}
                  {booking.status === 'checked-in' && (
                    <Button size="sm" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Check Out
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No bookings found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}