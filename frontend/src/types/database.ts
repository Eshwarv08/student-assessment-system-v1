export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assessments: {
        Row: {
          id: string
          assessor_id: string
          token: string
          is_used: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          assessor_id: string
          token: string
          is_used?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          assessor_id?: string
          token?: string
          is_used?: boolean
          created_at?: string
          expires_at?: string | null
        }
      }
      submissions: {
        Row: {
          id: string
          assessment_id: string | null
          student_name: string
          student_id: string | null
          answers: Json
          grades: Json
          task_results: Json
          final_result: string | null
          signature_url: string | null
          submitted_at: string
          status: string | null
        }
        Insert: {
          id?: string
          assessment_id?: string | null
          student_name: string
          student_id?: string | null
          answers: Json
          grades?: Json
          task_results?: Json
          final_result?: string | null
          signature_url?: string | null
          submitted_at?: string
          status?: string | null
        }
        Update: {
          id?: string
          assessment_id?: string | null
          student_name?: string
          student_id?: string | null
          answers?: Json
          grades?: Json
          task_results?: Json
          final_result?: string | null
          signature_url?: string | null
          submitted_at?: string
          status?: string | null
        }
      }
    }
  }
}
