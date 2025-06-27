import { GuestDialog } from '@/components/GuestDialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getGuests } from '@/lib/actions/guests';
import { getAllPropertiesWithUnits as getProperties } from '@/lib/actions/properties';
import {
  Bed,
  Clock,
  Download,
  Edit,
  Eye,
  Flag,
  Mail,
  Phone,
  Search,
  Shield,
  Star,
  UserCheck,
  Users
} from 'lucide-react';

interface GuestsPageProps {
    searchParams: Promise<{ 
        search?: string;
        nationality?: string;
        verification?: string;
    }>
}

export default async function GuestsPage({ searchParams }: GuestsPageProps) {
    const { search, nationality, verification } = await searchParams;
    
    // Fetch real data from database
    const guests = await getGuests();
    const properties = await getProperties();
    
    // Filter guests based on search params
    const filteredGuests = guests.filter(guest => {
        const matchesSearch = !search || 
            guest.firstName.toLowerCase().includes(search.toLowerCase()) ||
            guest.lastName.toLowerCase().includes(search.toLowerCase()) ||
            guest.email.toLowerCase().includes(search.toLowerCase()) ||
            guest.phone.toLowerCase().includes(search.toLowerCase());
        
        const matchesNationality = !nationality || nationality === 'all' || guest.nationality === nationality;
        const matchesVerification = !verification || verification === 'all' || guest.verificationStatus === verification;
        
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

    const formatDate = (dateString: string | Date | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };

    // Statistics
    const totalGuests = guests.length;
    const verifiedGuests = guests.filter(g => g.verificationStatus === 'verified').length;
    const pendingGuests = guests.filter(g => g.verificationStatus === 'pending').length;
    const blacklistedGuests = guests.filter(g => g.blacklisted).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1>Guest Management</h1>
                    <p className="text-muted-foreground">Manage guest registrations, bookings, and check-ins</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Bed className="h-4 w-4 mr-2" />
                                Quick Book
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Quick Booking</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="quick-guest-name">Guest Name</Label>
                                        <Input id="quick-guest-name" placeholder="Full name" />
                                    </div>
                                    <div>
                                        <Label htmlFor="quick-guest-phone">Phone</Label>
                                        <Input id="quick-guest-phone" placeholder="Phone number" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="quick-property">Property</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select property" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {properties.map(property => (
                                                    <SelectItem key={property.id} value={property.id.toString()}>
                                                        {property.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="quick-unit">Unit</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {properties.map(property => 
                                                    property.units.map(unit => (
                                                        <SelectItem key={unit.id} value={unit.id.toString()}>
                                                            {property.name} - {unit.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="quick-checkin">Check-in Date</Label>
                                        <Input id="quick-checkin" type="date" />
                                    </div>
                                    <div>
                                        <Label htmlFor="quick-checkout">Check-out Date</Label>
                                        <Input id="quick-checkout" type="date" />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="quick-amount">Total Amount</Label>
                                    <Input id="quick-amount" type="number" placeholder="0" />
                                </div>
                                <div className="flex space-x-2">
                                    <Button className="flex-1">Create Booking</Button>
                                    <Button variant="outline" className="flex-1">Cancel</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <GuestDialog />
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
                                <p className="text-2xl font-bold">{totalGuests}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <UserCheck className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Verified</p>
                                <p className="text-2xl font-bold text-green-600">{verifiedGuests}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{pendingGuests}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Flag className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Blacklisted</p>
                                <p className="text-2xl font-bold text-red-600">{blacklistedGuests}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search guests..."
                        defaultValue={search || ''}
                        className="pl-10"
                    />
                </div>
                <Select defaultValue={nationality || 'all'}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Nationalities</SelectItem>
                        <SelectItem value="Kenyan">Kenyan</SelectItem>
                        <SelectItem value="American">American</SelectItem>
                        <SelectItem value="Brazilian">Brazilian</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue={verification || 'all'}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
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
            <Card>
                <CardHeader>
                    <CardTitle>Guests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Guest</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Nationality</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total Stays</TableHead>
                                <TableHead>Total Spent</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredGuests.map((guest) => (
                                <TableRow key={guest.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {guest.firstName[0]}{guest.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{guest.firstName} {guest.lastName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {guest.occupation || 'Not specified'}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{guest.email}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{guest.phone}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            <span>{guest.nationality}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getVerificationColor(guest.verificationStatus) as "default" | "secondary" | "destructive" | "outline"}>
                                            {guest.verificationStatus}
                                        </Badge>
                                        {guest.blacklisted && (
                                            <Badge variant="destructive" className="ml-2">
                                                Blacklisted
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-center">
                                            <p className="font-medium">{guest.totalStays}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {guest.totalNights} nights
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{formatCurrency(guest.totalSpent)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Last: {formatDate(guest.lastStay)}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {guest.rating ? (
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{guest.rating}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">No rating</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Bed className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {filteredGuests.length === 0 && (
                <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No guests found</h3>
                    <p className="text-muted-foreground">
                        {search ? "Try adjusting your search criteria" : "Get started by adding your first guest"}
                    </p>
                </div>
            )}
        </div>
    );
} 