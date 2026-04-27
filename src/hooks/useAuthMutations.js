import { useMutation } from '@tanstack/react-query';
import * as authApi from '../api/auth';

export function useRegisterMutation() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: authApi.login,
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: authApi.logout,
  });
}

export function useLogoutAllMutation() {
  return useMutation({
    mutationFn: authApi.logoutAll,
  });
}
