import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Bed,
  Clock,
  Download,
  Edit,
  Eye,
  Flag,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Shield,
  Star,
  UserCheck,
  Users
} from 'lucide-react';
import { useState } from 'react';

const mockGuests = [
  {
    id: 1,
    firstName: 'James',
    lastName: 'Kimani',
    email: 'james.kimani@gmail.com',
    phone: '+254722123456',
    nationality: 'Kenyan',
    idType: 'National ID',
    idNumber: '12345678',
    passportNumber: null,
    dateOfBirth: '1985-03-15',
    address: '123 Moi Avenue, Nairobi',
    city: 'Nairobi',
    country: 'Kenya',
    occupation: 'Software Engineer',
    employer: 'Tech Solutions Ltd',
    emergencyContactName: 'Mary Kimani',
    emergencyContactPhone: '+254733456789',
    emergencyContactRelation: 'Spouse',
    registrationDate: '2025-06-01',
    lastStay: '2025-06-15',
    totalStays: 3,
    totalNights: 8,
    totalSpent: 45000,
    rating: 4.8,
    notes: 'Excellent guest, always follows house rules',
    blacklisted: false,
    verificationStatus: 'verified'
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+1555234567',
    nationality: 'American',
    idType: 'Passport',
    idNumber: null,
    passportNumber: 'P123456789',
    dateOfBirth: '1990-07-22',
    address: '456 Oak Street, Chicago',
    city: 'Chicago',
    country: 'United States',
    occupation: 'Marketing Manager',
    employer: 'Global Corp',
    emergencyContactName: 'John Mitchell',
    emergencyContactPhone: '+1555987654',
    emergencyContactRelation: 'Brother',
    registrationDate: '2025-05-25',
    lastStay: '2025-06-10',
    totalStays: 1,
    totalNights: 2,
    totalSpent: 12000,
    rating: 5.0,
    notes: 'Very clean and respectful guest',
    blacklisted: false,
    verificationStatus: 'verified'
  },
  {
    id: 3,
    firstName: 'David',
    lastName: 'Ochieng',
    email: 'david.ochieng@yahoo.com',
    phone: '+254733987654',
    nationality: 'Kenyan',
    idType: 'National ID',
    idNumber: '23456789',
    passportNumber: null,
    dateOfBirth: '1988-11-10',
    address: '789 Kenyatta Avenue, Kisumu',
    city: 'Kisumu',
    country: 'Kenya',
    occupation: 'Teacher',
    employer: 'Kisumu Primary School',
    emergencyContactName: 'Grace Ochieng',
    emergencyContactPhone: '+254701234567',
    emergencyContactRelation: 'Sister',
    registrationDate: '2025-06-07',
    lastStay: '2025-06-08',
    totalStays: 1,
    totalNights: 1,
    totalSpent: 4500,
    rating: 4.5,
    notes: 'Quiet guest, no issues',
    blacklisted: false,
    verificationStatus: 'pending'
  },
  {
    id: 4,
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@hotmail.com',
    phone: '+5511987654321',
    nationality: 'Brazilian',
    idType: 'Passport',
    idNumber: null,
    passportNumber: 'RG12345678',
    dateOfBirth: '1992-04-18',
    address: 'Rua das Flores 123, São Paulo',
    city: 'São Paulo',
    country: 'Brazil',
    occupation: 'Photographer',
    employer: 'Freelancer',
    emergencyContactName: 'Carlos Santos',
    emergencyContactPhone: '+5511123456789',
    emergencyContactRelation: 'Father',
    registrationDate: '2025-06-02',
    lastStay: null,
    totalStays: 0,
    totalNights: 0,
    totalSpent: 0,
    rating: null,
    notes: 'New guest, upcoming booking',
    blacklisted: false,
    verificationStatus: 'pending'
  }
];

