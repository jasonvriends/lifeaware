"use client";

import { useEffect, useState } from "react";
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

// Import textarea component
const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

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
    updated_at: string | null;
  } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [submittingAvatar, setSubmittingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [websites, setWebsites] = useState<string[]>([]);
  const [newWebsite, setNewWebsite] = useState("");
  
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
          
          if (profileData.website) {
            // If website is stored as JSON string, parse it
            try {
              const sites = JSON.parse(profileData.website);
              if (Array.isArray(sites)) {
                setWebsites(sites);
              } else if (typeof profileData.website === 'string') {
                setWebsites([profileData.website]);
              }
            } catch (e) {
              // If not a valid JSON, treat as a single website
              setWebsites([profileData.website]);
            }
          }
          
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

  // Handle profile update
  async function handleProfileUpdate(formData: FormData) {
    setSubmitting(true);
    setMessage(null);

    try {
      // Add the website data to the form
      formData.set("website", JSON.stringify(websites));

      // Get the new display name for immediate UI update
      const displayName = formData.get("displayName")?.toString();
      if (displayName && user) {
        // Update the user object immediately for the UI
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            display_name: displayName
          }
        });
      }

      const result = await updateProfileAction(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        
        // Notify layout about the profile update
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
      setWebsites([...websites, newWebsite]);
      setNewWebsite("");
    }
  }

  // Remove a website
  function removeWebsite(site: string) {
    setWebsites(websites.filter(s => s !== site));
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
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>

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
              <Label htmlFor="displayName" className="text-base font-medium">Username</Label>
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
              <Label htmlFor="email" className="text-base font-medium">Email</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email || ""}
                placeholder="Your email address"
                className="max-w-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                If you change your email, you will need to verify the new address.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-base font-medium">Bio</Label>
              <Textarea 
                id="bio"
                name="bio"
                defaultValue={profile?.bio || ""}
                placeholder="Write a short bio about yourself"
                className="max-w-md"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can @mention other users and organizations to link to them.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-base font-medium">URLs</Label>
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
                    size="sm"
                    onClick={() => removeWebsite(site)}
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex items-center max-w-md">
                <Input 
                  placeholder="https://example.com"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  className="flex-grow"
                />
                <Button 
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addWebsite}
                  className="ml-2"
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
      
      <Separator className="my-8" />
      
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-destructive">Danger Zone</h2>
        <div className="border border-destructive/20 rounded-md p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-medium">Delete Account</h3>
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
                    onClick={() => {
                      if (user) {
                        router.push(`/api/delete-account?id=${user.id}`);
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
  );
} 