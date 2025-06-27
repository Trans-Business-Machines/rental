 "use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertTriangle,
    Bath,
    Bed,
    Camera,
    CheckCircle,
    ClipboardList,
    Download,
    Edit,
    Eye,
    FileText,
    Lamp,
    Monitor,
    Package,
    Plus,
    Search,
    UtensilsCrossed,
    Wrench,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

const mockInventoryItems = [
  {
    id: 1,
    property: 'Sunset Apartments',
    unit: 'Apartment 2A',
    category: 'Furniture',
    itemName: 'Sofa Set (3-seater)',
    description: 'Brown leather 3-seater sofa with matching cushions',
    quantity: 1,
    condition: 'Good',
    purchaseDate: '2023-01-15',
    purchasePrice: 45000,
    currentValue: 35000,
    location: 'Living Room',
    serialNumber: 'SF-001-2A',
    supplier: 'Furniture Palace',
    warrantyExpiry: '2025-01-15',
    status: 'active',
    lastInspected: '2025-06-01',
    notes: 'Minor wear on arms, overall good condition'
  },
  {
    id: 2,
    property: 'Sunset Apartments',
    unit: 'Apartment 2A',
    category: 'Electronics',
    itemName: '50" Smart TV',
    description: 'Samsung 50-inch Smart TV with wall mount',
    quantity: 1,
    condition: 'Excellent',
    purchaseDate: '2024-03-10',
    purchasePrice: 65000,
    currentValue: 55000,
    location: 'Living Room',
    serialNumber: 'TV-001-2A',
    supplier: 'Electronics Hub',
    warrantyExpiry: '2026-03-10',
    status: 'active',
    lastInspected: '2025-06-01',
    notes: 'Perfect working condition, remote included'
  },
  {
    id: 3,
    property: 'Sunset Apartments',
    unit: 'Apartment 2A',
    category: 'Appliances',
    itemName: 'Refrigerator',
    description: 'LG 300L double-door refrigerator',
    quantity: 1,
    condition: 'Good',
    purchaseDate: '2023-06-20',
    purchasePrice: 55000,
    currentValue: 40000,
    location: 'Kitchen',
    serialNumber: 'RF-001-2A',
    supplier: 'Home Appliances Co',
    warrantyExpiry: '2025-06-20',
    status: 'damaged',
    lastInspected: '2025-06-08',
    notes: 'Door seal needs replacement, guest reported issue'
  },
  {
    id: 4,
    property: 'Green Valley Condos',
    unit: 'Condo 3B',
    category: 'Furniture',
    itemName: 'Queen Size Bed',
    description: 'Wooden queen size bed with memory foam mattress',
    quantity: 1,
    condition: 'Good',
    purchaseDate: '2023-08-15',
    purchasePrice: 35000,
    currentValue: 28000,
    location: 'Master Bedroom',
    serialNumber: 'BD-001-3B',
    supplier: 'Sleep Comfort',
    warrantyExpiry: '2028-08-15',
    status: 'active',
    lastInspected: '2025-06-05',
    notes: 'Mattress in excellent condition, bed frame solid'
  }
];

const mockCheckoutReports = [
  {
    id: 1,
    property: 'Sunset Apartments',
    unit: 'Apartment 2A',
    guestName: 'James Kimani',
    checkoutDate: '2025-06-08',
    inspector: 'Mary Johnson',
    damagedItems: [
      { itemId: 3, damage: 'Door seal damaged', cost: 2500 }
    ],
    missingItems: [],
    totalDamageCost: 2500,
    depositDeduction: 2500,
    status: 'completed',
    notes: 'Guest acknowledged damage, very cooperative'
  },
  {
    id: 2,
    property: 'Riverside Studios',
    unit: 'Studio 1C',
    guestName: 'David Ochieng',
    checkoutDate: '2025-06-09',
    inspector: 'John Smith',
    damagedItems: [],
    missingItems: [],
    totalDamageCost: 0,
    depositDeduction: 0,
    status: 'completed',
    notes: 'Perfect condition, no issues found'
  }
];

