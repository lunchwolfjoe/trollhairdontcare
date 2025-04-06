import { supabase } from "../lib/supabase";

export interface DashboardStats {
  totalShifts: number;
  completedShifts: number;
  upcomingShifts: number;
  totalHours: number;
  pendingApprovals?: number;
  activeFestivals?: number;
  totalVolunteers?: number;
}

export interface Shift {
  id: string;
  festival_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  required_skills: string[];
  max_volunteers: number;
  current_volunteers: number;
  status: 'open' | 'filled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  task_description: string;
}

export interface ShiftAssignment {
  id: string;
  shift_id: string;
  volunteer_id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  rating?: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface VolunteerStats {
  total_shifts: number;
  completed_shifts: number;
  upcoming_shifts: number;
  total_hours: number;
  average_rating: number;
}

export const volunteerService = {
  // Get all shifts for a festival
  async getFestivalShifts(festivalId: string): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('festival_id', festivalId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get shifts assigned to a volunteer
  async getVolunteerShifts(volunteerId: string): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shift_assignments')
      .select(`
        shift:shifts(*)
      `)
      .eq('volunteer_id', volunteerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map((assignment) => assignment.shift);
  },

  // Get volunteer statistics
  async getVolunteerStats(userId: string): Promise<DashboardStats> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('volunteer_id', userId);

    if (error) throw error;

    const now = new Date();
    const totalShifts = data.length;
    const completedShifts = data.filter(shift => 
      new Date(shift.end_time) < now && shift.status === 'completed'
    ).length;
    const upcomingShifts = data.filter(shift => 
      new Date(shift.start_time) > now && shift.status === 'scheduled'
    ).length;
    const totalHours = data.reduce((acc, shift) => {
      const start = new Date(shift.start_time);
      const end = new Date(shift.end_time);
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    return {
      totalShifts,
      completedShifts,
      upcomingShifts,
      totalHours: Math.round(totalHours),
    };
  },

  // Assign a volunteer to a shift
  async assignToShift(shiftId: string, volunteerId: string): Promise<ShiftAssignment> {
    const { data, error } = await supabase
      .from('shift_assignments')
      .insert([
        {
          shift_id: shiftId,
          volunteer_id: volunteerId,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update shift's current_volunteers count
    await supabase.rpc('increment_shift_volunteers', { shift_id: shiftId });

    return data;
  },

  // Update shift assignment status
  async updateAssignmentStatus(
    assignmentId: string,
    status: ShiftAssignment['status'],
    notes?: string
  ): Promise<ShiftAssignment> {
    const { data, error } = await supabase
      .from('shift_assignments')
      .update({ status, notes })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get available shifts for a volunteer based on their skills and availability
  async getAvailableShifts(volunteerId: string): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('status', 'open')
      .lt('current_volunteers', supabase.raw('max_volunteers'))
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  // New methods for shift management
  async createShift(shift: Omit<Shift, 'id' | 'created_at' | 'updated_at'>): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .insert([shift])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateShift(shift: Partial<Shift> & { id: string }): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .update(shift)
      .eq('id', shift.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteShift(shiftId: string): Promise<void> {
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', shiftId);

    if (error) throw error;
  },

  async completeShift(
    shiftId: string,
    volunteerId: string,
    completion: { rating: number; feedback: string }
  ): Promise<ShiftAssignment> {
    const { data, error } = await supabase
      .from('shift_assignments')
      .update({
        status: 'completed',
        rating: completion.rating,
        feedback: completion.feedback,
      })
      .eq('shift_id', shiftId)
      .eq('volunteer_id', volunteerId)
      .select()
      .single();

    if (error) throw error;

    // Update shift status if all volunteers have completed
    await supabase.rpc('check_shift_completion', { shift_id: shiftId });

    return data;
  },

  // Real-time subscriptions
  subscribeToShifts: (festivalId: string, callback: (payload: any) => void) => {
    return supabase
      .from('shifts')
      .on('*', callback)
      .subscribe();
  },

  subscribeToAssignments: (volunteerId: string, callback: (payload: any) => void) => {
    return supabase
      .from('shift_assignments')
      .on('*', callback)
      .subscribe();
  },

  async getCoordinatorStats(): Promise<DashboardStats> {
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*');

    if (assignmentsError) throw assignmentsError;

    const { data: festivals, error: festivalsError } = await supabase
      .from('festivals')
      .select('*')
      .eq('status', 'active');

    if (festivalsError) throw festivalsError;

    const now = new Date();
    const totalShifts = assignments.length;
    const completedShifts = assignments.filter(shift => 
      new Date(shift.end_time) < now && shift.status === 'completed'
    ).length;
    const upcomingShifts = assignments.filter(shift => 
      new Date(shift.start_time) > now && shift.status === 'scheduled'
    ).length;
    const pendingApprovals = assignments.filter(shift => 
      shift.status === 'pending'
    ).length;

    return {
      totalShifts,
      completedShifts,
      upcomingShifts,
      totalHours: 0, // Not relevant for coordinators
      pendingApprovals,
      activeFestivals: festivals.length,
    };
  },

  async getAdminStats(): Promise<DashboardStats> {
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*');

    if (assignmentsError) throw assignmentsError;

    const { data: festivals, error: festivalsError } = await supabase
      .from('festivals')
      .select('*')
      .eq('status', 'active');

    if (festivalsError) throw festivalsError;

    const { data: volunteers, error: volunteersError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'volunteer');

    if (volunteersError) throw volunteersError;

    const now = new Date();
    const totalShifts = assignments.length;
    const completedShifts = assignments.filter(shift => 
      new Date(shift.end_time) < now && shift.status === 'completed'
    ).length;
    const upcomingShifts = assignments.filter(shift => 
      new Date(shift.start_time) > now && shift.status === 'scheduled'
    ).length;

    return {
      totalShifts,
      completedShifts,
      upcomingShifts,
      totalHours: 0, // Not relevant for admins
      activeFestivals: festivals.length,
      totalVolunteers: volunteers.length,
    };
  },

  async getUpcomingShifts(userId: string): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        id,
        festival_id,
        start_time,
        end_time,
        location,
        task_description,
        status,
        festivals (
          name
        )
      `)
      .eq('volunteer_id', userId)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(5);

    if (error) throw error;

    return data.map(shift => ({
      ...shift,
      location: shift.festivals?.name || shift.location,
    }));
  },
}; 