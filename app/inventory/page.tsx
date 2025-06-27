import { CheckoutDialog } from '@/components/CheckoutDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getCheckoutReports } from '@/lib/actions/checkout';
import { getInventoryItems } from '@/lib/actions/inventory';
import { getAllPropertiesWithUnits as getProperties } from '@/lib/actions/properties';
import {
    AlertTriangle,
    Bath,
    Bed,
    CheckCircle,
    Download,
    Edit,
    Eye,
    Lamp,
    Monitor,
    Package,
    Plus,
    Search,
    UtensilsCrossed,
    Wrench,
    XCircle
} from 'lucide-react';

interface InventoryPageProps {
    searchParams: Promise<{ 
        search?: string;
        category?: string;
        status?: string;
        property?: string;
        tab?: string;
    }>
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
    const { search, category, status, property, tab } = await searchParams;
    
    // Fetch real data from database
    const inventoryItems = await getInventoryItems();
    const properties = await getProperties();
    const checkoutReports = await getCheckoutReports();
    
    // Filter items based on search params
    const filteredItems = inventoryItems.filter(item => {
        const matchesSearch = !search || 
            item.itemName.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase()) ||
            item.property.name.toLowerCase().includes(search.toLowerCase()) ||
            item.unit.name.toLowerCase().includes(search.toLowerCase());
        
        const matchesCategory = !category || category === 'all' || item.category === category;
        const matchesStatus = !status || status === 'all' || item.status === status;
        const matchesProperty = !property || property === 'all' || item.property.name === property;
        
        return matchesSearch && matchesCategory && matchesStatus && matchesProperty;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'damaged': return 'destructive';
            case 'missing': return 'destructive';
            case 'maintenance': return 'secondary';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return CheckCircle;
            case 'damaged': return AlertTriangle;
            case 'missing': return XCircle;
            case 'maintenance': return Wrench;
            default: return Package;
        }
    };

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'Excellent': return 'text-green-600';
            case 'Good': return 'text-blue-600';
            case 'Fair': return 'text-yellow-600';
            case 'Poor': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Furniture': return Bed;
            case 'Electronics': return Monitor;
            case 'Appliances': return UtensilsCrossed;
            case 'Bathroom': return Bath;
            case 'Lighting': return Lamp;
            case 'Other': return Package;
            default: return Package;
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

    // Statistics
    const totalItems = inventoryItems.length;
    const activeItems = inventoryItems.filter(i => i.status === 'active').length;
    const damagedItems = inventoryItems.filter(i => i.status === 'damaged').length;
    const missingItems = inventoryItems.filter(i => i.status === 'missing').length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1>Inventory Management</h1>
                    <p className="text-muted-foreground">Manage property inventory and guest checkout inspections</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <CheckoutDialog />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add Inventory Item</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="property-unit">Property & Unit</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {properties.map(property => 
                                                property.units.map(unit => (
                                                    <SelectItem key={unit.id} value={`${property.id}-${unit.id}`}>
                                                        {property.name} - {unit.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Furniture">Furniture</SelectItem>
                                            <SelectItem value="Electronics">Electronics</SelectItem>
                                            <SelectItem value="Appliances">Appliances</SelectItem>
                                            <SelectItem value="Bathroom">Bathroom</SelectItem>
                                            <SelectItem value="Lighting">Lighting</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="item-name">Item Name</Label>
                                    <Input id="item-name" placeholder="e.g., Sofa Set" />
                                </div>
                                <div>
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input id="quantity" type="number" min="1" placeholder="1" />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input id="description" placeholder="Detailed description of the item" />
                                </div>
                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" placeholder="e.g., Living Room" />
                                </div>
                                <div>
                                    <Label htmlFor="condition">Condition</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Excellent">Excellent</SelectItem>
                                            <SelectItem value="Good">Good</SelectItem>
                                            <SelectItem value="Fair">Fair</SelectItem>
                                            <SelectItem value="Poor">Poor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="purchase-date">Purchase Date</Label>
                                    <Input id="purchase-date" type="date" />
                                </div>
                                <div>
                                    <Label htmlFor="purchase-price">Purchase Price (KES)</Label>
                                    <Input id="purchase-price" type="number" placeholder="0" />
                                </div>
                                <div>
                                    <Label htmlFor="current-value">Current Value (KES)</Label>
                                    <Input id="current-value" type="number" placeholder="0" />
                                </div>
                                <div>
                                    <Label htmlFor="serial-number">Serial Number</Label>
                                    <Input id="serial-number" placeholder="Optional" />
                                </div>
                                <div>
                                    <Label htmlFor="supplier">Supplier</Label>
                                    <Input id="supplier" placeholder="Optional" />
                                </div>
                                <div>
                                    <Label htmlFor="warranty-expiry">Warranty Expiry</Label>
                                    <Input id="warranty-expiry" type="date" />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea id="notes" placeholder="Additional notes..." />
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Button className="flex-1">Add Item</Button>
                                <Button variant="outline" className="flex-1">Cancel</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                                <p className="text-2xl font-bold">{totalItems}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold text-green-600">{activeItems}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Damaged</p>
                                <p className="text-2xl font-bold text-red-600">{damagedItems}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Missing</p>
                                <p className="text-2xl font-bold text-red-600">{missingItems}</p>
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
                        placeholder="Search inventory..."
                        defaultValue={search || ''}
                        className="pl-10"
                    />
                </div>
                <Select defaultValue={category || 'all'}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Appliances">Appliances</SelectItem>
                        <SelectItem value="Bathroom">Bathroom</SelectItem>
                        <SelectItem value="Lighting">Lighting</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue={status || 'all'}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                        <SelectItem value="missing">Missing</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
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

            {/* Tabs */}
            <Tabs defaultValue={tab || 'inventory'} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
                    <TabsTrigger value="checkout">Checkout Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Property/Unit</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Condition</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Last Inspected</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map((item) => {
                                        const StatusIcon = getStatusIcon(item.status);
                                        const CategoryIcon = getCategoryIcon(item.category);
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{item.itemName}</p>
                                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{item.property.name}</p>
                                                        <p className="text-sm text-muted-foreground">{item.unit.name}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                                                        <span>{item.category}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={getConditionColor(item.condition)}>
                                                        {item.condition}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusColor(item.status) as "default" | "secondary" | "destructive" | "outline"}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{formatCurrency(item.currentValue)}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Bought: {formatCurrency(item.purchasePrice)}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(item.lastInspected)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="checkout" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Checkout Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {checkoutReports.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Guest</TableHead>
                                            <TableHead>Property/Unit</TableHead>
                                            <TableHead>Checkout Date</TableHead>
                                            <TableHead>Inspector</TableHead>
                                            <TableHead>Damage Cost</TableHead>
                                            <TableHead>Deposit Deduction</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {checkoutReports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">
                                                            {report.guest.firstName} {report.guest.lastName}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {report.guest.email}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">
                                                            {report.booking.property.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {report.booking.unit.name}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(report.checkoutDate)}
                                                </TableCell>
                                                <TableCell>
                                                    {report.inspector}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={report.totalDamageCost > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                                                        {formatCurrency(report.totalDamageCost)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={report.depositDeduction > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                                                        {formatCurrency(report.depositDeduction)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={report.status === "completed" ? "default" : "secondary"}>
                                                        {report.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-muted-foreground">No checkout reports found. Checkout reports will appear here after guest checkouts are completed.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}