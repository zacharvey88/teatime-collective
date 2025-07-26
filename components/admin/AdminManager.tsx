'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Plus, Edit, Trash2, User, Shield, Eye, Pencil } from 'lucide-react'
import { AdminUserService, CreateAdminUserData, UpdateAdminUserData } from '@/lib/adminUserService'
import { AuthService, AdminUser } from '@/lib/auth'

export default function AdminManager() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canManageAdmins, setCanManageAdmins] = useState(false)
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'viewer' as 'admin' | 'editor' | 'viewer' | 'superadmin',
    permissions: {} as Record<string, boolean>
  })

  // Load admin users and check permissions
  useEffect(() => {
    loadAdminUsers()
    checkPermissions()
  }, [])

  // Reset form when showing add form
  useEffect(() => {
    if (showAddForm && !editingId) {
      resetForm()
    }
  }, [showAddForm, editingId])

  const loadAdminUsers = async () => {
    try {
      setLoading(true)
      const users = await AdminUserService.getAdminUsers()
      setAdminUsers(users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const checkPermissions = async () => {
    try {
      const canManage = await AuthService.canManageAdmins()
      setCanManageAdmins(canManage)
    } catch (err) {
      console.error('Error checking permissions:', err)
    }
  }

  const handleAddAdmin = async () => {
    try {
      setError(null)
      
      if (!formData.email || !formData.name) {
        setError('Email and name are required')
        return
      }

      const adminData: CreateAdminUserData = {
        email: formData.email.toLowerCase(),
        name: formData.name,
        role: formData.role,
        permissions: formData.permissions
      }

      await AdminUserService.createAdminUser(adminData)
      await loadAdminUsers()
      resetForm()
      setShowAddForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  const handleUpdateAdmin = async () => {
    if (!editingId) return
    
    try {
      setError(null)
      
      const updates: UpdateAdminUserData = {
        name: formData.name,
        role: formData.role,
        permissions: formData.permissions
      }

      await AdminUserService.updateAdminUser(editingId, updates)
      await loadAdminUsers()
      resetForm()
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  const handleDeleteAdmin = async (id: string) => {
    const admin = adminUsers.find(u => u.id === id)
    if (!admin) return
    
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${admin.name}"? They will no longer be able to access the dashboard.`
    )
    
    if (confirmed) {
      try {
        await AdminUserService.deleteAdminUser(id)
        await loadAdminUsers()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user')
      }
    }
  }

  const handleReactivateAdmin = async (id: string) => {
    try {
      await AdminUserService.reactivateAdminUser(id)
      await loadAdminUsers()
    } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to reactivate user')
    }
  }

  const handleEditAdmin = (admin: AdminUser) => {
    setEditingId(admin.id)
    setFormData({
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: { ...admin.permissions }
    })
  }

  const resetForm = () => {
    const defaultRole = 'viewer'
    const defaultPermissions = AdminUserService.getDefaultPermissions(defaultRole)
    setFormData({
      email: '',
      name: '',
      role: defaultRole,
      permissions: defaultPermissions
    })
  }

  const handleRoleChange = (role: 'admin' | 'editor' | 'viewer' | 'superadmin') => {
    const defaultPermissions = AdminUserService.getDefaultPermissions(role)
    setFormData(prev => ({
      ...prev,
      role,
      permissions: defaultPermissions
    }))
  }

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <Shield className="w-4 h-4" />
      case 'admin': return <User className="w-4 h-4" />
      case 'editor': return <Pencil className="w-4 h-4" />
      case 'viewer': return <Eye className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-100 text-red-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'editor': return 'bg-green-100 text-green-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!canManageAdmins) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage users and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              You don't have permission to manage users. Only the superadmin can add, edit, or remove users.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray mb-2">User Management</h1>
          <p className="text-gray-600">Manage users and their permissions</p>
        </div>
        {!showAddForm && !editingId && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit User' : 'Add New User'}</CardTitle>
            <CardDescription>
              {editingId ? 'Update user details and permissions' : 'Create a new user with specific permissions'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!!editingId} // Can't change email when editing
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="admin">Admin - Full access (except admin management)</SelectItem>
                    <SelectItem value="editor">Editor - Can edit but not delete</SelectItem>
                    <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {AdminUserService.getAvailablePermissions().map((permission) => (
                  <div key={permission.key} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="font-medium text-sm">{permission.label}</div>
                      <div className="text-xs text-gray-600 truncate">{permission.description}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <Switch
                        checked={formData.permissions[permission.key] || false}
                        onCheckedChange={() => handlePermissionToggle(permission.key)}
                        disabled={permission.key === 'admins_manage'} // Only owner can manage admins
                        style={{
                          '--tw-bg-opacity': '1',
                          backgroundColor: formData.permissions[permission.key] ? 'var(--primary-color)' : '#d1d5db'
                        } as React.CSSProperties}
                        className="[&>span]:!bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={editingId ? handleUpdateAdmin : handleAddAdmin}
                className="bg-orange hover:bg-orange-900 text-white font-medium px-4 py-2 rounded-md border border-orange shadow-sm"
              >
                {editingId ? 'Update User' : 'Add User'}
              </Button>
              <Button variant="outline" onClick={() => {
                resetForm()
                setShowAddForm(false)
                setEditingId(null)
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Current users and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminUsers.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(admin.role)}
                    <div>
                      <div className="font-medium">{admin.name}</div>
                      <div className="text-sm text-gray-600">{admin.email}</div>
                    </div>
                  </div>
                  <Badge className={getRoleColor(admin.role)}>
                    {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
                  </Badge>
                  {!admin.is_active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {!admin.is_active ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReactivateAdmin(admin.id)}
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAdmin(admin)}
                        disabled={admin.role === 'superadmin'}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                                             {admin.role !== 'superadmin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAdmin(admin.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {adminUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 