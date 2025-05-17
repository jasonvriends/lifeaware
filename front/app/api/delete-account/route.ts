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
    
    if (!user || user.id !== id) {
      return NextResponse.redirect(new URL("/profile?error=Unauthorized", request.url));
    }
    
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
    
    // Delete profile record
    await supabase
      .from("profiles")
      .delete()
      .eq("id", id);
      
    // Delete user account
    // This requires special permissions or Supabase functions depending on your setup
    // For this example, we'll use auth.admin.deleteUser if available
    try {
      await supabase.auth.admin.deleteUser(id);
    } catch (adminError) {
      console.error("Admin delete failed, trying alternative method:", adminError);
      
      // Alternative method: Using a Supabase RPC function if configured
      const { error: rpcError } = await supabase.rpc('delete_user');
      if (rpcError) throw rpcError;
    }
    
    // Sign out the user
    await supabase.auth.signOut();
    
    // Simpler approach for clearing auth cookies: just let the signOut handle it
    // and rely on the redirect to clear the session
    
    // Redirect to sign-in page
    return NextResponse.redirect(new URL("/sign-in", request.url));
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent("Failed to delete account: " + error.message)}`, request.url)
    );
  }
} 