"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Settings,
  Users,
  Database,
  Key,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { DataState, DataSkeleton, AdminTableEmptyState, SearchEmptyState } from "@/components/ui/states"

// Types
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'viewer'
  status: 'active' | 'inactive'
  lastLogin: string
  createdAt: string
}

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  status: 'active' | 'revoked'
  usageCount: number
  createdAt: string
  lastUsed?: string
}

interface SystemStat {
  id: string
  metric: string
  value: string
  status: 'good' | 'warning' | 'error'
  lastUpdated: string
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    lastLogin: '2024-01-14T15:20:00Z',
    createdAt: '2024-01-10T08:00:00Z'
  }
]

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API',
    key: 'ak_live_****1234',
    permissions: ['read', 'write'],
    status: 'active',
    usageCount: 1547,
    createdAt: '2024-01-01T00:00:00Z',
    lastUsed: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Test API',
    key: 'ak_test_****5678',
    permissions: ['read'],
    status: 'active',
    usageCount: 89,
    createdAt: '2024-01-05T12:00:00Z',
    lastUsed: '2024-01-14T14:15:00Z'
  }
]

const mockSystemStats: SystemStat[] = [
  {
    id: '1',
    metric: 'Database Connection',
    value: 'Healthy',
    status: 'good',
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    metric: 'Memory Usage',
    value: '65%',
    status: 'warning',
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: '3',
    metric: 'Disk Space',
    value: '45%',
    status: 'good',
    lastUpdated: '2024-01-15T10:30:00Z'
  }
]

// Fetch functions with timeout
async function fetchUsers(): Promise<User[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate potential error: reject(new Error('Failed to fetch users'))
      // Simulate empty: resolve([])
      resolve(mockUsers)
    }, 800)
  })
}

async function fetchApiKeys(): Promise<ApiKey[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockApiKeys), 600)
  })
}

async function fetchSystemStats(): Promise<SystemStat[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockSystemStats), 400)
  })
}

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  
  // Queries for each tab
  const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
    staleTime: 30 * 1000,
  })

  const { data: apiKeys = [], isLoading: keysLoading, error: keysError, refetch: refetchKeys } = useQuery({
    queryKey: ['admin-keys'],
    queryFn: fetchApiKeys,
    staleTime: 30 * 1000,
  })

  const { data: systemStats = [], isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchSystemStats,
    staleTime: 10 * 1000,
  })

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return "bg-red-100 text-red-800"
      case 'user':
        return "bg-blue-100 text-blue-800"
      case 'viewer':
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'good':
        return "bg-green-100 text-green-800"
      case 'inactive':
      case 'revoked':
        return "bg-red-100 text-red-800"
      case 'warning':
        return "bg-yellow-100 text-yellow-800"
      case 'error':
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredKeys = apiKeys.filter(key =>
    key.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs, clés API et surveillez le système
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Clés API
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Système
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Utilisateurs</CardTitle>
                  <CardDescription>Gérez les comptes utilisateurs et leurs permissions</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter utilisateur
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Users Table with Tri-State Pattern */}
              <DataState
                data={filteredUsers}
                isLoading={usersLoading}
                error={usersError}
                onRetry={refetchUsers}
                loadingComponent={<DataSkeleton type="table" count={4} />}
                emptyComponent={
                  searchTerm ? (
                    <SearchEmptyState 
                      searchTerm={searchTerm}
                      onClear={() => setSearchTerm("")}
                    />
                  ) : (
                    <AdminTableEmptyState 
                      entityName="utilisateur"
                      onCreateEntity={() => console.log('Create user')}
                    />
                  )
                }
              >
                {(filteredUsers) => (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Dernière connexion</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge className={getRoleColor(user.role)}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </DataState>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Clés API</CardTitle>
                  <CardDescription>Gérez les clés d'accès API et leurs permissions</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer clé API
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher clé API..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <DataState
                data={filteredKeys}
                isLoading={keysLoading}
                error={keysError}
                onRetry={refetchKeys}
                loadingComponent={<DataSkeleton type="table" count={3} />}
                emptyComponent={
                  searchTerm ? (
                    <SearchEmptyState 
                      searchTerm={searchTerm}
                      onClear={() => setSearchTerm("")}
                    />
                  ) : (
                    <AdminTableEmptyState 
                      entityName="clé API"
                      onCreateEntity={() => console.log('Create API key')}
                    />
                  )
                }
              >
                {(filteredKeys) => (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Clé</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Dernière utilisation</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredKeys.map((key) => (
                          <TableRow key={key.id}>
                            <TableCell className="font-medium">{key.name}</TableCell>
                            <TableCell>
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {key.key}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {key.permissions.map((perm, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {perm}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(key.status)}>
                                {key.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{key.usageCount.toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString('fr-FR') : 'Jamais'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </DataState>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Système</CardTitle>
              <CardDescription>Surveillez la santé et les performances du système</CardDescription>
            </CardHeader>
            <CardContent>
              <DataState
                data={systemStats}
                isLoading={statsLoading}
                error={statsError}
                onRetry={refetchStats}
                loadingComponent={<DataSkeleton type="table" count={3} />}
                emptyComponent={
                  <AdminTableEmptyState entityName="métrique système" />
                }
              >
                {(stats) => (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Métrique</TableHead>
                          <TableHead>Valeur</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Dernière mise à jour</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.map((stat) => (
                          <TableRow key={stat.id}>
                            <TableCell className="font-medium">{stat.metric}</TableCell>
                            <TableCell>{stat.value}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(stat.status)}>
                                {stat.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(stat.lastUpdated).toLocaleString('fr-FR')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </DataState>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
