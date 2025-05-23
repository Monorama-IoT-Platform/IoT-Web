// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from '../pages/LoginPage';
// import ProjectListPage from '../pages/ProjectListPage';
// import { getAccessToken } from '../utils/tokenStorage'; 

// const PrivateRoute = ({ children }) => {
//   const token = getAccessToken();
//   return token ? children : <Navigate to="/login" replace />;
// };

// const PublicRoute = ({ children }) => {
//   const token = getAccessToken();
//   return token ? <Navigate to="/projects" replace /> : children;
// };

// function AppRouter() {
//   return (
//     <Routes>
//       <Route
//         path="/login"
//         element={
//           <PublicRoute>
//             <LoginPage />
//           </PublicRoute>
//         }
//       />
//       <Route
//         path="/projects"
//         element={
//           <PrivateRoute>
//             <ProjectListPage />
//           </PrivateRoute>
//         }
//       />
//       <Route path="*" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }

// export default AppRouter;

import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import ProjectListPage from '../pages/ProjectListPage';
import ProjectCreatePage from '../pages/ProjectCreatePage';
import RegisterUserPage from '../pages/RegisterUserPage';

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/register/social" element={<RegisterUserPage />} />
      <Route path="/projects" element={<ProjectListPage />} />
      <Route path="/projects/create" element={<ProjectCreatePage />} />
      {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
    </Routes>
  );
}

export default AppRouter;