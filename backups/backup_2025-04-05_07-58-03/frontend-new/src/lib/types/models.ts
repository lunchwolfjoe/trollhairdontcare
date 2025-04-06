/**
 * Common fields for all models
 */
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at?: string;
}

/**
 * User profile
 */
export interface Profile extends BaseModel {
  full_name?: string;
  avatar_url?: string;
}

/**
 * Role definition
 */
export interface Role extends BaseModel {
  name: string;
  description?: string;
}

/**
 * User-role relationship
 */
export interface UserRole {
  user_id: string;
  role_id: string;
  created_at: string;
}

/**
 * Festival information
 */
export interface Festival extends BaseModel {
  name: string;
  start_date: string;
  end_date: string;
  location?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  map_url?: string;
}

/**
 * Location within a festival
 */
export interface Location extends BaseModel {
  festival_id: string;
  name: string;
  description?: string;
  location_type: string;
  coordinates?: any; // JSONB in database
}

/**
 * Volunteer record
 */
export interface Volunteer extends BaseModel {
  profile_id: string;
  festival_id: string;
  application_status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  availability_start?: string;
  availability_end?: string;
}

/**
 * Assignment for volunteers
 */
export interface Assignment extends BaseModel {
  volunteer_id: string;
  location_id?: string;
  task_description: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

/**
 * Waiver data
 */
export interface Waiver extends BaseModel {
  festival_id: string;
  volunteer_id: string;
  template_content: string;
  version: string;
  signed_at?: string;
  signature?: string;
  signed_document_path?: string;
}

/**
 * Message data
 */
export interface Message extends BaseModel {
  festival_id: string;
  sender_id: string;
  content: string;
  message_type: 'announcement' | 'notification' | 'message';
}

/**
 * Communication channel
 */
export interface Channel extends BaseModel {
  festival_id: string;
  name: string;
  description?: string;
}

/**
 * Message in a channel
 */
export interface ChannelMessage extends BaseModel {
  channel_id: string;
  sender_id: string;
  content: string;
}

/**
 * Musical act information
 */
export interface MusicalAct extends BaseModel {
  festival_id: string;
  name: string;
  description?: string;
  genre?: string;
  website_url?: string;
  social_media?: any; // JSONB in database
  performance_duration?: string; // INTERVAL in database
  technical_requirements?: string;
}

/**
 * Performance schedule
 */
export interface PerformanceSchedule extends BaseModel {
  festival_id: string;
  act_id: string;
  location_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

/**
 * Crew information
 */
export interface Crew extends BaseModel {
  festival_id: string;
  name: string;
  description?: string;
  crew_type: string;
  shift_start_time: string;
  shift_end_time: string;
  shift_length_hours: number;
  min_headcount: number;
  max_headcount: number;
  required_skills?: unknown; // This matches a JSONB column in database
  
  // UI-specific fields (mapped from database fields)
  operatingStartTime?: string; // Mapped from shift_start_time
  operatingEndTime?: string; // Mapped from shift_end_time
  minVolunteers?: number; // Mapped from min_headcount
  maxVolunteers?: number; // Mapped from max_headcount
  requiredSkills?: string[]; // UI representation of required_skills
  assignedVolunteers?: string[]; // Calculated field, not stored directly
}

/**
 * Crew membership
 */
export interface CrewMember extends BaseModel {
  crew_id: string;
  volunteer_id: string;
  role: string;
}

/**
 * Shift information
 */
export interface Shift extends BaseModel {
  festival_id: string;
  crew_id: string;
  location_id: string;
  start_time: string;
  end_time: string;
  required_volunteers: number;
  status: 'open' | 'filled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

/**
 * Shift assignment
 */
export interface ShiftAssignment extends BaseModel {
  shift_id: string;
  volunteer_id: string;
  status: 'scheduled' | 'checked-in' | 'completed' | 'missed';
  notes?: string;
}

/**
 * Weather forecast
 */
export interface WeatherForecast extends BaseModel {
  festival_id: string;
  forecast_time: string;
  temperature?: number;
  conditions?: string;
  precipitation_chance?: number;
  wind_speed?: number;
  wind_direction?: string;
  uv_index?: number;
  notes?: string;
}

/**
 * Asset category
 */
export interface AssetCategory extends BaseModel {
  name: string;
  description?: string;
}

/**
 * Asset information
 */
export interface Asset extends BaseModel {
  festival_id: string;
  category_id?: string;
  name: string;
  description?: string;
  serial_number?: string;
  acquisition_date?: string;
  value?: number;
  status: 'available' | 'in-use' | 'maintenance' | 'lost' | 'retired';
  location_type?: 'fixed' | 'mobile' | 'storage'; // Type of location
  current_location_id?: string;
  location_lat?: string | number; // Latitude for fixed locations
  location_long?: string | number; // Longitude for fixed locations
  assigned_volunteer_id?: string;
  qr_code?: string;
  notes?: string;
}

/**
 * Asset maintenance record
 */
export interface AssetMaintenance extends BaseModel {
  asset_id: string;
  maintenance_type: string;
  description?: string;
  performed_by?: string;
  maintenance_date: string;
  next_maintenance_date?: string;
  cost?: number;
  notes?: string;
}

/**
 * Asset usage log
 */
export interface AssetLog extends BaseModel {
  asset_id: string;
  volunteer_id?: string;
  location_id?: string;
  action: 'check_out' | 'check_in' | 'transfer' | 'maintenance' | 'lost';
  action_time: string;
  condition_notes?: string;
} 