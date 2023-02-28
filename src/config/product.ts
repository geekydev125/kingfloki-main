import contracts from '../contracts/contracts.json'

export const isProduction = false;

export const apiName = isProduction ? 'webhooks' : 'testwebhooks'

export const contractAddy = isProduction ? contracts.KingFlokiNFTs.mainnet_address : contracts.KingFlokiNFTs.testnet_address;