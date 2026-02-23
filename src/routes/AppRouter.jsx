import { Routes, Route, Navigate } from "react-router-dom";
import { getAccessToken } from "../utils/tokenStorage";
import LoginPage from "../pages/LoginPage";
import ProjectListPage from "../pages/project/ProjectListPage";
import ProjectDetailPage from "../pages/project/ProjectDetailPage";
import ProjectCreatePage from "../pages/project/create/ProjectCreatePage";
import AirProjectSeriesPage from "../pages/AirProjectSeriesPage.jsx";
import RegisterUserPage from "../pages/RegisterUserPage";
import MetaDataFormPage from "../pages/metadata/MetaDataFormPage";
import TokenRedirectPage from "../pages/TokenRedirectPage";
import { useParams } from "react-router-dom";

const PrivateRoute = ({ children }) =>
  getAccessToken() ? children : <Navigate to="/auth/login" replace />;
const PublicRoute = ({ children }) => {
  const token = getAccessToken();
  const isRegisterPage = window.location.pathname === "/auth/register/social";

  if (token && !isRegisterPage) {
    return <Navigate to="/projects" replace />;
  }

  return children;
};

function AppRouter() {
  const SeriesRoute = () => {
    const { projectId } = useParams();
    return <AirProjectSeriesPage projectId={Number(projectId)} />;
  };
  return (
    <Routes>
      <Route path="/auth/token-redirect" element={<TokenRedirectPage />} />
      <Route path="/auth/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/auth/register/social" element={<PublicRoute><RegisterUserPage /></PublicRoute>} />  
      <Route path="/projects" element={<PrivateRoute><ProjectListPage /></PrivateRoute>} />
      <Route path="/projects/create" element={<PrivateRoute><ProjectCreatePage /></PrivateRoute>} />  
      <Route path="/projects/:projectId" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
      <Route path="/metadata/submit/:projectId" element={<PrivateRoute><MetaDataFormPage /></PrivateRoute>} />
      <Route path="/projects/:projectId/series" element={<PrivateRoute><SeriesRoute /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}

export default AppRouter;
