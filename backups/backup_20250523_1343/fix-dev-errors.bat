@echo off
echo ===== FIXING DEVELOPMENT ERRORS =====
echo.
echo Step 1: Stopping all Node.js processes
taskkill /F /IM node.exe 2>NUL
timeout /t 2 /nobreak >NUL

echo.
echo Step 2: Fixing App.tsx import errors
cd frontend-new
echo import React from "react"; > temp.txt
echo import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; >> temp.txt
echo import { ThemeProvider, CssBaseline } from "@mui/material"; >> temp.txt
echo import { theme } from "./theme"; >> temp.txt
echo import { AuthProvider, useAuth } from "./contexts/AuthContext"; >> temp.txt
echo import VolunteerLayout from "./components/VolunteerLayout"; >> temp.txt
echo import CoordinatorLayout from "./components/CoordinatorLayout"; >> temp.txt
echo import AdminLayout from "./components/AdminLayout"; >> temp.txt
echo import VolunteerDashboard from "./features/volunteer/VolunteerDashboard"; >> temp.txt
echo import ShiftSwapRequest from "./features/volunteer/ShiftSwapRequest"; >> temp.txt
echo import TaskManagement from "./features/coordinator/TaskManagement"; >> temp.txt
echo import VolunteerTasks from "./features/volunteer/VolunteerTasks"; >> temp.txt
echo import ShiftSwapManagement from "./features/coordinator/ShiftSwapManagement"; >> temp.txt
echo import CoordinatorDashboard from "./features/coordinator/CoordinatorDashboard"; >> temp.txt
echo import AutoScheduler from "./features/coordinator/AutoScheduler"; >> temp.txt
echo import WeatherMonitoring from "./features/coordinator/WeatherMonitoring"; >> temp.txt
echo import CrewManagement from "./features/coordinator/CrewManagement"; >> temp.txt
echo import Map from "./features/coordinator/Map"; >> temp.txt
echo import AdminDashboard from "./features/admin/AdminDashboard"; >> temp.txt
echo import AdminFestivals from "./features/admin/AdminFestivals"; >> temp.txt
echo import RoleSwitcher from "./components/RoleSwitcher"; >> temp.txt
type temp.txt > src\App.tsx
del temp.txt

echo.
echo Step 3: Installing missing dependencies
call npm install vite @vitejs/plugin-react --save-dev
call npm install @mui/icons-material --save

echo.
echo Step 4: Ensuring directory structure exists
if not exist "src\features\admin" mkdir "src\features\admin"

echo.
echo Step 5: Creating missing components
if not exist "src\features\admin\AdminDashboard.tsx" (
  echo Creating AdminDashboard.tsx...
  echo import React from 'react'; > src\features\admin\AdminDashboard.tsx
  echo import { Box, Typography } from '@mui/material'; >> src\features\admin\AdminDashboard.tsx
  echo. >> src\features\admin\AdminDashboard.tsx
  echo const AdminDashboard = () => { >> src\features\admin\AdminDashboard.tsx
  echo   return ( >> src\features\admin\AdminDashboard.tsx
  echo     ^<Box sx={{ p: 3 }}^> >> src\features\admin\AdminDashboard.tsx
  echo       ^<Typography variant="h4"^>Admin Dashboard^</Typography^> >> src\features\admin\AdminDashboard.tsx
  echo     ^</Box^> >> src\features\admin\AdminDashboard.tsx
  echo   ); >> src\features\admin\AdminDashboard.tsx
  echo }; >> src\features\admin\AdminDashboard.tsx
  echo. >> src\features\admin\AdminDashboard.tsx
  echo export default AdminDashboard; >> src\features\admin\AdminDashboard.tsx
)

if not exist "src\features\admin\AdminFestivals.tsx" (
  echo Creating AdminFestivals.tsx...
  echo import React from 'react'; > src\features\admin\AdminFestivals.tsx
  echo import { Box, Typography } from '@mui/material'; >> src\features\admin\AdminFestivals.tsx
  echo. >> src\features\admin\AdminFestivals.tsx
  echo const AdminFestivals = () => { >> src\features\admin\AdminFestivals.tsx
  echo   return ( >> src\features\admin\AdminFestivals.tsx
  echo     ^<Box sx={{ p: 3 }}^> >> src\features\admin\AdminFestivals.tsx
  echo       ^<Typography variant="h4"^>Festival Management^</Typography^> >> src\features\admin\AdminFestivals.tsx
  echo     ^</Box^> >> src\features\admin\AdminFestivals.tsx
  echo   ); >> src\features\admin\AdminFestivals.tsx
  echo }; >> src\features\admin\AdminFestivals.tsx
  echo. >> src\features\admin\AdminFestivals.tsx
  echo export default AdminFestivals; >> src\features\admin\AdminFestivals.tsx
)

echo.
echo Step 6: Starting development server on port 5173
call npm run dev -- --port=5173 --host 