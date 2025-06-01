export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface TableRelationships {
  Relationships: {
    foreignKeyName: string;
    columns: string[];
    referencedRelation: string;
    referencedColumns: string[];
  }[];
}

export interface Database {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string;
          name: string;
          description: string;
          category_id: string;
          status: string;
          location: string;
          quantity: number;
          festival_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          category_id?: string;
          status?: string;
          location?: string;
          quantity?: number;
          festival_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category_id?: string;
          status?: string;
          location?: string;
          quantity?: number;
          festival_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      asset_categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      asset_maintenance: {
        Row: {
          id: string;
          asset_id: string;
          description: string;
          status: string;
          scheduled_date: string;
          completed_date?: string;
          assigned_to?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          description: string;
          status?: string;
          scheduled_date: string;
          completed_date?: string;
          assigned_to?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asset_id?: string;
          description?: string;
          status?: string;
          scheduled_date?: string;
          completed_date?: string;
          assigned_to?: string;
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      crews: {
        Row: {
          id: string;
          name: string;
          description: string;
          crew_type: string;
          required_skills: Json;
          min_headcount: number;
          max_headcount: number;
          shift_start_time: string;
          shift_end_time: string;
          shift_length_hours: number;
          festival_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          crew_type?: string;
          required_skills?: Json;
          min_headcount?: number;
          max_headcount?: number;
          shift_start_time?: string;
          shift_end_time?: string;
          shift_length_hours?: number;
          festival_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          crew_type?: string;
          required_skills?: Json;
          min_headcount?: number;
          max_headcount?: number;
          shift_start_time?: string;
          shift_end_time?: string;
          shift_length_hours?: number;
          festival_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      festivals: {
        Row: {
          id: string;
          name: string;
          description: string;
          start_date: string;
          end_date: string;
          location: string;
          status: 'active' | 'planning' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          start_date: string;
          end_date: string;
          location?: string;
          status?: 'active' | 'planning' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          location?: string;
          status?: 'active' | 'planning' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string;
          email: string;
          phone?: string;
          roles: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url: string;
          email: string;
          phone?: string;
          roles?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string;
          email?: string;
          phone?: string;
          roles?: string[];
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      volunteers: {
        Row: {
          id: string;
          profile_id: string;
          festival_id: string;
          crew_id?: string;
          status: string;
          skills: string[];
          availability: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          festival_id: string;
          crew_id?: string;
          status?: string;
          skills?: string[];
          availability?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          festival_id?: string;
          crew_id?: string;
          status?: string;
          skills?: string[];
          availability?: Json;
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      shifts: {
        Row: {
          id: string;
          crew_id: string;
          start_time: string;
          end_time: string;
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          crew_id: string;
          start_time: string;
          end_time: string;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          crew_id?: string;
          start_time?: string;
          end_time?: string;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      shift_swap_requests: {
        Row: {
          id: string;
          shift_id: string;
          requester_id: string;
          proposed_volunteer_id: string;
          reason: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shift_id: string;
          requester_id: string;
          proposed_volunteer_id: string;
          reason: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shift_id?: string;
          requester_id?: string;
          proposed_volunteer_id?: string;
          reason?: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      guests: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          festival_id: string;
          ticket_type?: string | null;
          ticket_number?: string | null;
          checked_in: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          festival_id: string;
          ticket_type?: string | null;
          ticket_number?: string | null;
          checked_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          festival_id?: string;
          ticket_type?: string | null;
          ticket_number?: string | null;
          checked_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      health_check: {
        Row: { 
          id: number;
          status: string; 
          created_at: string; 
        };
        Insert: { 
          id?: number;
          status: string; 
          created_at?: string; 
        };
        Update: { 
          id?: number;
          status?: string; 
          created_at?: string; 
        };
      } & TableRelationships;
      weather_forecast_settings: {
        Row: { 
          id: number;
          location: string; 
          api_key: string; 
          units: string;
          created_at: string; 
        };
        Insert: { 
          id?: number;
          location: string; 
          api_key: string; 
          units?: string;
          created_at?: string; 
        };
        Update: { 
          id?: number;
          location?: string; 
          api_key?: string; 
          units?: string;
          created_at?: string; 
        };
      } & TableRelationships;
      user_roles: {
        Row: {
          user_id: string;
          role_id: string;
        };
        Insert: {
          user_id: string;
          role_id: string;
        };
        Update: {
          user_id?: string;
          role_id?: string;
        };
      } & TableRelationships;
      roles: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
      } & TableRelationships;
      asset_logs: {
        Row: {
          id: string;
          asset_id: string;
          action: string;
          details?: Json | null;
          user_id?: string | null;
          action_time: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          action: string;
          details?: Json | null;
          user_id?: string | null;
          action_time?: string;
        };
        Update: {
          id?: string;
          asset_id?: string;
          action?: string;
          details?: Json | null;
          user_id?: string | null;
          action_time?: string;
        };
      } & TableRelationships;
      tasks: {
        Row: {
          id: string;
          title: string;
          description?: string | null;
          status: 'todo' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          assignee_id?: string | null;
          creator_id?: string | null;
          festival_id?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          assignee_id?: string | null;
          creator_id?: string | null;
          festival_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          assignee_id?: string | null;
          creator_id?: string | null;
          festival_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      locations: {
        Row: {
          id: string;
          festival_id: string;
          name: string;
          description?: string | null;
          location_type?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: { 
          id?: string; 
          festival_id: string; 
          name: string; 
          description?: string | null;
          location_type?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string; 
          updated_at?: string; 
        };
        Update: { 
          id?: string; 
          festival_id?: string; 
          name?: string; 
          description?: string | null;
          location_type?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string; 
          updated_at?: string; 
        };
      } & TableRelationships;
      messages: {
        Row: {
          id: string;
          festival_id: string;
          sender_id?: string | null;
          subject?: string | null;
          content: string;
          message_type: 'announcement' | 'notification' | 'direct';
          audience?: string[] | null;
          important?: boolean;
          created_at: string;
        };
        Insert: { 
          id?: string; 
          festival_id: string; 
          sender_id?: string | null;
          subject?: string | null;
          content: string; 
          message_type?: 'announcement' | 'notification' | 'direct'; 
          audience?: string[] | null;
          important?: boolean;
          created_at?: string; 
        };
        Update: { 
          id?: string; 
          festival_id?: string; 
          sender_id?: string | null;
          subject?: string | null;
          content?: string; 
          message_type?: 'announcement' | 'notification' | 'direct'; 
          audience?: string[] | null;
          important?: boolean;
          created_at?: string; 
        };
      } & TableRelationships;
      direct_messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: { 
          id?: string; 
          sender_id: string; 
          recipient_id: string; 
          content: string; 
          read?: boolean; 
          created_at?: string; 
        };
        Update: { 
          id?: string; 
          sender_id?: string; 
          recipient_id?: string; 
          content?: string; 
          read?: boolean; 
          created_at?: string; 
        };
      } & TableRelationships;
      crew_coordinators: {
        Row: {
          crew_id: string;
          coordinator_id: string;
          assigned_at: string;
        };
        Insert: {
          crew_id: string;
          coordinator_id: string;
          assigned_at?: string;
        };
        Update: {
          crew_id?: string;
          coordinator_id?: string;
          assigned_at?: string;
        };
      } & TableRelationships;
      task_categories: {
        Row: {
          id: string;
          name: string;
          description?: string | null;
          festival_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          festival_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          festival_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      assignments: {
        Row: {
          id: string;
          volunteer_id: string;
          shift_id?: string | null;
          task_id?: string | null;
          crew_id?: string | null;
          start_time: string;
          end_time: string;
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed';
          notes?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          volunteer_id: string;
          shift_id?: string | null;
          task_id?: string | null;
          crew_id?: string | null;
          start_time: string;
          end_time: string;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          volunteer_id?: string;
          shift_id?: string | null;
          task_id?: string | null;
          crew_id?: string | null;
          start_time?: string;
          end_time?: string;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
      crew_members: {
        Row: {
          id: string;
          crew_id: string;
          volunteer_id: string;
          member_role?: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          crew_id: string;
          volunteer_id: string;
          member_role?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          crew_id?: string;
          volunteer_id?: string;
          member_role?: string | null;
          joined_at?: string;
        };
      } & TableRelationships;
      incidents: {
        Row: {
          id: string;
          festival_id: string;
          title: string;
          description?: string | null;
          incident_type?: string | null;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          status?: 'open' | 'investigating' | 'resolved' | 'closed';
          location?: string | null;
          reported_by?: string | null;
          reported_at: string;
          resolved_at?: string | null;
          resolution_notes?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          festival_id: string;
          title: string;
          description?: string | null;
          incident_type?: string | null;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          status?: 'open' | 'investigating' | 'resolved' | 'closed';
          location?: string | null;
          reported_by?: string | null;
          reported_at?: string;
          resolved_at?: string | null;
          resolution_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          festival_id?: string;
          title?: string;
          description?: string | null;
          incident_type?: string | null;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          status?: 'open' | 'investigating' | 'resolved' | 'closed';
          location?: string | null;
          reported_by?: string | null;
          reported_at?: string;
          resolved_at?: string | null;
          resolution_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      } & TableRelationships;
    };
    Views: {};
    Functions: {
      confirm_user_email: {
        Args: { user_id: string };
        Returns: void;
      };
      get_festival_stats: {
        Args: { festival_id: string };
        Returns: Json;
      };
      execute_sql: {
        Args: { sql_query: string };
        Returns: Json;
      };
    };
    Enums: {};
  };
} 