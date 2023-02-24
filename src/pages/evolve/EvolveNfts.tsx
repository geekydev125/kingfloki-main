/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import RadioButton from 'src/components/Radio';
import styled from 'styled-components';
import { ConnectWarningSvg, NoNFTSvg, MintCardGif } from 'src/config/image';
import { useAccount, useNetwork } from 'wagmi';
import { PotionNFT } from 'src/components/NFT/PotionNFT';
import { getNftData } from 'src/config/nftData';
import { GettingNftLoader } from 'src/components/Loader/gettingNftLoader';
import {
  getConsumableData,
  getConsumableValue,
  getNftsFromApi,
  getPotionCount,
  isAbleToEvolve,
  useConsumable
} from 'src/contracts';
import { canEvolveTypes, consumableTypes } from './EvolveMint';
import { toast } from 'react-toastify';
import { MiniSpinner } from 'src/components/Spinner';
import { potionProps } from '.';
import { useWeb3Store } from 'src/context/web3context';
import { EvolveLoader } from 'src/components/Loader/evolveLoader';
import { ethers } from 'ethers';

interface nftDataProps {
  id: number;
  token_id: number;
  image: string;
  primary: string;
  secondary: string;
  rarity: string;
  isSelected: boolean;
}

export interface consumablePriceProps {
  isConsumable: boolean;
  priceInEth: number;
  priceInKing: number;
  usageId: number;
}

export interface getConsumableProps {
  setConsumablePrice: (value: consumablePriceProps | undefined) => void;
  setConsumableData: (value: consumableTypes) => void;
  setPotionCount: (value: number) => void;
  setPrice: (value: string) => void;
  address: string | undefined;
}

export const getConsumable = async (props: getConsumableProps) => {
  const { setConsumablePrice, setConsumableData, setPotionCount, setPrice, address } = props;
  const res = await getConsumableData();
  const consumablePrice_ = await getConsumableValue(res.token_id);
  console.log({ consumablePrice_ });
  const potionCnt = await getPotionCount(address, res.token_id);
  setConsumablePrice(consumablePrice_);
  setConsumableData(res);
  setPotionCount(potionCnt);
  const priceInEth_ = consumablePrice_?.priceInEth.toString() ?? '0';
  const priceInEth = parseFloat(ethers.utils.formatEther(priceInEth_)).toFixed(3);
  setPrice(priceInEth);
};

