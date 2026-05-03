import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as walletsApi from '../api/wallets';

export function useCreateWalletMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletsApi.createWallet,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] }),
  });
}
