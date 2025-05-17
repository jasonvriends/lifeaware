import { createClient } from './client';

/**
 * Calls a Supabase Edge Function with authentication
 * 
 * @param functionName Name of the Edge Function to call
 * @param payload Data to send to the Edge Function
 * @returns Response from the Edge Function
 */
export async function callEdgeFunction<T = any>(
  functionName: string, 
  payload: Record<string, any>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const supabase = createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Get the authenticated user's session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      throw new Error('Authentication required');
    }

    // Use the user's access token for authorization
    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Edge function call failed');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`Error calling ${functionName} edge function:`, error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
} 