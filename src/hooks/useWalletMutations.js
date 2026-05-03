import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as walletsApi from '../api/wallets';

export function useCreateWalletMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletsApi.createWallet,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] }),
  });
}

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ walletId, ...payload }) =>
      walletsApi.createTransaction(walletId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', String(variables.walletId)] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}
