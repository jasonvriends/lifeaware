"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Plus, Link as LinkIcon, X, User as UserIcon, Mail, AtSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { deleteUserAction, updateProfileAction, uploadAvatarAction, deleteAvatarAction } from "@/app/actions";
import { callEdgeFunction } from "@/utils/supabase/edge-function";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { USER_PROFILE_UPDATED_EVENT } from "../layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [profile, setProfile] = useState<{
    id: string;
    avatar_url: string | null;
    bio: string | null;
    website: string | null;
    timezone: string | null;
    date_of_birth: string | null;
    updated_at: string | null;
  } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [submittingAvatar, setSubmittingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [websites, setWebsites] = useState<string[]>([]);
  const [newWebsite, setNewWebsite] = useState("");
  const [hasUnsavedWebsites, setHasUnsavedWebsites] = useState(false);
  const [currentTimezone, setCurrentTimezone] = useState<string>("");
  const [currentDateOfBirth, setCurrentDateOfBirth] = useState<string>("");
  
  // Check for error or success messages from URL params
  const errorMessage = searchParams.get("error");
  const successMessage = searchParams.get("success");

  useEffect(() => {
    if (errorMessage) {
      setMessage({ type: 'error', text: errorMessage });
    } else if (successMessage) {
      setMessage({ type: 'success', text: successMessage });
    } else {
      setMessage(null);
    }
  }, [errorMessage, successMessage]);

  // Function to notify layout about profile updates
  const notifyProfileUpdated = () => {
    window.dispatchEvent(new Event(USER_PROFILE_UPDATED_EVENT));
  };

  // Get user data
  const fetchUserData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        
        // Get profile data
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (profileData) {
          setProfile(profileData);
          console.log("Loaded profile data:", profileData);
          
          // Debug the website data
          console.log("Raw website data from DB:", profileData.website);
          
          // Handle websites data
          if (profileData.website) {
            try {
              // Attempt to parse website data as JSON
              const sitesData = JSON.parse(profileData.website);
              console.log("Parsed website data:", sitesData);
              
              // If it's an array, use it directly
              if (Array.isArray(sitesData)) {
                setWebsites(sitesData);
                console.log("Set websites array:", sitesData);
              } else if (typeof sitesData === 'string') {
                // If it's a string, wrap it in an array
                setWebsites([sitesData]);
                console.log("Set single website as array:", [sitesData]);
              } else {
                // Reset to empty array as fallback
                setWebsites([]);
                console.log("Reset to empty websites array");
              }
            } catch (e) {
              // If parsing fails, treat as a single website string
              console.log("JSON parse failed, using as string:", profileData.website);
              if (typeof profileData.website === 'string') {
                setWebsites([profileData.website]);
              } else {
                setWebsites([]);
              }
            }
          } else {
            // No websites
            setWebsites([]);
          }
          
          // Handle avatar
          if (profileData.avatar_url) {
            const { data: urlData } = await supabase
              .storage
              .from("avatars")
              .getPublicUrl(profileData.avatar_url);
            
            setAvatarUrl(urlData.publicUrl);
          } else {
            setAvatarUrl("");
          }
        } else {
          // Create a profile if one doesn't exist
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              updated_at: new Date().toISOString()
            })
            .select();
            
          if (newProfile && newProfile.length > 0) {
            setProfile(newProfile[0]);
            setWebsites([]);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUserData();
  }, []);

  // Effect to sync state with profile data
  useEffect(() => {
    if (profile) {
      setCurrentTimezone(profile.timezone || "");
      setCurrentDateOfBirth(profile.date_of_birth || "");
    }
  }, [profile]);

  // Handle profile update
  async function handleProfileUpdate(formData: FormData) {
    setSubmitting(true);
    setMessage(null);

    try {
      // Create a copy of the websites array for modification
      let websitesToSave = [...websites];
      
      if (newWebsite && newWebsite.trim() !== '') {
        websitesToSave.push(newWebsite);
        setWebsites(websitesToSave);
        setNewWebsite('');
      }
      
      const websitesJson = JSON.stringify(websitesToSave);
      formData.set("website", websitesJson);

      // Get form values
      const displayName = formData.get("displayName")?.toString();
      const bio = formData.get("bio")?.toString();
      
      // Use the current state values
      formData.set("timezone", currentTimezone);
      formData.set("dateOfBirth", currentDateOfBirth);
      
      // Update the profile object immediately for UI
      if (profile) {
        const updatedProfile = {
          ...profile,
          bio: bio || null,
          website: websitesJson,
          timezone: currentTimezone || null,
          date_of_birth: currentDateOfBirth || null,
          updated_at: new Date().toISOString()
        };
        setProfile(updatedProfile);
      }

      // Submit the form
      const result = await updateProfileAction(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setHasUnsavedWebsites(false);
        notifyProfileUpdated();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  }

  // Handle avatar upload on client-side
  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    setSubmittingAvatar(true);
    setMessage(null);
    
    try {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("avatar", file);
      
      // Use the server action to upload the avatar
      const result = await uploadAvatarAction(formData);
      
      if (result.success) {
        // Update local state immediately without page refresh
        if ('avatarUrl' in result && result.avatarUrl) {
          setAvatarUrl(result.avatarUrl);
          if (profile && 'avatarPath' in result && result.avatarPath) {
            setProfile({
              ...profile,
              avatar_url: result.avatarPath
            });
          }
        }
        
        setMessage({ type: 'success', text: result.message });
        
        // Notify layout about the profile update
        notifyProfileUpdated();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setSubmittingAvatar(false);
    }
  }

  // Delete avatar
  async function handleDeleteAvatar() {
    if (!user) return;
    
    setDeletingAvatar(true);
    setMessage(null);
    
    try {
      const result = await deleteAvatarAction(user.id);
      
      if (result.success) {
        setAvatarUrl("");
        setProfile(prev => prev ? {...prev, avatar_url: null} : null);
        setMessage({ type: 'success', text: result.message });
        
        // Notify layout about the profile update
        notifyProfileUpdated();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete avatar' });
    } finally {
      setDeletingAvatar(false);
    }
  }

  // Add a new website
  function addWebsite() {
    if (newWebsite && !websites.includes(newWebsite)) {
      // Only update the local state, don't submit the form
      setWebsites([...websites, newWebsite]);
      setNewWebsite("");
      // Mark as having unsaved changes
      setHasUnsavedWebsites(true);
    }
  }

  // Update the removeWebsite function to track changes
  function removeWebsite(site: string) {
    // Only update the local state, don't submit the form
    setWebsites(websites.filter(s => s !== site));
    // Mark as having unsaved changes
    setHasUnsavedWebsites(true);
  }

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } else if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>

      {/* Horizontal Line */}
      <div 
        data-orientation="horizontal" 
        role="none" 
        data-slot="separator-root" 
        className="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px mb-8"
      ></div>

      {message && message.type === 'error' && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
          {message.text}
        </div>
      )}
      
      {message && message.type === 'success' && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-md mb-6 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400">
          {message.text}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        <Tabs defaultValue="profile" className="w-full flex flex-col md:flex-row gap-8">
          <TabsList className="flex flex-row md:flex-col h-auto p-1 md:p-0 bg-muted/50 md:bg-transparent rounded-lg md:rounded-none md:border-none md:w-1/5 md:max-w-[240px] md:space-y-2 self-start">
            <TabsTrigger 
              value="profile" 
              className="flex justify-start items-center gap-2 px-3 py-2 data-[state=active]:bg-background md:data-[state=active]:bg-muted w-full"
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="flex justify-start items-center gap-2 px-3 py-2 data-[state=active]:bg-background md:data-[state=active]:bg-muted w-full"
            >
              <AtSign className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>
          
          <div className="md:flex-1">
            <TabsContent value="profile" className="space-y-6 mt-0">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
                <p className="text-muted-foreground">
                  This is how others will see you on the site.
                </p>
              </div>
              
              <Separator className="my-6" />
              
              <form action={handleProfileUpdate} className="space-y-8">
                <div className="flex items-start gap-8">
                  <div className="flex-shrink-0 relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {avatarUrl && (
                      <button 
                        type="button"
                        onClick={handleDeleteAvatar}
                        disabled={deletingAvatar}
                        className="absolute -top-2 -right-2 rounded-full bg-destructive text-white h-6 w-6 flex items-center justify-center hover:bg-destructive/90 transition-colors"
                        title="Delete avatar"
                      >
                        {deletingAvatar ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </button>
                    )}
                    
                    <div className="mt-2">
                      <Label 
                        htmlFor="avatar-upload" 
                        className="cursor-pointer text-sm text-primary hover:underline block text-center"
                      >
                        {submittingAvatar ? 'Uploading...' : 'Change avatar'}
                      </Label>
                      <Input 
                        id="avatar-upload" 
                        type="file" 
                        onChange={handleAvatarChange}
                        disabled={submittingAvatar}
                        className="hidden" 
                        accept="image/*"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-base font-medium">Name</Label>
                      <Input 
                        id="displayName"
                        name="displayName"
                        defaultValue={user?.user_metadata?.display_name || ""}
                        placeholder="Your display name"
                        className="max-w-md"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This is your public display name. It can be your real name or a pseudonym.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-base font-medium">Bio</Label>
                      <Textarea 
                        id="bio"
                        name="bio"
                        value={profile?.bio || ""}
                        onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                        placeholder="Write a short bio about yourself"
                        className="max-w-md resize-none"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        You can @mention other users and organizations to link to them.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">URLs</Label>
                        {hasUnsavedWebsites && (
                          <span className="text-xs text-amber-500 font-medium">
                            Unsaved changes - click "Update profile" to save
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Add links to your website, blog, or social media profiles.
                      </p>
                      
                      {websites.map((site, index) => (
                        <div key={index} className="flex items-center mb-2 max-w-md">
                          <Input 
                            value={site}
                            readOnly
                            className="flex-grow"
                          />
                          <Button 
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeWebsite(site)}
                            className="ml-2 h-10 w-10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex items-center max-w-md">
                        <Input 
                          placeholder="https://example.com"
                          value={newWebsite}
                          onChange={(e) => {
                            setNewWebsite(e.target.value);
                            if (e.target.value.trim()) {
                              setHasUnsavedWebsites(true);
                            } else if (websites.length === 0) {
                              setHasUnsavedWebsites(false);
                            }
                          }}
                          className={cn(
                            "flex-grow",
                            newWebsite.trim() && "border-amber-500"
                          )}
                        />
                        <Button 
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={addWebsite}
                          className="ml-2 h-10 w-10"
                          disabled={!newWebsite.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button type="submit" className="mr-2" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : 'Update profile'}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="account" className="space-y-6 mt-0">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Account</h2>
                <p className="text-muted-foreground">
                  Manage your account information and preferences.
                </p>
              </div>
              
              <Separator className="my-6" />
              
              <div className="max-w-md space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Account Information</h3>
                  
                  <form action={handleProfileUpdate} className="space-y-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="account-email" className="text-base font-medium">Email</Label>
                        <Input 
                          id="account-email"
                          name="email"
                          type="email"
                          defaultValue={user?.email || ""}
                          placeholder="Your email address"
                          className="max-w-md"
                        />
                        <p className="text-xs text-muted-foreground">
                          If you change your email, you will need to verify the new address.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="account-timezone" className="text-base font-medium">Time Zone</Label>
                        <Select
                          value={currentTimezone || undefined}
                          onValueChange={setCurrentTimezone}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                            <SelectItem value="Pacific/Honolulu">Hawaii Time (HT)</SelectItem>
                            <SelectItem value="America/Toronto">Eastern Time - Toronto</SelectItem>
                            <SelectItem value="America/Vancouver">Pacific Time - Vancouver</SelectItem>
                            <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                            <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                            <SelectItem value="Australia/Sydney">Australian Eastern Time (AET)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your timezone helps us display dates and times correctly for you.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="account-dob" className="text-base font-medium">Date of Birth</Label>
                        <div className="relative max-w-md">
                          <Input
                            id="account-dob"
                            name="dateOfBirth"
                            type="text"
                            placeholder="YYYY-MM-DD"
                            value={currentDateOfBirth}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow digits and dashes
                              if (/^[\d-]*$/.test(value)) {
                                setCurrentDateOfBirth(value);
                              }
                            }}
                            onBlur={(e) => {
                              // Validate the date format on blur
                              const value = e.target.value;
                              if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                                setMessage({ type: 'error', text: 'Please use the format YYYY-MM-DD (e.g., 1990-01-31)' });
                              } else if (value) {
                                const date = new Date(value);
                                if (isNaN(date.getTime())) {
                                  setMessage({ type: 'error', text: 'Please enter a valid date' });
                                }
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter your date of birth in YYYY-MM-DD format (e.g., 1990-01-31). This will not be displayed publicly.
                        </p>
                      </div>
                    </div>
                    
                    <Button type="submit" size="sm" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : 'Update Account'}
                    </Button>
                  </form>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-destructive">Danger Zone</h3>
                  <div className="border border-destructive/20 rounded-md p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all of your data. This action cannot be undone.
                        </p>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account
                              and remove all your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button 
                              variant="destructive"
                              onClick={async () => {
                                if (!user) return;
                                
                                try {
                                  // First try using the Edge Function
                                  const { data, error } = await callEdgeFunction('delete-user', { userId: user.id });
                                  
                                  if (error) {
                                    console.error("Edge function failed:", error);
                                    // Show error message to user
                                    setMessage({ type: 'error', text: error.message });
                                    return;
                                  }
                                  
                                  if (data) {
                                    // Sign out and redirect on success
                                    const supabase = createClient();
                                    await supabase.auth.signOut();
                                    router.push('/sign-in');
                                    return;
                                  }
                                } catch (err) {
                                  console.error("Error in delete account:", err);
                                  setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
                                }
                              }}
                            >
                              Delete Account
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 