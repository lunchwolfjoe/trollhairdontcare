import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface SystemSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  max_volunteers_per_shift: number;
  min_hours_between_shifts: number;
  max_shifts_per_day: number;
  notification_email_enabled: boolean;
  sms_notifications_enabled: boolean;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  allow_shift_overlap: boolean;
  require_emergency_contact: boolean;
  require_phone_number: boolean;
  require_skills: boolean;
  default_shift_duration: number;
  timezone: string;
  date_format: string;
  time_format: string;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await adminService.getSystemSettings();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      await adminService.updateSystemSettings(settings);
      setSuccessMessage('Settings updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!settings) return <ErrorMessage message="No settings found" />;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Name</label>
              <input
                type="text"
                name="site_name"
                value={settings.site_name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Description</label>
              <textarea
                name="site_description"
                value={settings.site_description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <input
                type="email"
                name="contact_email"
                value={settings.contact_email}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Shift Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Shift Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Volunteers per Shift</label>
              <input
                type="number"
                name="max_volunteers_per_shift"
                value={settings.max_volunteers_per_shift}
                onChange={handleInputChange}
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Hours Between Shifts</label>
              <input
                type="number"
                name="min_hours_between_shifts"
                value={settings.min_hours_between_shifts}
                onChange={handleInputChange}
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Shifts per Day</label>
              <input
                type="number"
                name="max_shifts_per_day"
                value={settings.max_shifts_per_day}
                onChange={handleInputChange}
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Default Shift Duration (hours)</label>
              <input
                type="number"
                name="default_shift_duration"
                value={settings.default_shift_duration}
                onChange={handleInputChange}
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="notification_email_enabled"
                checked={settings.notification_email_enabled}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Enable Email Notifications</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="sms_notifications_enabled"
                checked={settings.sms_notifications_enabled}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Enable SMS Notifications</label>
            </div>
          </div>

          {/* System Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="maintenance_mode"
                checked={settings.maintenance_mode}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Maintenance Mode</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="registration_enabled"
                checked={settings.registration_enabled}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Enable Registration</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="allow_shift_overlap"
                checked={settings.allow_shift_overlap}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Allow Shift Overlap</label>
            </div>
          </div>

          {/* Required Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Required Fields</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="require_emergency_contact"
                checked={settings.require_emergency_contact}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Require Emergency Contact</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="require_phone_number"
                checked={settings.require_phone_number}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Require Phone Number</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="require_skills"
                checked={settings.require_skills}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Require Skills</label>
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Display Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Format</label>
              <select
                name="date_format"
                value={settings.date_format}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time Format</label>
              <select
                name="time_format"
                value={settings.time_format}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="12h">12-hour</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
} 