export const EvolveNFTs = (props: potionProps) => {
  const { potionCount, setPotionCount } = props;
  const [evolve, setEvolve] = useState('Common');
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const chainId = chain?.id;
  const [nftArr, setNftArr] = useState<nftDataProps[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [isLoadingNft, setLoadingNft] = useState(false);
  const [consumableData, setConsumableData] = useState<consumableTypes>();
  const [consumablePrice, setConsumablePrice] = useState<consumablePriceProps>();
  const [commonCnt, setCommonCnt] = useState(0);
  const [rareCnt, setRareCnt] = useState(0);
  const [epicCnt, setEpicCnt] = useState(0);
  const [isLoad, setLoad] = useState(false);
  const [mintStatus, setMintStatus] = useState(0);
  const [canEvolve, setCanEvolve] = useState<canEvolveTypes>();
  const [price, setPrice] = useState('0');
  const { isInitialized } = useWeb3Store();

  const commonTotalCount = consumableData?.requirements.common ?? 0;
  const rareTotalCount = consumableData?.requirements.rare ?? 0;
  const epicTotalCount = consumableData?.requirements.epic ?? 0;

  const isEvolveButtonEnable =
    (evolve === 'Common' && selectedCount === commonTotalCount) ||
    (evolve === 'Rare' && selectedCount === rareTotalCount) ||
    (evolve === 'Epic' && selectedCount === epicTotalCount && consumableData !== undefined);

  const rarityTotalCount = evolve === 'Common' ? commonTotalCount : evolve === 'Rare' ? rareTotalCount : epicTotalCount;

  const getNft = async () => {
    let _commontCnt = 0;
    let _rareCnt = 0;
    let _epicCnt = 0;
    const nftData = await getNftData(address, chainId);
    for (let i = 0; i < nftData.length; i++) {
      if (nftData[i].rarity === 'Common') _commontCnt++;
      if (nftData[i].rarity === 'Rare') _rareCnt++;
      if (nftData[i].rarity === 'Epic') _epicCnt++;
    }
    setNftArr(nftData);
    setCommonCnt(_commontCnt);
    setRareCnt(_rareCnt);
    setEpicCnt(_epicCnt);
  };

  const evolveNftInitialize = async () => {
    setLoadingNft(true);
    await getNft();
    const props = {
      setConsumablePrice,
      setConsumableData,
      setPotionCount,
      setPrice,
      address
    };
    await getConsumable(props);
    setLoadingNft(false);
  };

  const checkIsAbleToEvolve = async () => {
    const res = await isAbleToEvolve(address);
    setCanEvolve(res);
    setTimeout(async () => await checkIsAbleToEvolve(), 60000);
  };

  useEffect(() => {
    if (isInitialized) {
      evolveNftInitialize();
      checkIsAbleToEvolve();
    } else {
      setNftArr([]);
      setCommonCnt(0);
      setRareCnt(0);
      setEpicCnt(0);
      setPotionCount(0);
    }
  }, [isInitialized]);

  useEffect(() => {
    let cnt = 0;
    for (let i = 0; i < nftArr.length; i++) {
      if (nftArr[i].isSelected) {
        cnt++;
      }
    }
    setSelectedCount(cnt);
  }, [nftArr]);

  useEffect(() => {
    const tempArr = [...nftArr];
    for (let i = 0; i < tempArr.length; i++) {
      tempArr[i].isSelected = false;
    }
    setNftArr(tempArr);
  }, [evolve]);

  const handleContractFunction = (func: () => Promise<void>, successMsg: string) => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
    const promise = new Promise(async function (resolve, reject) {
      try {
        setLoad(true);
        await func();
        resolve('');
      } catch (err) {
        reject(err);
      }
    });
    promise
      .then((result) => {
        console.log({ result });
        toast.success(successMsg);
        setLoad(false);
      })
      .catch((err) => {
        console.log({ err });
        handleStatus(0);
        const revertData = err.reason || err.message;
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        toast.error(`Transaction failed: ${revertData}`);
        // errMsg !== "" ? toast.error(errMsg, err) :
        setLoad(false);
      });
  };

  const handleChange = (inputValue: string) => {
    setEvolve(inputValue);
  };

  const handleStatus = async (value: number) => {
    setMintStatus(value);
    console.log(value);
  };

  const handleNFTData = (id: number) => {
    const newSelected = [...nftArr];
    newSelected[id].isSelected = !newSelected[id].isSelected;
    setNftArr(newSelected);
  };

  const handleEvolve = async () => {
    if (canEvolve?.isAble === false) {
      toast.error(canEvolve.message);
    } else {
      const tokenIds: number[] = [];
      const quantities: number[] = [];
      let lastTokenId;
      let quantity = 1;
      for (let i = 0; i < nftArr.length; i++) {
        if (nftArr[i].isSelected) {
          const tokenId: number = nftArr[i].token_id;
          if (lastTokenId === tokenId) {
            console.log('+++++++');
            quantity++;
            quantities[quantities.length - 1] = quantity;
          } else {
            quantity = 1;
            tokenIds.push(tokenId);
            quantities.push(quantity);
          }
          lastTokenId = nftArr[i].token_id;
          console.log({ quantity });
        }
      }
      console.log({ tokenIds, quantities });
      const usageId = consumablePrice?.usageId;
      const tokenId = consumableData?.token_id;
      if (usageId !== undefined && tokenId !== undefined) {
        console.log({ tokenId, usageId, tokenIds, quantities });
        handleStatus(1);
        handleContractFunction(
          async () =>
            await useConsumable(tokenId, usageId, tokenIds, quantities, handleStatus).then(async () => {
              setTimeout(async () => {
                handleStatus(3);
                await getNftsFromApi(handleStatus).then(async () => {
                  setLoadingNft(true);
                  await evolveNftInitialize();
                });
              }, 4000);
            }),
          'Evolution completed!'
        );
      }
    }
  };

  return (
    <EvolveNFTsContainer>
      <EvolveNavBar>
        <MobilePotionLabel label="Your Potions" value={potionCount} />
        <EvolveNavBarContainer>
          <RadioController>
            <RadioButton
              name="radio"
              label="Commons"
              value="Common"
              numericValue={commonCnt}
              checked={evolve === 'Common'}
              handleChange={handleChange}
            />
            <RadioButton
              name="radio"
              label="Rares"
              value="Rare"
              numericValue={rareCnt}
              checked={evolve === 'Rare'}
              handleChange={handleChange}
            />
            <RadioButton
              name="radio"
              label="Epics"
              value="Epic"
              numericValue={epicCnt}
              checked={evolve === 'Epic'}
              handleChange={handleChange}
            />
          </RadioController>
          <RadioProvider>
            <PotionLabel label="Your Potions" value={potionCount} />
            <SelectLabel label="Selected" value={`${selectedCount}/${rarityTotalCount}`} />

            <EvolveButton
              disabled={!isEvolveButtonEnable || isLoad || parseInt(price) >= 1000}
              onClick={async () => await handleEvolve()}
            >
              {isLoad ? <MiniSpinner /> : 'Evolve'}
            </EvolveButton>
          </RadioProvider>
        </EvolveNavBarContainer>
      </EvolveNavBar>
      <EvolveContent>
        {isLoadingNft ? (
          <GettingNftLoader />
        ) : (
          <>
            {/* {!isConnected ? (
            <Warning emoticon={ConnectWarningSvg} alert="CONNECT YOUR WALLET TO START EVOLVING YOUR WEARABLES" />
          ) : (
            <Warning emoticon={NoNFTSvg} alert="SORRY!! YOU DON’T HAVE WEARABLES TO EVOLVE" />
          )} */}
            <NFTItemList>
              {nftArr
                .filter((item) => item.rarity === evolve)
                .map((item) => (
                  <div key={item.id} onClick={() => handleNFTData(item.id)}>
                    <PotionNFT
                      image={item.image}
                      primary={item.primary}
                      secondary={item.secondary}
                      isSelected={item.isSelected}
                    />
                  </div>
                ))}
            </NFTItemList>
          </>
        )}
      </EvolveContent>
      <EvolveLoader value={mintStatus} setValue={setMintStatus} />
    </EvolveNFTsContainer>
  );
};

