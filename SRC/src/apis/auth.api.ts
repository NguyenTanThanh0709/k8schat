import { AuthResponse } from 'src/types/auth.type'
import http from 'src/utils/http'
export const URL_LOGIN = 'api/user/auth/login'
export const URL_REGISTER = 'api/user/auth/register'
export const URL_LOGOUT = 'api/user/auth/logout'
export const URL_REFRESH_TOKEN = 'refresh-access-token'

const authApi = {
  registerAccount(body: { email: string; password: string }) {
    return http.post<AuthResponse>(URL_REGISTER, body)
  },
  loginAccount(body: { email: string; password: string }) {
    return http.post<AuthResponse>(URL_LOGIN, body)
  },
  logoutAccount() {
    return http.post(URL_LOGOUT)
  }
}
export default authApi
