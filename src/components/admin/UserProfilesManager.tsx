import React, { useState, useEffect } from 'react';
import { useAppAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Phone, Mail, Calendar, Filter } from 'lucide-react';
import { adminService, UserProfile } from '@/lib/supabase/services/admin-service';
import { format } from 'date-fns';

const UserProfilesManager: React.FC = () => {
  const { user } = useAppAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with_phone' | 'without_phone'>('all');

  useEffect(() => {
    if (user?.id) {
      loadUserProfiles();
    }
  }, [user?.id]);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm, filterType]);

  const loadUserProfiles = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await adminService.getAllUserProfiles(user.id);
      setProfiles(data);
    } catch (error) {
      console.error('Error loading user profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(profile => 
        profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.phone_number?.includes(searchTerm)
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'with_phone':
        filtered = filtered.filter(profile => profile.phone_number);
        break;
      case 'without_phone':
        filtered = filtered.filter(profile => !profile.phone_number);
        break;
      default:
        break;
    }

    setFilteredProfiles(filtered);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getFullName = (profile: UserProfile) => {
    const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    return name || 'Not provided';
  };

  const getStats = () => {
    const total = profiles.length;
    const withPhone = profiles.filter(p => p.phone_number).length;
    const withoutPhone = total - withPhone;
    
    return { total, withPhone, withoutPhone };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Loading User Profiles...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading user profiles...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.withPhone}</p>
                <p className="text-sm text-muted-foreground">With Phone</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.withoutPhone}</p>
                <p className="text-sm text-muted-foreground">Without Phone</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Profiles ({filteredProfiles.length})
          </CardTitle>
          <CardDescription>
            Manage and view all user profiles and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All Users
              </Button>
              <Button
                variant={filterType === 'with_phone' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('with_phone')}
              >
                With Phone
              </Button>
              <Button
                variant={filterType === 'without_phone' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('without_phone')}
              >
                Without Phone
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No user profiles found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {getFullName(profile)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {profile.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {profile.phone_number ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {profile.phone_number}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDate(profile.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={profile.phone_number ? 'default' : 'secondary'}>
                          {profile.phone_number ? 'Complete' : 'Incomplete'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilesManager;
