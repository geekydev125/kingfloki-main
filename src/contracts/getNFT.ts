/* eslint-disable no-console */
import axios from 'axios'
import contracts from './contracts.json'

export const getTokenIdsfromMoralis = async (address: string | undefined, chain: number | undefined) => {
    const chain_ = chain === 80001 ? "mumbai" : "eth";
    const response = await axios.get(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `https://deep-index.moralis.io/api/v2/${address}/nft?chain=${chain_}&format=decimal&disable_total=true&token_addresses=${contracts.KingFlokiNFTs.address}&normalizeMetadata=false`,
        {
            headers: {
                "X-API-Key": "MzNTP6Va9rSfQqVeHP3xlRHyOk7ArxfIkA1WLxE6bWwGHi5UBQiDt8qySKqiFIEP",
                "Content-Type": 'application/json'
            }
        }
    )

    const tokenIds = [];
    const nftCount = response.data.result.length;
    console.log(response.data.result)
    if(nftCount > 0) {
        for(let i = 0; i < nftCount; i++) {
            const amount = parseInt(response.data.result[i].amount);
            for(let j = 0; j < amount; j++) {
                const tokenId = parseInt(response.data.result[i].token_id);
                tokenIds.push(tokenId);
            }
        }
    }
    return tokenIds;
}

// export const getNFTDatafromWebhook = async () => {
//     const tokenIds = await getTokenIdsfromMoralis();
//     const nftData = [];
//     for (let i = 0; i < tokenIds.length; i++) {
//         const tokenId: number = parseInt(tokenIds[i]);
//         const response = await axios.get(
//             `https://testwebhooks.kingfinance.co/tokenInfo?tokenId=${tokenId}`,
//             {
//                 headers: {
//                     "Content-Type": 'application/json'
//                 }
//             }
//         )
//         nftData.push(response.data);
//     }
//     return nftData;
// }