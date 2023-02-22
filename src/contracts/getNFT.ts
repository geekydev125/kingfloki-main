/* eslint-disable no-console */
import axios from 'axios'

export const getTokenIdsfromMoralis = async (address: string | undefined) => {
    const response = await axios.get(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `https://deep-index.moralis.io/api/v2/${address}/nft?chain=eth&format=decimal&disable_total=true&token_addresses=0xbe0de82207db8d49f841f3c9253fb6233ac2d821&normalizeMetadata=false`,
        {
            headers: {
                "X-API-Key": "MzNTP6Va9rSfQqVeHP3xlRHyOk7ArxfIkA1WLxE6bWwGHi5UBQiDt8qySKqiFIEP",
                "Content-Type": 'application/json'
            }
        }
    )

    const tokenIds = [];
    const nftCount = response.data.result.length;
    if(nftCount > 0) {
        for(let i = 0; i < nftCount; i++) {
            const tokenId = parseInt(response.data.result[i].token_id);
            tokenIds.push(tokenId);
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