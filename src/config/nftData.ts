import axios from "axios";
import { getTokenIdsfromMoralis } from "src/contracts/getNFT";
// import { MintCardGif } from "./image";

export const getNftData = async () => {
    const tokenIds = await getTokenIdsfromMoralis();
    const nftData = [];
    for (let i = 0; i < tokenIds.length; i++) {
        const tokenId: number = parseInt(tokenIds[i]);
        const response_info = await axios.get(
            `https://testwebhooks.kingfinance.co/tokenInfo?tokenId=${tokenId}`,
            {
                headers: {
                    "Content-Type": 'application/json'
                }
            }
        )

        const response_image = `https://testwebhooks.kingfinance.co/tokenImage?tokenId=${tokenId}`

        const nft = {
          id: i,
          token_id: tokenId,
          image: response_image,
          primary: response_info.data.name,
          secondary: response_info.data.category,
          rarity: response_info.data.rarity,
          isSelected: false
        }

        nftData.push(nft);
    }

    return nftData;
}

// export const NFTData = [
//   {
//     id: 0,
//     image: MintCardGif,
//     primary: "Fomo Mask",
//     secondary: "Common", 
//     isSelected: false
//   },
//   {
//     id: 1,
//     image: MintCardGif,
//     primary: "Fomo Mask",
//     secondary: "Common", 
//     isSelected: false
//   },
//     {
//     id: 2,
//     image: MintCardGif,
//     primary: "Fomo Mask",
//     secondary: "Common", 
//     isSelected: false
//   },
//     {
//     id: 3,
//     image: MintCardGif,
//     primary: "Fomo Mask",
//     secondary: "Common", 
//     isSelected: false
//   },
//     {
//     id: 4,
//     image: MintCardGif,
//     primary: "Fomo Mask",
//     secondary: "Common", 
//     isSelected: false
//   },
//     {
//     id: 5,
//     image: MintCardGif,
//     primary: "Fomo Mask",
//     secondary: "Common", 
//     isSelected: false
//   },
//     {
//     id: 6,
//     image: MintCardGif,
//     primary: "Fomo Mask",
//     secondary: "Common", 
//     isSelected: false
//   },
//     {
//     id: 7,
//     image: MintCardGif,
//     primary: "Fomo Mask",
//     secondary: "Common", 
//     isSelected: false
//   },
//     {
//     id: 8,
//     image: MintCardGif,
//     primary: "Fomo Mask",
//     secondary: "Common", 
//     isSelected: false
//   },
//     {
//     id: 9,
//     image: MintCardGif,
//     primary: "Fomo Mask",
//     secondary: "Common", 
//     isSelected: false
//   },
//     {
//     id: 10,
//     image: MintCardGif,
//     primary: "Fomo Mask",
//     secondary: "Common", 
//     isSelected: false
//   },
//     {
//     id: 11,
//     image: MintCardGif,
//     primary: "Fomo Mask",
//     secondary: "Common", 
//     isSelected: false
//   }
// ];