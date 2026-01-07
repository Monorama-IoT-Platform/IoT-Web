import axios from "axios";
import { getAccessToken, saveToken, clearToken } from "../utils/tokenStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("[axios] 토큰 없음: Authorization 헤더 미설정");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 아직 재시도를 하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지 플래그

      try {
        // 1. /auth/refresh 엔드포인트로 새 액세스 토큰 요청
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;

        // 2. 새 토큰 저장 및 헤더 업데이트
        saveToken(accessToken);
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        // 3. 기존 요청 재실행
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우 로그아웃 처리
        console.error("세션이 만료되었습니다. 다시 로그인해주세요.");
        clearToken();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
