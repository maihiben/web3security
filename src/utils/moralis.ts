import axios from 'axios';

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6Ijg0MTY3YjdlLTFjZWEtNDU5NC1iMDJiLTRkNDcyNzM0N2ZkOSIsIm9yZ0lkIjoiNDA1NTk1IiwidXNlcklkIjoiNDE2Nzc0IiwidHlwZUlkIjoiZDMxMjI4ZjQtYTVmZi00NWU3LWJjMzYtNGFiZWJjMjNiOWVlIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MjQzNTE1NDEsImV4cCI6NDg4MDExMTU0MX0.J2427p58l5mz3A8suPDzVwD61Atv31_l4VcS_s-MRxY'; // Keep this key safe
const MORALIS_API_URL = 'https://deep-index.moralis.io/api/v2.2';

export const fetchTokenBalances = async (walletAddress: string, chainString: string) => {
  try {
    const response = await axios.get(
      `${MORALIS_API_URL}/${walletAddress}/erc20?chain=${chainString}`,
      {
        headers: {
          'accept': 'application/json',
          'X-API-Key': MORALIS_API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return [];
  }
};
