// User interfaces
export interface UserSignupRequest {
  address?: string;
  email?: string;
  username?: string;
  authType: 'WALLET' | 'EMAIL' | 'BOTH';
}

export interface UserResponse {
  id: string;
  address?: string;
  email?: string;
  username?: string;
  authType: string;
  createdAt: string;
  updatedAt: string;
}

// Stake interfaces
export interface CreateStakeRequest {
  userId: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: number;
  duration: number; // in days
  apy: number;
  isFlexible?: boolean;
  minDuration?: number;
  poolId?: number;
  poolName?: string;
  poolCategory?: string;
  cbvRateAtStake?: number; // CBV token rate at time of stake (from contract/API)
  returnPercentage?: number; // Return percentage in basis points (APY * 100)
  isEthStake?: boolean; // true for ETH staking, false for token staking
  externalTxHash?: string; // Blockchain transaction hash
  externalService?: string; // Service that processed the transaction
  gasUsed?: number;
  gasPrice?: number;
  blockNumber?: number;
}

export interface UpdateStakeRequest {
  stakeId: string;
  duration?: number;
  amount?: number;
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'UNSTAKED';
}

export interface StakeResponse {
  id: string;
  userId: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: number;
  duration: number;
  startTime: string;
  endTime: string;
  apy: number;
  status: string;
  isFlexible: boolean;
  minDuration?: number;
  poolId?: number;
  poolName?: string;
  poolCategory?: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction interfaces
export interface CreateSwapTransactionRequest {
  userId: string;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  swapRate: number;
  externalTxHash?: string;
  externalService?: string;
}

export interface CreateTransferTransactionRequest {
  userId: string;
  recipient: string;
  amount: number;
  tokenAddress: string;
  externalTxHash?: string;
  externalService?: string;
}

export interface CreateExternalTransactionRequest {
  userId: string;
  type: 'SWAP' | 'TRANSFER' | 'STAKE' | 'UNSTAKE' | 'EXTERNAL_TRANSFER';
  externalTxHash: string;
  externalService: string;
  fromToken?: string;
  toToken?: string;
  fromAmount?: number;
  toAmount?: number;
  recipient?: string;
  amount?: number;
  tokenAddress?: string;
  gasUsed?: number;
  gasPrice?: number;
  blockNumber?: number;
}

export interface TransactionResponse {
  id: string;
  userId: string;
  type: string;
  status: string;
  fromToken?: string;
  toToken?: string;
  fromAmount?: number;
  toAmount?: number;
  swapRate?: number;
  recipient?: string;
  amount?: number;
  tokenAddress?: string;
  externalTxHash?: string;
  externalService?: string;
  gasUsed?: number;
  gasPrice?: number;
  blockNumber?: number;
  createdAt: string;
  updatedAt: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  status_code: number;
  status: boolean;
  message: string;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
  data: T;
}