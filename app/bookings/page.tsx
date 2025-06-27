import { BookingDialog } from '@/components/BookingDialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBookings } from '@/lib/actions/bookings';
import { getAllPropertiesWithUnits as getProperties } from '@/lib/actions/properties';
import {
  Bed,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  Search,
  XCircle
} from 'lucide-react';

interface BookingsPageProps {
    searchParams: Promise<{ 
        search?: string;
        status?: string;
        property?: string;
    }>
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
    const { search, status, property } = await searchParams;
    
    // Fetch real data from database
    const bookings = await getBookings();
    const properties = await getProperties();
    
    // Filter bookings based on search params
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = !search || 
            booking.guest.firstName.toLowerCase().includes(search.toLowerCase()) ||
            booking.guest.lastName.toLowerCase().includes(search.toLowerCase()) ||
            booking.guest.email.toLowerCase().includes(search.toLowerCase()) ||
            booking.property.name.toLowerCase().includes(search.toLowerCase()) ||
            booking.unit.name.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = !status || status === 'all' || booking.status === status;
        const matchesProperty = !property || property === 'all' || booking.property.name === property;
        
        return matchesSearch && matchesStatus && matchesProperty;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'default';
            case 'pending': return 'secondary';
            case 'cancelled': return 'destructive';
            case 'completed': return 'default';
            case 'checked_in': return 'default';
            case 'checked_out': return 'default';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return CheckCircle;
            case 'pending': return Clock;
            case 'cancelled': return XCircle;
            case 'completed': return CheckCircle;
            case 'checked_in': return Bed;
            case 'checked_out': return CheckCircle;
            default: return Clock;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatDateTime = (dateString: string | Date) => {
        return new Date(dateString).toLocaleString();
    };

    // Statistics
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1>Bookings</h1>
                    <p className="text-muted-foreground">Manage guest bookings and reservations</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <BookingDialog />
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                                <p className="text-2xl font-bold">{totalBookings}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                                <p className="text-2xl font-bold text-green-600">{confirmedBookings}</p>
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
                                <p className="text-2xl font-bold text-yellow-600">{pendingBookings}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Bed className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold text-blue-600">{completedBookings}</p>
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
                        placeholder="Search bookings..."
                        defaultValue={search || ''}
                        className="pl-10"
                    />
                </div>
                <Select defaultValue={status || 'all'}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="checked_in">Checked In</SelectItem>
                        <SelectItem value="checked_out">Checked Out</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue={property || 'all'}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Properties</SelectItem>
                        {properties.map(property => (
                            <SelectItem key={property.id} value={property.name}>
                                {property.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Bookings Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Guest</TableHead>
                                <TableHead>Property/Unit</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {booking.guest.firstName[0]}{booking.guest.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{booking.guest.firstName} {booking.guest.lastName}</p>
                                                <p className="text-sm text-muted-foreground">{booking.guest.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{booking.property.name}</p>
                                            <p className="text-sm text-muted-foreground">{booking.unit.name}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{formatDate(booking.checkInDate)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{formatDate(booking.checkOutDate)}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(booking.status) as "default" | "secondary" | "destructive" | "outline"}>
                                            <div className="flex items-center space-x-1">
                                                {(() => {
                                                    const StatusIcon = getStatusIcon(booking.status);
                                                    return <StatusIcon className="h-3 w-3" />;
                                                })()}
                                                <span>{booking.status.replace('_', ' ')}</span>
                                            </div>
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{formatCurrency(booking.totalAmount)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'guest' : 'guests'}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium capitalize">{booking.source}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDateTime(booking.createdAt)}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            {booking.status === 'confirmed' && (
                                                <Button variant="outline" size="sm">
                                                    <Bed className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {filteredBookings.length === 0 && (
                <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No bookings found</h3>
                    <p className="text-muted-foreground">
                        {search ? "Try adjusting your search criteria" : "Get started by creating your first booking"}
                    </p>
                </div>
            )}
        </div>
    );
} 