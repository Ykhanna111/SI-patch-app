import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import type { User, UserStats } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Settings, Upload, Palette, Moon, Sun, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import { useTheme } from '@/hooks/useTheme';
import { Link } from 'wouter';

const profileUpdateSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
});

type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const typedUser = user as User;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Fetch user statistics
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/auth/stats'],
    enabled: !!isAuthenticated,
  });

  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      username: typedUser?.username || '',
      email: typedUser?.email || '',
      firstName: typedUser?.firstName || '',
      lastName: typedUser?.lastName || '',
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateInput) => {
      const response = await apiRequest('PUT', '/api/auth/profile', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setAvatarFile(null);
      setAvatarPreview(null);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileUpdateInput) => {
    updateProfileMutation.mutate(data);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Avatar must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = () => {
    if (avatarFile) {
      uploadAvatarMutation.mutate(avatarFile);
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null, username?: string | null) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please log in to access your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/game">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Game
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Upload a profile picture to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={avatarPreview || typedUser?.avatarUrl || undefined} 
                    alt={typedUser?.username || undefined} 
                  />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {getInitials(typedUser?.firstName, typedUser?.lastName, typedUser?.username)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2 w-full">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full p-2 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </div>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    data-testid="input-avatar"
                  />
                  
                  {avatarFile && (
                    <Button 
                      onClick={handleAvatarUpload}
                      disabled={uploadAvatarMutation.isPending}
                      className="w-full"
                      data-testid="button-upload-avatar"
                    >
                      {uploadAvatarMutation.isPending ? 'Uploading...' : 'Upload Avatar'}
                    </Button>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  Recommended: Square image, max 5MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update your basic account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              data-testid="input-profile-firstname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              data-testid="input-profile-lastname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="johndoe123"
                            data-testid="input-profile-username"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Username can be changed once per month
                        </p>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            data-testid="input-profile-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Email is private and not shown to other users
                        </p>
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-update-profile"
                  >
                    {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Game Statistics Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Game Statistics
            </CardTitle>
            <CardDescription>
              Track your Sudoku progress and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Loading statistics...</p>
              </div>
            ) : userStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {userStats.totalPuzzles || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Puzzles</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {userStats.completedPuzzles || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {userStats.totalPuzzles > 0 
                      ? Math.round(((userStats.completedPuzzles || 0) / userStats.totalPuzzles) * 100)
                      : 0
                    }%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {userStats.currentStreak || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                
                <div className="md:col-span-2 lg:col-span-4 mt-4">
                  <h4 className="font-semibold mb-3 text-foreground">Best Times by Difficulty</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['easy', 'medium', 'hard', 'expert'].map(difficulty => {
                      const timeKey = `best${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}Time` as keyof typeof userStats;
                      const time = userStats[timeKey] as number | null;
                      return (
                        <div key={difficulty} className="text-center p-3 border rounded-lg">
                          <div className="font-semibold text-sm text-muted-foreground uppercase">
                            {difficulty}
                          </div>
                          <div className="text-lg font-bold text-foreground">
                            {time ? `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}` : 'N/A'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No statistics available yet. Start playing to track your progress!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme & Customization Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme & Customization
            </CardTitle>
            <CardDescription>
              Customize your app experience with theme preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dark/Light Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  data-testid="toggle-dark-mode"
                />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}