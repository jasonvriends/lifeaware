import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return NextResponse.redirect(new URL("/profile?error=Missing+user+ID", request.url));
  }
  
  const supabase = await createClient();
  
  try {
    // Verify that the requesting user is the same as the ID provided
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(new URL("/profile?error=You+must+be+logged+in", request.url));
    }
    
    // SECURITY CHECK: Ensure users can only delete their own accounts
    if (user.id !== id) {
      return NextResponse.redirect(new URL("/profile?error=Unauthorized.+You+can+only+delete+your+own+account", request.url));
    }
    
    // First try using our Edge Function for deletion (most reliable method)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ userId: id }),
      });

      if (response.ok) {
        // Edge function successfully deleted the user
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }

      // If edge function fails, log error and continue with fallback methods
      console.error("Edge function failed, falling back to alternative methods");
    } catch (edgeError) {
      console.error("Error calling edge function:", edgeError);
      // Continue with fallback methods
    }
    
    // Fallback methods if edge function fails
    
    // Get profile data to check for avatar
    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", id)
      .single();
      
    // Delete avatar from storage if it exists
    if (profileData?.avatar_url) {
      await supabase
        .storage
        .from("avatars")
        .remove([profileData.avatar_url]);
    }
    
    // Delete all rows from any other tables that have user data
    // It's important to do this before deleting the auth user to maintain referential integrity
    
    // Delete profile record
    await supabase
      .from("profiles")
      .delete()
      .eq("id", id);
      
    // Delete user account using admin API
    try {
      await supabase.auth.admin.deleteUser(id);
    } catch (adminError) {
      console.error("Admin delete failed, trying alternative method:", adminError);
      
      // Alternative method: Using a Supabase RPC function or Edge Function
      try {
        // This requires a custom function with service role permissions set up in Supabase
        const { error: rpcError } = await supabase.rpc('delete_user_auth', { user_id: id });
        if (rpcError) throw rpcError;
      } catch (rpcError) {
        console.error("RPC function failed:", rpcError);
        
        // Final fallback, try to at least delete user's data even if auth record remains
        console.warn("Could not delete user from auth table. This may require manual cleanup.");
        // We continue to sign out the user rather than showing an error
      }
    }
    
    // Sign out the user
    await supabase.auth.signOut();
    
    // Redirect to sign-in page
    return NextResponse.redirect(new URL("/sign-in", request.url));
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent("Failed to delete account: " + error.message)}`, request.url)
    );
  }
} 