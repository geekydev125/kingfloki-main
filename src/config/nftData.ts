import axios from "axios";
import { getTokenIdsfromMoralis } from "src/contracts/getNFT";
import { apiName } from "./test";

export const getNftData = async (address: string | undefined, chain: number | undefined) => {
    const tokenIds = await getTokenIdsfromMoralis(address, chain);
    const nftData = [];
        const response_info = await axios.post(
            `https://${apiName}.kingfinance.co/bulkTokenInfo`,
            tokenIds,
            {
                headers: {
                    "Content-Type": 'application/json'
                }
            }
        )

        const res = response_info.data.tokenInfo;

        for(let i = 0; i < res.length; i++) {
          const tokenId = tokenIds[i];
          const response_image = `https://${apiName}.kingfinance.co/tokenImage?tokenId=${tokenId}`
          const nft = {
            id: i,
            token_id: tokenId,
            image: response_image,
            primary: res[i].name,
            secondary: res[i].category,
            rarity: res[i].rarity,
            isSelected: false
          }

          nftData.push(nft);
        }

    return nftData;
}