// src/types.ts

export interface Token {
    token_address: string;
    symbol: string;
    name: string;
    logo: string;
    thumbnail: string;
    decimals: number;
    balance: string;
    possible_spam: boolean;
    verified_contract: boolean;
    total_supply: string;
    total_supply_formatted: string;
    percentage_relative_to_total_supply: number;
    security_score: number;
  }
  