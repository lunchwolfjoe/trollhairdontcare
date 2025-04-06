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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          display_name: string | null
          email: string
          phone: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          display_name?: string | null
          email: string
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          display_name?: string | null
          email?: string
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          user_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          role_id?: string
          created_at?: string
        }
      }
      festivals: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          location: string | null
          status: string
          map_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          location?: string | null
          status?: string
          map_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          location?: string | null
          status?: string
          map_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          festival_id: string
          name: string
          description: string | null
          location_type: string
          coordinates: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          festival_id: string
          name: string
          description?: string | null
          location_type: string
          coordinates?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          festival_id?: string
          name?: string
          description?: string | null
          location_type?: string
          coordinates?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      volunteers: {
        Row: {
          id: string
          profile_id: string
          festival_id: string
          application_status: string
          notes: string | null
          availability_start: string | null
          availability_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          festival_id: string
          application_status?: string
          notes?: string | null
          availability_start?: string | null
          availability_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          festival_id?: string
          application_status?: string
          notes?: string | null
          availability_start?: string | null
          availability_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          volunteer_id: string
          location_id: string | null
          task_description: string
          start_time: string
          end_time: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          volunteer_id: string
          location_id?: string | null
          task_description: string
          start_time: string
          end_time: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          volunteer_id?: string
          location_id?: string | null
          task_description?: string
          start_time?: string
          end_time?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      musical_acts: {
        Row: {
          id: string
          festival_id: string
          name: string
          description: string | null
          genre: string | null
          website_url: string | null
          social_media: Json | null
          performance_duration: string | null
          technical_requirements: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          festival_id: string
          name: string
          description?: string | null
          genre?: string | null
          website_url?: string | null
          social_media?: Json | null
          performance_duration?: string | null
          technical_requirements?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          festival_id?: string
          name?: string
          description?: string | null
          genre?: string | null
          website_url?: string | null
          social_media?: Json | null
          performance_duration?: string | null
          technical_requirements?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      performance_schedules: {
        Row: {
          id: string
          festival_id: string
          act_id: string
          location_id: string
          start_time: string
          end_time: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          festival_id: string
          act_id: string
          location_id: string
          start_time: string
          end_time: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          festival_id?: string
          act_id?: string
          location_id?: string
          start_time?: string
          end_time?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      crews: {
        Row: {
          id: string
          festival_id: string
          name: string
          description: string | null
          crew_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          festival_id: string
          name: string
          description?: string | null
          crew_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          festival_id?: string
          name?: string
          description?: string | null
          crew_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      crew_members: {
        Row: {
          id: string
          crew_id: string
          volunteer_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          crew_id: string
          volunteer_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          crew_id?: string
          volunteer_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      shifts: {
        Row: {
          id: string
          festival_id: string
          crew_id: string
          location_id: string
          start_time: string
          end_time: string
          required_volunteers: number
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          festival_id: string
          crew_id: string
          location_id: string
          start_time: string
          end_time: string
          required_volunteers?: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          festival_id?: string
          crew_id?: string
          location_id?: string
          start_time?: string
          end_time?: string
          required_volunteers?: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shift_assignments: {
        Row: {
          id: string
          shift_id: string
          volunteer_id: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shift_id: string
          volunteer_id: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shift_id?: string
          volunteer_id?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      weather_forecasts: {
        Row: {
          id: string
          festival_id: string
          forecast_time: string
          temperature: number | null
          conditions: string | null
          precipitation_chance: number | null
          wind_speed: number | null
          wind_direction: string | null
          uv_index: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          festival_id: string
          forecast_time: string
          temperature?: number | null
          conditions?: string | null
          precipitation_chance?: number | null
          wind_speed?: number | null
          wind_direction?: string | null
          uv_index?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          festival_id?: string
          forecast_time?: string
          temperature?: number | null
          conditions?: string | null
          precipitation_chance?: number | null
          wind_speed?: number | null
          wind_direction?: string | null
          uv_index?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      asset_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          festival_id: string
          category_id: string | null
          name: string
          description: string | null
          serial_number: string | null
          acquisition_date: string | null
          value: number | null
          status: string
          current_location_id: string | null
          assigned_volunteer_id: string | null
          qr_code: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          festival_id: string
          category_id?: string | null
          name: string
          description?: string | null
          serial_number?: string | null
          acquisition_date?: string | null
          value?: number | null
          status?: string
          current_location_id?: string | null
          assigned_volunteer_id?: string | null
          qr_code?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          festival_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          serial_number?: string | null
          acquisition_date?: string | null
          value?: number | null
          status?: string
          current_location_id?: string | null
          assigned_volunteer_id?: string | null
          qr_code?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      asset_maintenance: {
        Row: {
          id: string
          asset_id: string
          maintenance_type: string
          description: string | null
          performed_by: string | null
          maintenance_date: string
          next_maintenance_date: string | null
          cost: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          maintenance_type: string
          description?: string | null
          performed_by?: string | null
          maintenance_date?: string
          next_maintenance_date?: string | null
          cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          maintenance_type?: string
          description?: string | null
          performed_by?: string | null
          maintenance_date?: string
          next_maintenance_date?: string | null
          cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      asset_logs: {
        Row: {
          id: string
          asset_id: string
          volunteer_id: string | null
          location_id: string | null
          action: string
          action_time: string
          condition_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          volunteer_id?: string | null
          location_id?: string | null
          action: string
          action_time?: string
          condition_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          volunteer_id?: string | null
          location_id?: string | null
          action?: string
          action_time?: string
          condition_notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_coordinator: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 