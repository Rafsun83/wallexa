import { useQuery } from '@tanstack/react-query';
import { getUser } from '../api/user';

export function useUserQuery() {
  return useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });
}
