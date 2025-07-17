"use client";

import AdminOnly from "@/components/AdminOnly";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useBanUser,
  useDeleteUser,
  useRevokeUserSessions,
  useSetUserRole,
  useUnbanUser,
  useUsers
} from "@/hooks/useUsers";
import {
  Ban,
  Calendar,
  Download,
  Edit,
  Eye,
  Flag,
  LogOut,
  Mail,
  MoreHorizontal,
  Search,
  Shield,
  Trash2,
  Check as Unban,
  UserCheck,
  UserPlus,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason?: string;
  banExpires?: string;
  createdAt: string;
  emailVerified: boolean;
}

interface Invitation {
  name: string;
  email: string;
  acceptedAt: string | null;
}

function UsersPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "user" as "user" | "admin"
  });

  // Ban form state
  const [banForm, setBanForm] = useState({
    reason: "",
    expiresIn: "7" // days
  });

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  useEffect(() => {
    fetch("/api/invitations/list")
      .then(res => res.json())
      .then(data => setInvitations(data.invitations || []));
  }, []);

  const handleResendInvite = async (email: string) => {
    await fetch("/api/invitations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    // Optionally show a toast or reload invitations
  };

  // React Query hooks
  const { data: users = [], isLoading, error } = useUsers(searchQuery);
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();
  const deleteUserMutation = useDeleteUser();
  const setUserRoleMutation = useSetUserRole();
  const revokeSessionsMutation = useRevokeUserSessions();

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      setInviteDialogOpen(false);
      setInviteForm({ email: "", role: "user" });
      // Optionally show a toast
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
      // Optionally show error
    }
  };

  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const expiresIn = parseInt(banForm.expiresIn) * 24 * 60 * 60; // Convert days to seconds
    
    banUserMutation.mutate({
      userId: selectedUser.id,
      reason: banForm.reason || undefined,
      expiresIn
    }, {
      onSuccess: () => {
        setBanDialogOpen(false);
        setBanForm({ reason: "", expiresIn: "7" });
        setSelectedUser(null);
      }
    });
  };

  const handleUnbanUser = async (userId: string) => {
    unbanUserMutation.mutate(userId);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    deleteUserMutation.mutate(userId);
  };

  const handleRevokeAllSessions = async (userId: string) => {
    revokeSessionsMutation.mutate(userId);
  };

  const handleSetRole = async (userId: string, role: "user" | "admin") => {
    setUserRoleMutation.mutate({ userId, role });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Statistics
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === "admin").length;
  const regularUsers = users.filter(u => u.role === "user").length;
  const bannedUsers = users.filter(u => u.banned).length;

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-600">Error loading users</h3>
        <p className="text-muted-foreground">
          There was an error loading the users. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with the specified role.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value: "user" | "admin") => setInviteForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                  >
                    Invite User
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-red-600">{adminUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regular Users</p>
                <p className="text-2xl font-bold text-blue-600">{regularUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Flag className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Banned</p>
                <p className="text-2xl font-bold text-orange-600">{bannedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {user.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {user.role === "admin" ? "Administrator" : "Regular User"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                    {user.banned && (
                      <Badge variant="destructive" className="text-xs">
                        Banned
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Joined {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {user.emailVerified ? "Email Verified" : "Email Not Verified"}
                    </span>
                  </div>
                </div>

                {/* Ban Information */}
                {user.banned && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Banned</p>
                    {user.banReason && (
                      <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                        Reason: {user.banReason}
                      </p>
                    )}
                    {user.banExpires && (
                      <p className="text-xs text-red-600 dark:text-red-300">
                        Expires: {formatDate(user.banExpires)}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => handleSetRole(user.id, user.role === "admin" ? "user" : "admin")}
                        disabled={setUserRoleMutation.isPending}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => handleRevokeAllSessions(user.id)}
                        disabled={revokeSessionsMutation.isPending}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Revoke All Sessions
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {user.banned ? (
                        <DropdownMenuItem 
                          onClick={() => handleUnbanUser(user.id)}
                          disabled={unbanUserMutation.isPending}
                        >
                          <Unban className="h-4 w-4 mr-2" />
                          Unban User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser(user);
                          setBanDialogOpen(true);
                        }}>
                          <Ban className="h-4 w-4 mr-2" />
                          Ban User
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteUserMutation.isPending}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
          {invitations.filter(i => !i.acceptedAt).map(invite => (
            <Card key={invite.email} className="hover:shadow-lg transition-shadow border-dashed border-2 border-blue-400">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{invite.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{invite.email}</p>
                    <p className="text-xs text-blue-600">Invitation Pending</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleResendInvite(invite.email)}>
                    Resend Invite
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No users found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search criteria" : "Get started by inviting your first user"}
          </p>
        </div>
      )}

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {selectedUser?.name} from accessing the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBanUser} className="space-y-4">
            <div>
              <Label htmlFor="reason">Ban Reason (Optional)</Label>
              <Input
                id="reason"
                value={banForm.reason}
                onChange={(e) => setBanForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for ban..."
                disabled={banUserMutation.isPending}
              />
            </div>
            <div>
              <Label htmlFor="expiresIn">Ban Duration</Label>
              <Select
                value={banForm.expiresIn}
                onValueChange={(value) => setBanForm(prev => ({ ...prev, expiresIn: value }))}
                disabled={banUserMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setBanDialogOpen(false)}
                disabled={banUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={banUserMutation.isPending}
              >
                {banUserMutation.isPending ? "Banning..." : "Ban User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminOnly>
      <UsersPageContent />
    </AdminOnly>
  );
}