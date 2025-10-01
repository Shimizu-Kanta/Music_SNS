// 1. Supabaseのライブラリから、クライアントを作成する関数をインポート
import { createClient } from '@supabase/supabase-js'

// 2. .env.localファイルから、安全に保管したURLとキーを読み込む
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 3. URLとキーを使って、Supabaseと通信するための「クライアント（電話機）」を作成する
export const supabase = createClient(supabaseUrl, supabaseAnonKey)