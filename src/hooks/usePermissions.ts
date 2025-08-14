import { useAuthContext } from '../contexts/AuthContext';
import { User } from '../types';

type Permission = 
  | 'read_clients' 
  | 'write_clients'
  | 'read_processes' 
  | 'write_processes'
  | 'read_financial' 
  | 'write_financial'
  | 'read_users' 
  | 'write_users'
  | 'read_settings' 
  | 'write_settings'
  | 'read_reports'
  | 'admin_access';

const rolePermissions: Record<User['role'], Permission[]> = {
  admin: [
    'read_clients', 'write_clients',
    'read_processes', 'write_processes',
    'read_financial', 'write_financial',
    'read_users', 'write_users',
    'read_settings', 'write_settings',
    'read_reports',
    'admin_access'
  ],
  advogado: [
    'read_clients', 'write_clients',
    'read_processes', 'write_processes',
    'read_financial', 'write_financial',
    'read_reports'
  ],
  estagiario: [
    'read_clients', 'write_clients',
    'read_processes', 'write_processes',
    'read_reports'
  ],
  cliente: [
    'read_processes' // Apenas seus próprios processos
  ]
};

export function usePermissions() {
  const { user } = useAuthContext();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccess = (resource: string, action: 'read' | 'write' = 'read'): boolean => {
    const permission = `${action}_${resource}` as Permission;
    return hasPermission(permission);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    userRole: user?.role,
    isAdmin: user?.role === 'admin'
  };
}