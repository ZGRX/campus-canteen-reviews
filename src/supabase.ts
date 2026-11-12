import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const supabase = url && publishableKey ? createClient(url, publishableKey) : null

export interface RatingSummary {
  stall_id: string
  average: number
  count: number
}

export interface PublicReview {
  score: number
  body: string
  updated_at: string
}

export async function getSummaries(): Promise<RatingSummary[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('canteen_rating_summaries')
  if (error) throw error
  return data
}

export async function getStallReviews(stallId: string, signedIn: boolean) {
  if (!supabase) return { reviews: [], own: null }
  const [publicResult, ownResult] = await Promise.all([
    supabase.rpc('canteen_public_reviews', { target_stall: stallId }),
    signedIn
      ? supabase.rpc('canteen_my_review', { target_stall: stallId })
      : Promise.resolve({ data: [], error: null }),
  ])
  if (publicResult.error) throw publicResult.error
  if (ownResult.error) throw ownResult.error
  return {
    reviews: publicResult.data as PublicReview[],
    own: (ownResult.data[0] ?? null) as PublicReview | null,
  }
}
