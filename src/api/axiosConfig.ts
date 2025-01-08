import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token as string);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest.url === '/auth/refresh-token') {
      isRefreshing = false;
      failedQueue = [];
      delete axiosInstance.defaults.headers.common.Authorization;
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Interceptor: 401 error detected', {
        url: originalRequest.url,
        isRetry: !!originalRequest._retry,
        isRefreshing
      });

      if (isRefreshing) {
        console.log('Interceptor: Token refresh already in progress, queueing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log('Interceptor: Retrying request with new token');
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            console.error('Interceptor: Failed queue request error:', err);
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Interceptor: Attempting token refresh');
        const response = await axiosInstance.post('/auth/refresh-token');
        const { accessToken } = response.data;
        
        console.log('Interceptor: Token refresh successful');
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Interceptor: Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 