export function Guests() {
  const [guests, setGuests] = useState(mockGuests);
  const [searchQuery, setSearchQuery] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);

  const handleCreateBooking = (guest: any) => {
    setSelectedGuest(guest);
    setIsCreateBookingOpen(true);
  };

  const handleQuickBook = () => {
    setIsQuickBookOpen(true);
  };

  const createBooking = (bookingData: any) => {
    // In a real app, this would create a booking and link it to the guest
    console.log('Creating booking for guest:', selectedGuest, 'with data:', bookingData);
    setIsCreateBookingOpen(false);
    setSelectedGuest(null);
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.idNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.passportNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesNationality = nationalityFilter === 'all' || guest.nationality === nationalityFilter;
    const matchesVerification = verificationFilter === 'all' || guest.verificationStatus === verificationFilter;
    
    return matchesSearch && matchesNationality && matchesVerification;
  });

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Statistics
  const totalGuests = guests.length;
  const verifiedGuests = guests.filter(g => g.verificationStatus === 'verified').length;
  const repeatGuests = guests.filter(g => g.totalStays > 1).length;
  const kenyanGuests = guests.filter(g => g.nationality === 'Kenyan').length;
  const internationalGuests = guests.filter(g => g.nationality !== 'Kenyan').length;
  const averageRating = guests.filter(g => g.rating !== null).reduce((sum, g) => sum + (g.rating || 0), 0) / guests.filter(g => g.rating !== null).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Guest Management</h1>
          <p className="text-muted-foreground">Manage guest registrations and compliance records</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Registry
          </Button>
          <Button variant="outline" onClick={handleQuickBook}>
            <Bed className="h-4 w-4 mr-2" />
            Quick Book
          </Button>
          <Dialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Register Guest
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Guest</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  All fields are required for compliance with Kenyan law
                </p>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">First Name *</Label>
                  <Input id="first-name" placeholder="As per ID document" />
                </div>
                <div>
                  <Label htmlFor="last-name">Last Name *</Label>
                  <Input id="last-name" placeholder="As per ID document" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="guest@email.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" placeholder="+254..." />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kenyan">Kenyan</SelectItem>
                      <SelectItem value="American">American</SelectItem>
                      <SelectItem value="British">British</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="id-type">ID Type *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="National ID">National ID</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="Driver's License">Driver's License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="id-number">ID/Passport Number *</Label>
                  <Input id="id-number" placeholder="Enter ID or passport number" />
                </div>
                <div>
                  <Label htmlFor="date-of-birth">Date of Birth *</Label>
                  <Input id="date-of-birth" type="date" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" placeholder="Full physical address" />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="City" />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" placeholder="Country" />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input id="occupation" placeholder="Job title" />
                </div>
                <div>
                  <Label htmlFor="employer">Employer</Label>
                  <Input id="employer" placeholder="Company name" />
                </div>
                <div className="col-span-2 border-t pt-4">
                  <h3 className="font-medium mb-3">Emergency Contact Information</h3>
                </div>
                <div>
                  <Label htmlFor="emergency-name">Contact Name *</Label>
                  <Input id="emergency-name" placeholder="Emergency contact name" />
                </div>
                <div>
                  <Label htmlFor="emergency-phone">Contact Phone *</Label>
                  <Input id="emergency-phone" placeholder="Emergency contact phone" />
                </div>
                <div>
                  <Label htmlFor="emergency-relation">Relationship *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Colleague">Colleague</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div></div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional notes about the guest..." />
                </div>
                <div className="col-span-2">
                  <Button className="w-full">Register Guest</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Create Booking Dialog */}
      <Dialog open={isCreateBookingOpen} onOpenChange={setIsCreateBookingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Booking for {selectedGuest?.firstName} {selectedGuest?.lastName}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Create a new booking for this registered guest
            </p>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guest-name">Guest Name</Label>
              <Input 
                id="guest-name" 
                value={`${selectedGuest?.firstName} ${selectedGuest?.lastName}`} 
                disabled 
              />
            </div>
            <div>
              <Label htmlFor="guest-email">Email</Label>
              <Input id="guest-email" value={selectedGuest?.email} disabled />
            </div>
            <div>
              <Label htmlFor="guest-phone">Phone Number</Label>
              <Input id="guest-phone" value={selectedGuest?.phone} disabled />
            </div>
            <div>
              <Label htmlFor="guest-nationality">Nationality</Label>
              <Input id="guest-nationality" value={selectedGuest?.nationality} disabled />
            </div>
            <div>
              <Label htmlFor="guest-id">ID/Passport Number</Label>
              <Input id="guest-id" value={selectedGuest?.idNumber || selectedGuest?.passportNumber} disabled />
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
                  <SelectItem value="metro-2b">Metro Lofts - 2B</SelectItem>
                  <SelectItem value="heritage-4a">Heritage Townhomes - 4A</SelectItem>
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
                  <SelectItem value="direct">Direct (Walk-in)</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="booking">Booking.com</SelectItem>
                  <SelectItem value="expedia">Expedia</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
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
              <Button className="w-full" onClick={() => createBooking({})}>
                Create Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Book Dialog */}
      <Dialog open={isQuickBookOpen} onOpenChange={setIsQuickBookOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Book - Register Guest & Create Booking</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Register a new guest and create their booking in one step (Reception Workflow)
            </p>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6">
            {/* Guest Information Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Guest Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quick-first-name">First Name *</Label>
                  <Input id="quick-first-name" placeholder="As per ID document" />
                </div>
                <div>
                  <Label htmlFor="quick-last-name">Last Name *</Label>
                  <Input id="quick-last-name" placeholder="As per ID document" />
                </div>
                <div>
                  <Label htmlFor="quick-email">Email Address *</Label>
                  <Input id="quick-email" type="email" placeholder="guest@email.com" />
                </div>
                <div>
                  <Label htmlFor="quick-phone">Phone Number *</Label>
                  <Input id="quick-phone" placeholder="+254..." />
                </div>
                <div>
                  <Label htmlFor="quick-nationality">Nationality *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kenyan">Kenyan</SelectItem>
                      <SelectItem value="American">American</SelectItem>
                      <SelectItem value="British">British</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quick-id-type">ID Type *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="National ID">National ID</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="Driver's License">Driver's License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quick-id-number">ID/Passport Number *</Label>
                  <Input id="quick-id-number" placeholder="Enter ID or passport number" />
                </div>
                <div>
                  <Label htmlFor="quick-date-of-birth">Date of Birth *</Label>
                  <Input id="quick-date-of-birth" type="date" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="quick-address">Address *</Label>
                  <Input id="quick-address" placeholder="Full physical address" />
                </div>
                <div>
                  <Label htmlFor="quick-city">City *</Label>
                  <Input id="quick-city" placeholder="City" />
                </div>
                <div>
                  <Label htmlFor="quick-country">Country *</Label>
                  <Input id="quick-country" placeholder="Country" />
                </div>
                <div>
                  <Label htmlFor="quick-occupation">Occupation</Label>
                  <Input id="quick-occupation" placeholder="Job title" />
                </div>
                <div>
                  <Label htmlFor="quick-employer">Employer</Label>
                  <Input id="quick-employer" placeholder="Company name" />
                </div>
                <div>
                  <Label htmlFor="quick-emergency-name">Emergency Contact Name *</Label>
                  <Input id="quick-emergency-name" placeholder="Emergency contact name" />
                </div>
                <div>
                  <Label htmlFor="quick-emergency-phone">Emergency Contact Phone *</Label>
                  <Input id="quick-emergency-phone" placeholder="Emergency contact phone" />
                </div>
              </div>
            </div>

            {/* Booking Information Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Booking Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quick-property-unit">Property & Unit *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunset-2a">Sunset Apartments - 2A</SelectItem>
                      <SelectItem value="valley-3b">Green Valley - 3B</SelectItem>
                      <SelectItem value="riverside-1c">Riverside Studios - 1C</SelectItem>
                      <SelectItem value="metro-2b">Metro Lofts - 2B</SelectItem>
                      <SelectItem value="heritage-4a">Heritage Townhomes - 4A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quick-checkin-date">Check-in Date *</Label>
                  <Input id="quick-checkin-date" type="date" />
                </div>
                <div>
                  <Label htmlFor="quick-checkout-date">Check-out Date *</Label>
                  <Input id="quick-checkout-date" type="date" />
                </div>
                <div>
                  <Label htmlFor="quick-guests">Number of Guests *</Label>
                  <Input id="quick-guests" type="number" min="1" placeholder="1" />
                </div>
                <div>
                  <Label htmlFor="quick-total-amount">Total Amount (KES) *</Label>
                  <Input id="quick-total-amount" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="quick-paid-amount">Paid Amount (KES)</Label>
                  <Input id="quick-paid-amount" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="quick-source">Booking Source *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct (Walk-in)</SelectItem>
                      <SelectItem value="airbnb">Airbnb</SelectItem>
                      <SelectItem value="booking">Booking.com</SelectItem>
                      <SelectItem value="expedia">Expedia</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quick-purpose">Purpose of Visit</Label>
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
                  <Label htmlFor="quick-special-requests">Special Requests</Label>
                  <Textarea id="quick-special-requests" placeholder="Any special requests or notes..." />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="quick-notes">Guest Notes</Label>
                  <Textarea id="quick-notes" placeholder="Additional notes about the guest..." />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 pt-4 border-t">
            <Button 
              className="flex-1" 
              onClick={() => {
                console.log('Quick booking completed');
                setIsQuickBookOpen(false);
              }}
            >
              <Bed className="h-4 w-4 mr-2" />
              Register Guest & Create Booking
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsQuickBookOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
            <p className="text-xs text-muted-foreground">
              Registered guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedGuests}</div>
            <p className="text-xs text-muted-foreground">
              ID verified guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Guests</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repeatGuests}</div>
            <p className="text-xs text-muted-foreground">
              Multiple stays
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kenyan Guests</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kenyanGuests}</div>
            <p className="text-xs text-muted-foreground">
              Local residents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">International</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internationalGuests}</div>
            <p className="text-xs text-muted-foreground">
              Foreign visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Guest rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Nationality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Nationalities</SelectItem>
            <SelectItem value="Kenyan">Kenyan</SelectItem>
            <SelectItem value="American">American</SelectItem>
            <SelectItem value="British">British</SelectItem>
            <SelectItem value="German">German</SelectItem>
            <SelectItem value="Brazilian">Brazilian</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verificationFilter} onValueChange={setVerificationFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Guests Table */}
      
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>ID Information</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Stay History</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Last Stay</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {guest.firstName[0]}{guest.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{guest.firstName} {guest.lastName}</p>
                            {guest.totalStays > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Bed className="h-3 w-3 mr-1" />
                                {guest.totalStays} stays
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{guest.occupation || 'N/A'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-xs">{guest.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <Phone className="h-3 w-3" />
                          <span>{guest.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Flag className="h-4 w-4" />
                        <span>{guest.nationality}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{guest.idType}</p>
                        <p className="text-sm text-muted-foreground">
                          {guest.idNumber || guest.passportNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={getVerificationColor(guest.verificationStatus)}>
                          {guest.verificationStatus === 'verified' && <Shield className="h-3 w-3 mr-1" />}
                          {guest.verificationStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {guest.verificationStatus}
                        </Badge>
                        {guest.lastStay && new Date(guest.lastStay) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                          <p className="text-xs text-green-600">Recent guest</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{guest.totalStays} stays</p>
                          {guest.totalStays > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {guest.totalNights} nights
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(guest.totalSpent)}
                        </p>
                        {guest.lastStay && (
                          <p className="text-xs text-muted-foreground">
                            Last: {formatDate(guest.lastStay)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {guest.rating ? (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{guest.rating}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(guest.lastStay)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCreateBooking(guest)}
                          title="Create Booking for this guest"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Bed className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredGuests.length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No guests found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
    </div>
  );
}