export default function InventoryPage() {
  const [inventoryItems] = useState(mockInventoryItems);
  const [checkoutReports] = useState(mockCheckoutReports);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('inventory');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || item.property === propertyFilter;
    
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

  const formatDate = (dateString: string) => {
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
          <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ClipboardList className="h-4 w-4 mr-2" />
                Guest Checkout
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Guest Checkout Inspection</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="checkout-guest">Guest</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select guest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="james">James Kimani - Apt 2A</SelectItem>
                        <SelectItem value="sarah">Sarah Mitchell - Condo 3B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="checkout-date">Checkout Date</Label>
                    <Input id="checkout-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="inspector">Inspector</Label>
                    <Input id="inspector" placeholder="Inspector name" />
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Inventory Checklist</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                    {inventoryItems.filter(item => item.property === 'Sunset Apartments' && item.unit === 'Apartment 2A').map((item) => {
                      const CategoryIcon = getCategoryIcon(item.category);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox />
                            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{item.itemName}</p>
                              <p className="text-sm text-muted-foreground">{item.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select defaultValue="good">
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="missing">Missing</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input placeholder="Damage cost" className="w-24" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="checkout-notes">Inspection Notes</Label>
                  <Textarea id="checkout-notes" placeholder="Overall condition notes, guest cooperation, etc..." />
                </div>

                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="font-medium">Total Damage Cost:</span>
                  <span className="text-lg font-bold">KES 0</span>
                </div>

                <div className="flex space-x-2">
                  <Button className="flex-1">Complete Checkout</Button>
                  <Button variant="outline" className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Add Photos
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
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
                      <SelectItem value="sunset-2a">Sunset Apartments - 2A</SelectItem>
                      <SelectItem value="valley-3b">Green Valley - 3B</SelectItem>
                      <SelectItem value="riverside-1c">Riverside Studios - 1C</SelectItem>
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
                  <Input id="supplier" placeholder="Supplier name" />
                </div>
                <div>
                  <Label htmlFor="warranty-expiry">Warranty Expiry</Label>
                  <Input id="warranty-expiry" type="date" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional notes about the item..." />
                </div>
                <div className="col-span-2">
                  <Button className="w-full">Add Item</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              All properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeItems}</div>
            <p className="text-xs text-muted-foreground">
              Good condition
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Damaged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{damagedItems}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missingItems}</div>
            <p className="text-xs text-muted-foreground">
              Lost items
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
          <TabsTrigger value="checkouts">Checkout Reports</TabsTrigger>
        </TabsList>

        {/* Inventory Items */}
        <TabsContent value="inventory" className="space-y-4">
          {/* Search and Filters */}    
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Category" />
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="Sunset Apartments">Sunset Apartments</SelectItem>
                <SelectItem value="Green Valley Condos">Green Valley Condos</SelectItem>
                <SelectItem value="Riverside Studios">Riverside Studios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardContent className="p-0">
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Property</TableHead>
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
                            <div className="flex items-center space-x-3">
                              <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{item.itemName}</p>
                                <p className="text-sm text-muted-foreground">{item.location}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.unit}</p>
                              <p className="text-sm text-muted-foreground">{item.property}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${getConditionColor(item.condition)}`}>
                              {item.condition}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(item.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{formatCurrency(item.currentValue)}</p>
                              <p className="text-xs text-muted-foreground">
                                Orig: {formatCurrency(item.purchasePrice)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(item.lastInspected)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checkout Reports */}
        <TabsContent value="checkouts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {checkoutReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.guestName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{report.unit}</p>
                      <p className="text-sm text-muted-foreground">{report.property}</p>
                    </div>
                    <Badge variant={report.totalDamageCost > 0 ? 'destructive' : 'default'}>
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Checkout Date</span>
                      <p className="font-medium">{formatDate(report.checkoutDate)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Inspector</span>
                      <p className="font-medium">{report.inspector}</p>
                    </div>
                  </div>

                  {report.damagedItems.length > 0 && (
                    <div className="border-t pt-3">
                      <h4 className="font-medium text-destructive mb-2">Damage Report</h4>
                      {report.damagedItems.map((damage, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{damage.damage}</span>
                          <span className="font-medium">{formatCurrency(damage.cost)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Damage Cost</span>
                      <span className={`font-bold ${report.totalDamageCost > 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {formatCurrency(report.totalDamageCost)}
                      </span>
                    </div>
                    {report.depositDeduction > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Deposit Deduction</span>
                        <span className="font-medium">{formatCurrency(report.depositDeduction)}</span>
                      </div>
                    )}
                  </div>

                  {report.notes && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground">{report.notes}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Report
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredItems.length === 0 && selectedTab === 'inventory' && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No inventory items found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}