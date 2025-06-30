import { CheckoutDialog } from '@/components/CheckoutDialog';
import { InventoryDialog } from '@/components/InventoryDialog';
import { InventoryEditDialog } from '@/components/InventoryEditDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
                    <InventoryDialog />
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
                    {/* Inventory Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => {
                            const StatusIcon = getStatusIcon(item.status);
                            const CategoryIcon = getCategoryIcon(item.category);
                            return (
                                <Card
                                    key={item.id}
                                    className="hover:shadow-lg transition-shadow"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-muted/50 rounded-lg">
                                                    <CategoryIcon className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">
                                                        {item.itemName}
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.category}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={getStatusColor(item.status) as "default" | "secondary" | "destructive" | "outline"}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {item.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Description */}
                                        <p className="text-sm text-muted-foreground">
                                            {item.description}
                                        </p>

                                        {/* Property Information */}
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Bed className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{item.property.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">{item.unit.name}</span>
                                            </div>
                                        </div>

                                        {/* Condition and Location */}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                                                <p className="font-medium">Condition</p>
                                                <p className={getConditionColor(item.condition)}>{item.condition}</p>
                                            </div>
                                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                                                <p className="font-medium">Quantity</p>
                                                <p className="text-muted-foreground">{item.quantity}</p>
                                            </div>
                                        </div>

                                        {/* Financial Information */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Current Value</span>
                                                <span className="font-medium">{formatCurrency(item.currentValue)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Purchase Price</span>
                                                <span className="text-sm">{formatCurrency(item.purchasePrice)}</span>
                                            </div>
                                        </div>

                                        {/* Last Inspected */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Last Inspected</span>
                                            <span className="text-sm">{formatDate(item.lastInspected)}</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-2 pt-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                            <InventoryEditDialog item={item}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </InventoryEditDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No inventory items found</h3>
                            <p className="text-muted-foreground">
                                {search ? "Try adjusting your search criteria" : "Get started by adding your first inventory item"}
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="checkout" className="space-y-4">
                    {/* Checkout Reports Grid */}
                    {checkoutReports.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {checkoutReports.map((report) => (
                                <Card
                                    key={report.id}
                                    className="hover:shadow-lg transition-shadow"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {report.guest.firstName} {report.guest.lastName}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {report.guest.email}
                                                </p>
                                            </div>
                                            <Badge variant={report.status === "completed" ? "default" : "secondary"}>
                                                {report.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Property Information */}
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Bed className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{report.booking.property.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">{report.booking.unit.name}</span>
                                            </div>
                                        </div>

                                        {/* Checkout Date and Inspector */}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                                                <p className="font-medium">Checkout Date</p>
                                                <p className="text-muted-foreground">{formatDate(report.checkoutDate)}</p>
                                            </div>
                                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                                                <p className="font-medium">Inspector</p>
                                                <p className="text-muted-foreground">{report.inspector}</p>
                                            </div>
                                        </div>

                                        {/* Financial Information */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Damage Cost</span>
                                                <span className={report.totalDamageCost > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                                                    {formatCurrency(report.totalDamageCost)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Deposit Deduction</span>
                                                <span className={report.depositDeduction > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                                                    {formatCurrency(report.depositDeduction)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-2 pt-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No checkout reports found</h3>
                            <p className="text-muted-foreground">
                                Checkout reports will appear here after guest checkouts are completed.
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}