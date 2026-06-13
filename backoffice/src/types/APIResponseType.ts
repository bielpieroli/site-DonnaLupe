export type PermissionLevel = 'none' | 'read' | 'write'

export interface Permission {
  backoffice_email: string
  resource: string
  level: PermissionLevel
}

export interface AuthUser {
  email: string
  name: string
}

export interface StoredSession extends AuthUser {
  token: string
  permissions: Permission[]
}

export interface LoginResponse {
  message: string
  user: { email: string }
  token: string
  permissions: Permission[]
}

export interface BackofficeUser {
  email: string
}

export interface UserListResponse {
  users: BackofficeUser[]
  total_records: number
  filtered_records: number
  page: number
  limit: number
}

export interface PermissionsResponse {
  email: string
  permissions: Permission[]
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}
