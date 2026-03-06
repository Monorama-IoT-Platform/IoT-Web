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
  (response) => {
    // 서버에서 `success` 플래그가 false로 내려오면 에러를 담고 있음
    if (response.data && response.data.success === false) {
      const err = response.data.error;
      // 커스텀 권한 없음 코드 (403 꾸러미로 간주)
      if (err && String(err.code).startsWith("403")) {
        console.warn("[axios] 권한 없음 응답 수신, 토큰 삭제 후 /unauthorized로 이동");
        clearToken();
        window.location.href = "/unauthorized";
        // 컴포넌트에서도 예외 처리할 수 있도록 Promise.reject
        return Promise.reject({
          response,
          message: "권한 없음",
        });
      }
    }

    return response;
  },
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

    // HTTP 상태 코드로 403 계열 에러가 내려오는 경우도 동일하게 처리
    if (error.response?.status === 403) {
      console.warn("[axios] HTTP 403 수신, 토큰 삭제 후 /unauthorized로 이동");
      clearToken();
      window.location.href = "/unauthorized";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
