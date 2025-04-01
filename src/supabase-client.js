import {createClient} from '@supabase/supabase-js'

const supabaseURL = "https://cdvccrjdjgdbjcnlvntv.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdmNjcmpkamdkYmpjbmx2bnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NzU3NjYsImV4cCI6MjA1ODU1MTc2Nn0.y_rhQDd9xoARfFDB3x_wMvh2dDIFKzPKlRRySdgEiSs"

const supabase = createClient(supabaseURL, supabaseKey)


export default  supabase