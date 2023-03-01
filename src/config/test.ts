import contracts from '../contracts/contracts.json'

export const isTest = false;

export const apiName = isTest ? 'testwebhooks' :'webhooks';

export const contractAddy = isTest ? contracts.KingFlokiNFTs.testnet_address : contracts.KingFlokiNFTs.mainnet_address;