const EvolveNFTsContainer = styled.div`
  width: 1042px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0 136px 0;
  @media screen and (max-width: 1096px) {
    width: auto;
  }

  @media screen and (max-width: 640px) {
    padding: 60px 0;
  }
`;

const EvolveNavBar = styled.div`
  width: 100%;
  height: 65px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media screen and (max-width: 1096px) {
    width: 640px;
  }
  @media screen and (max-width: 768px) {
    width: 450px;
  }
  @media screen and (max-width: 480px) {
    width: 370px;
    padding-top: 30px;
  }
  @media screen and (max-width: 480px) {
    width: 290px;
  }
`;

const EvolveNavBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  width: 100%;
  @media screen and (max-width: 1096px) {
    flex-direction: column-reverse;
    gap: 6px;
  }
`;

const RadioController = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 30px;
  width: 100%;
  background-color: #2b0707;
  height: 65px;
  @media screen and (max-width: 1096px) {
    justify-content: space-around;
  }
  @media screen and (max-width: 480px) {
    gap: 0px;
  }
`;

const RadioProvider = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  width: 100%;
  background-color: #2b0707;
  height: 65px;
  @media screen and (max-width: 1096px) {
    justify-content: space-around;
    gap: 0;
  }
`;

interface ProviderLabelProps {
  label: string;
  value: string | number;
}

const PotionLabel = (props: ProviderLabelProps) => {
  const { label, value } = props;
  return (
    <ProviderLabelContainer>
      <ProviderLine />
      <Label>{label}</Label>
      <ProviderValue>{value}</ProviderValue>
    </ProviderLabelContainer>
  );
};

const SelectLabel = (props: ProviderLabelProps) => {
  const { label, value } = props;
  return (
    <SelectLabelContainer>
      <ProviderLine />
      <Label>{label}</Label>
      <SelectValue>{value}</SelectValue>
    </SelectLabelContainer>
  );
};

const MobilePotionLabel = (props: ProviderLabelProps) => {
  const { label, value } = props;
  return (
    <MobilePotionLabelContainer>
      <ProviderLine />
      <Label>{label}</Label>
      <ProviderValue>{value}</ProviderValue>
    </MobilePotionLabelContainer>
  );
};

const ProviderLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 17px;
  height: 100%;
  @media screen and (max-width: 480px) {
    display: none;
  }
`;

const SelectLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 17px;
  height: 100%;
  @media screen and (max-width: 768px) {
    gap: 17px;
  }
`;

const ProviderLine = styled.div`
  width: 5px;
  height: 45px;
  background-color: #430202;
  @media screen and (max-width: 1096px) {
    display: none;
  }
`;

const Label = styled.div`
  font-size: 14px;
  font-family: 'gotham-bold';
  color: #f48e37;
  text-transform: uppercase;
  @media screen and (max-width: 768px) {
    font-size: 12px;
  }
`;

const ProviderValue = styled.div`
  font-size: 22px;
  font-family: 'gotham-bold';
  @media screen and (max-width: 768px) {
    font-size: 18px;
  }
`;

interface EvolveButtonProps {
  disabled?: boolean;
}

const EvolveButton = styled.button<EvolveButtonProps>`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-family: 'gotham-bold';
  text-transform: uppercase;
  background-color: #f48e37;
  width: 113px;
  height: 42px;
  border: none;
  color: #000000;
  opacity: ${(props) => (props.disabled ?? false ? 0.5 : 1)};
`;

const SelectValue = styled.div`
  font-size: 14px;
  font-family: 'gotham-bold';
  @media screen and (max-width: 768px) {
    font-size: 12px;
  }
`;

const EvolveContent = styled.div``;

interface WarningProps {
  emoticon: any;
  alert: string;
}

const Warning = (props: WarningProps) => {
  const { emoticon, alert } = props;
  return (
    <>
      <NoWalletEvolve>
        <EmoticonSvg src={emoticon} alt="emoticon" />
        <WarningAlert>{alert}</WarningAlert>
      </NoWalletEvolve>
    </>
  );
};

const NoWalletEvolve = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  min-height: 340px;
  gap: 22px;
`;

const EmoticonSvg = styled.img`
  width: 40px;
  height: auto;
`;

const WarningAlert = styled.div`
  text-transform: uppercase;
  font-size: 18px;
  font-family: 'gotham-bold';
  text-align: center;
  width: 463px;
  line-height: 30px;
  @media screen and (max-width: 1096px) {
    width: 390px;
  }

  @media screen and (max-width: 480px) {
    width: 250px;
  }
`;

const MobilePotionLabelContainer = styled.div`
  display: none;
  @media screen and (max-width: 480px) {
    display: flex;
    align-items: center;
    gap: 17px;
  }
`;

const NFTItemList = styled.div`
  padding-top: 30px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  @media screen and (max-width: 1096px) {
    padding-top: 80px;
    grid-template-columns: repeat(3, 1fr);
  }

  @media screen and (max-width: 840px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
