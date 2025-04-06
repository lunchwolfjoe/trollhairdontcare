import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Admin section components
const ManageUsers = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-2xl font-bold mb-6">User Management</h2>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Users</h3>
          <p className="text-sm text-gray-500">Manage user accounts and roles</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* User rows will be populated here */}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const ManageRoles = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-2xl font-bold mb-6">Role Management</h2>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Roles</h3>
          <p className="text-sm text-gray-500">Configure role permissions</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Role
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {["admin", "coordinator", "volunteer"].map((role) => (
          <div key={role} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium capitalize">{role}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {role === "admin"
                    ? "Full system access"
                    : role === "coordinator"
                    ? "Event management access"
                    : "Basic access"}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Edit</span>
                {/* Edit icon */}
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ManageEvents = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-2xl font-bold mb-6">Festival Management</h2>
    <div className="space-y-6">
      {/* Festivals Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Festivals</h3>
            <p className="text-sm text-gray-500">Manage festival events</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Festival
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sample festival card */}
          <div className="border rounded-lg p-4">
            <h4 className="text-lg font-medium">Summer Festival 2024</h4>
            <p className="text-sm text-gray-500 mt-1">June 15-20, 2024</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
              <button className="text-red-600 hover:text-red-800">Delete</button>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Locations</h3>
            <p className="text-sm text-gray-500">Manage festival locations</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Location
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sample location card */}
          <div className="border rounded-lg p-4">
            <h4 className="text-lg font-medium">Main Stage</h4>
            <p className="text-sm text-gray-500 mt-1">Capacity: 5000</p>
            <div className="mt-4 flex justify-end">
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Assets</h3>
            <p className="text-sm text-gray-500">Track festival assets</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Asset
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Asset
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Asset rows will be populated here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "bg-blue-700" : "";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-blue-800 min-h-screen p-4">
          <div className="text-white font-bold text-xl mb-8">Admin Panel</div>
          <nav className="space-y-2">
            <Link
              to="/admin/users"
              className={`block px-4 py-2 text-white rounded hover:bg-blue-700 transition-colors ${isActive(
                "/admin/users"
              )}`}
            >
              Manage Users
            </Link>
            <Link
              to="/admin/roles"
              className={`block px-4 py-2 text-white rounded hover:bg-blue-700 transition-colors ${isActive(
                "/admin/roles"
              )}`}
            >
              Manage Roles
            </Link>
            <Link
              to="/admin/events"
              className={`block px-4 py-2 text-white rounded hover:bg-blue-700 transition-colors ${isActive(
                "/admin/events"
              )}`}
            >
              Manage Events
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <div className="text-sm text-gray-500">
                  Logged in as: {user?.email}
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <Routes>
                <Route path="users" element={<ManageUsers />} />
                <Route path="roles" element={<ManageRoles />} />
                <Route path="events" element={<ManageEvents />} />
                <Route
                  path="/"
                  element={
                    <div className="bg-white shadow rounded-lg p-6">
                      <h2 className="text-2xl font-bold mb-4">
                        Welcome to the Admin Dashboard
                      </h2>
                      <p className="text-gray-600">
                        Select a section from the sidebar to manage your festival
                        system.
                      </p>
                    </div>
                  }
                />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}; 
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sample location card */}
          <div className="border rounded-lg p-4">
            <h4 className="text-lg font-medium">Main Stage</h4>
            <p className="text-sm text-gray-500 mt-1">Capacity: 5000</p>
            <div className="mt-4 flex justify-end">
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Assets</h3>
            <p className="text-sm text-gray-500">Track festival assets</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Asset
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Asset
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Asset rows will be populated here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "bg-blue-700" : "";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-blue-800 min-h-screen p-4">
          <div className="text-white font-bold text-xl mb-8">Admin Panel</div>
          <nav className="space-y-2">
            <Link
              to="/admin/users"
              className={`block px-4 py-2 text-white rounded hover:bg-blue-700 transition-colors ${isActive(
                "/admin/users"
              )}`}
            >
              Manage Users
            </Link>
            <Link
              to="/admin/roles"
              className={`block px-4 py-2 text-white rounded hover:bg-blue-700 transition-colors ${isActive(
                "/admin/roles"
              )}`}
            >
              Manage Roles
            </Link>
            <Link
              to="/admin/events"
              className={`block px-4 py-2 text-white rounded hover:bg-blue-700 transition-colors ${isActive(
                "/admin/events"
              )}`}
            >
              Manage Events
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <div className="text-sm text-gray-500">
                  Logged in as: {user?.email}
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <Routes>
                <Route path="users" element={<ManageUsers />} />
                <Route path="roles" element={<ManageRoles />} />
                <Route path="events" element={<ManageEvents />} />
                <Route
                  path="/"
                  element={
                    <div className="bg-white shadow rounded-lg p-6">
                      <h2 className="text-2xl font-bold mb-4">
                        Welcome to the Admin Dashboard
                      </h2>
                      <p className="text-gray-600">
                        Select a section from the sidebar to manage your festival
                        system.
                      </p>
                    </div>
                  }
                />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}; 
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sample location card */}
          <div className="border rounded-lg p-4">
            <h4 className="text-lg font-medium">Main Stage</h4>
            <p className="text-sm text-gray-500 mt-1">Capacity: 5000</p>
            <div className="mt-4 flex justify-end">
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Assets</h3>
            <p className="text-sm text-gray-500">Track festival assets</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Asset
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Asset
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Asset rows will be populated here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "bg-blue-700" : "";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-blue-800 min-h-screen p-4">
          <div className="text-white font-bold text-xl mb-8">Admin Panel</div>
          <nav className="space-y-2">
            <Link
              to="/admin/users"
              className={`block px-4 py-2 text-white rounded hover:bg-blue-700 transition-colors ${isActive(
                "/admin/users"
              )}`}
            >
              Manage Users
            </Link>
            <Link
              to="/admin/roles"
              className={`block px-4 py-2 text-white rounded hover:bg-blue-700 transition-colors ${isActive(
                "/admin/roles"
              )}`}
            >
              Manage Roles
            </Link>
            <Link
              to="/admin/events"
              className={`block px-4 py-2 text-white rounded hover:bg-blue-700 transition-colors ${isActive(
                "/admin/events"
              )}`}
            >
              Manage Events
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <div className="text-sm text-gray-500">
                  Logged in as: {user?.email}
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <Routes>
                <Route path="users" element={<ManageUsers />} />
                <Route path="roles" element={<ManageRoles />} />
                <Route path="events" element={<ManageEvents />} />
                <Route
                  path="/"
                  element={
                    <div className="bg-white shadow rounded-lg p-6">
                      <h2 className="text-2xl font-bold mb-4">
                        Welcome to the Admin Dashboard
                      </h2>
                      <p className="text-gray-600">
                        Select a section from the sidebar to manage your festival
                        system.
                      </p>
                    </div>
                  }
                />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}; 