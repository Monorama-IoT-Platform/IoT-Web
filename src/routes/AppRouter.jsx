import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
// import ProjectListPage from '../pages/ProjectListPage';
// import ProjectCreatePage from '../pages/ProjectCreatePage';

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/projects" element={<ProjectListPage />} /> */}
      {/* <Route path="/projects/create" element={<ProjectCreatePage />} /> */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRouter;