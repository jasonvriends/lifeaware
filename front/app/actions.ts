"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const displayName = formData.get("displayName")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password || !displayName) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email, password, and display name are required",
    );
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const deleteUserAction = async (userId: string) => {
  const supabase = await createClient();
  
  try {
    // Get the current user to verify authorization
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return redirect("/profile?error=You+must+be+logged+in");
    }
    
    // SECURITY CHECK: Ensure users can only delete their own accounts
    if (user.id !== userId) {
      return redirect("/profile?error=Unauthorized.+You+can+only+delete+your+own+account");
    }
    
    // First try using our Edge Function for deletion (most reliable method)
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (response.ok) {
      // Edge function successfully deleted the user
      // Sign out the user
      await supabase.auth.signOut();
      return redirect("/sign-in");
    }

    // If edge function fails, fallback to our other methods
    console.error("Edge function failed to delete user, falling back to alternative methods");
    
    // Get profile data to check for avatar
    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    // Delete avatar from storage if it exists
    if (profileData?.avatar_url) {
      await supabase
        .storage
        .from("avatars")
        .remove([profileData.avatar_url]);
    }
    
    // Delete profile record
    await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    // Try using admin API
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        console.error("Admin delete failed, trying alternative method:", error);
        throw error;
      }
    } catch (error) {
      console.error("Admin delete failed, trying service role function:", error);
      
      // Try using RPC function
      const { error: rpcError } = await supabase.rpc('delete_user_auth', { user_id: userId });
      
      if (rpcError) {
        console.error("RPC delete failed:", rpcError);
        throw rpcError;
      }
    }
    
    // Sign out the user
    await supabase.auth.signOut();
    return redirect("/sign-in");
  } catch (error: any) {
    console.error("Error deleting user:", error.message);
    return redirect(`/profile?error=${encodeURIComponent("Failed to delete account: " + error.message)}`);
  }
};

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, message: "You must be logged in" };
  }
  
  try {
    // Get form data
    const displayName = formData.get("displayName")?.toString();
    const email = formData.get("email")?.toString();
    const bio = formData.get("bio")?.toString();
    const website = formData.get("website")?.toString();
    const timezone = formData.get("timezone")?.toString();
    const dateOfBirth = formData.get("dateOfBirth")?.toString();
    
    // Update auth user metadata (display name)
    if (displayName) {
      const { error: nameError } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      
      if (nameError) throw nameError;
    }
    
    // Update profile data in the profiles table
    const profileData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    // Handle bio - allow empty strings to clear the field
    if (bio !== undefined) {
      profileData.bio = bio || null;
    }
    
    // Handle timezone
    if (timezone !== undefined) {
      profileData.timezone = timezone || null;
    }
    
    // Handle date of birth
    if (dateOfBirth !== undefined) {
      profileData.date_of_birth = dateOfBirth || null;
    }
    
    // Handle website(s) data
    if (website !== undefined) {
      profileData.website = !website || website === "" || website === "[]" ? null : website;
    }
    
    // Update the profiles table if we have any profile data to update
    if (Object.keys(profileData).length > 1) { // > 1 because we always have updated_at
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...profileData
        });
        
      if (profileError) throw profileError;
    }
    
    // Update email if provided and different from current
    if (email && email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email
      });
      
      if (emailError) throw emailError;
      
      revalidatePath('/profile');
      return { 
        success: true, 
        message: "Email update link has been sent to your new email address. Please check your email to confirm the change."
      };
    }
    
    revalidatePath('/profile');
    return { success: true, message: "Profile updated successfully" };
  } catch (error: any) {
    // Only log the error type, not the full error details
    console.error("Profile update error:", error.message);
    return { success: false, message: error.message };
  }
}

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Return an error instead of redirecting
    return { success: false, message: "You must be logged in" };
  }
  
  const avatarFile = formData.get("avatar") as File;
  
  if (!avatarFile) {
    return { success: false, message: "No file provided" };
  }
  
  try {
    // Generate a unique filename
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    
    // Check if user has an existing avatar to delete
    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();
      
    if (profileData?.avatar_url) {
      // Delete the old avatar
      await supabase.storage
        .from("avatars")
        .remove([profileData.avatar_url]);
    }
    
    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: urlData } = await supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);
      
    const avatarUrl = urlData.publicUrl;
    
    // Update profile record
    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        avatar_url: fileName,
        updated_at: new Date().toISOString()
      });
      
    if (updateError) throw updateError;
    
    // Revalidate the profile page to show updated data
    revalidatePath('/profile');
    
    return { 
      success: true, 
      message: "Avatar updated successfully",
      avatarUrl: avatarUrl,
      avatarPath: fileName
    };
  } catch (error: any) {
    console.error("Error uploading avatar:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteAvatarAction(userId: string) {
  if (!userId) {
    return { success: false, message: "User ID is required" };
  }
  
  const supabase = await createClient();
  
  try {
    // Get profile data to check for avatar
    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();
      
    if (!profileData?.avatar_url) {
      return { success: false, message: "No avatar found" };
    }
    
    // Delete avatar from storage
    const { error: storageError } = await supabase.storage
      .from("avatars")
      .remove([profileData.avatar_url]);
      
    if (storageError) throw storageError;
    
    // Update profile record
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);
      
    if (updateError) throw updateError;
    
    // Revalidate the profile page to show updated data
    revalidatePath('/profile');
    
    return { success: true, message: "Avatar deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting avatar:", error);
    return { success: false, message: error.message };
  }
}
