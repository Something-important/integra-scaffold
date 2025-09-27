export interface Investment {
  id: number;
  user_wallet_address: string;
  property_id: string;
  shares_owned: number;
  purchase_price: string; // Total amount paid in ETH/USDT
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvestmentRequest {
  propertyId: string;
  shares: number;
  amountInvested: string;
  sharePrice: string;
  transactionHash?: string;
}

export interface InvestmentResponse {
  success: boolean;
  data?: Investment;
  error?: string;
}

export interface InvestmentsResponse {
  success: boolean;
  data?: Investment[];
  error?: string;
}