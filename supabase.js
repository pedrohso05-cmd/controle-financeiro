import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://afrmtysucyomawdndxfc.supabase.co";

const SUPABASE_KEY = "sb_publishable_y6GQ4_zcQmDWLDbztgVkNA_oTX2zRAe";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);