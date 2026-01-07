import { Routes, Route, Navigate } from "react-router-dom";
import { getAccessToken } from "../utils/tokenStorage";
import LoginPage from "../pages/LoginPage";
import ProjectListPage from "../pages/project/ProjectListPage";
import ProjectDetailPage from "../pages/project/ProjectDetailPage";
import ProjectCreatePage from "../pages/project/create/ProjectCreatePage";
import RegisterUserPage from "../pages/RegisterUserPage";
import MetaDataFormPage from "../pages/metadata/MetaDataFormPage";
import TokenRedirectPage from "../pages/TokenRedirectPage";

const PrivateRoute = ({ children }) =>
  getAccessToken() ? children : <Navigate to="/auth/login" replace />;
const PublicRoute = ({ children }) => {
  const token = getAccessToken();
  // 현재 경로가 소셜 회원가입 페이지인지 확인
  const isRegisterPage = window.location.pathname === "/auth/register/social";

  // 토큰이 존재하고, 가입 페이지가 아닐 때만 /projects로 리다이렉트
  if (token && !isRegisterPage) {
    return <Navigate to="/projects" replace />;
  }

  return children;
};

function AppRouter() {
  return (
    <Routes>
      <Route path="/auth/token-redirect" element={<TokenRedirectPage />} />
      <Route
        path="/auth/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/register/social"
        element={
          <PublicRoute>
            <RegisterUserPage />
          </PublicRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <ProjectListPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/create"
        element={
          <PrivateRoute>
            <ProjectCreatePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <PrivateRoute>
            <ProjectDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/metadata/submit/:projectId"
        element={
          <PrivateRoute>
            <MetaDataFormPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}

export default AppRouter;

// TODO: 리프레시 토큰로직 회원가입 후 또는 만료
