/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import { RxTriangleRight } from 'react-icons/rx';
import styled, { keyframes } from 'styled-components';
import { useAccount } from 'wagmi';
import { WalletConnectButton } from 'src/components/Button';
import { Spinner } from 'src/components/Spinner';
import { EthereumSvg, EvolveBg, PotionImg } from 'src/config/image';
import { getConsumableData, buyConsumable, getConsumablePrice, getPotionCount, isAbleToEvolve } from 'src/contracts';
import { toast } from 'react-toastify';
import { consumablePriceProps, getConsumable } from './EvolveNfts';
import { potionProps } from '.';
import { useWeb3Store } from 'src/context/web3context';

export interface consumableTypes {
  token_id: number;
  name: string;
  description: string;
  requirements: {
    common: number;
    rare: number;
    epic: number;
  };
}

interface canEvolveTypes {
  isAble: boolean;
  message: string;
}

export const EvolveMint = (props: potionProps) => {
  const { potionCount, setPotionCount } = props;
  const [quantity, setQuantity] = useState(1);
  const [freebies, setFreebies] = useState(0);
  const [isLoad, setLoad] = useState(false);
  const [price, setPrice] = useState('0.005');
  const [consumableData, setConsumableData] = useState<consumableTypes>();
  const [consumablePrice, setConsumablePrice] = useState<consumablePriceProps>();
  const [canEvolve, setCanEvolve] = useState<canEvolveTypes>();
  const { isConnected, address } = useAccount();
  const { isInitialized } = useWeb3Store();

  const handleClick = (symbol: string) => {
    let num = quantity;
    if (symbol === 'minus') {
      num--;
      if (quantity > 1) setQuantity(num);
    } else {
      if (freebies !== 0) {
        if (quantity < freebies) {
          num++;
        }
      } else {
        num++;
      }
      setQuantity(num);
    }
  };

  useEffect(() => {
    (async () => {
      const res = await getConsumableData();
      const consumablePrice_ = await getConsumablePrice(res.token_id);
      setConsumablePrice(consumablePrice_);
      console.log({ res });
      setConsumableData(res);
    })();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      (async () => {
        const result = await isAbleToEvolve(address);
        setCanEvolve(result);
      })();
    }
  }, [isInitialized]);

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
        // toast.success("Congratulations, you have claimed your Kingpass");
        toast.success(successMsg);
        setLoad(false);
      })
      .catch((err) => {
        console.log({ err });
        // toast.error(`you need to wait at least 24 hours to withdraw your $KING`, err);
        const revertData = err.reason;
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        toast.error(`Transaction failed: ${revertData}`);
        // errMsg !== "" ? toast.error(errMsg, err) :
        setLoad(false);
      });
  };

  const handleMint = async () => {
    // if (canEvolve?.isAble === false) {
    //   toast.error(canEvolve.message);
    // } else {
    const tokenId = consumableData?.token_id;
    if (tokenId !== undefined) {
      const priceEth = consumablePrice?.priceInEth;
      handleContractFunction(
        async () =>
          await buyConsumable(address, tokenId, quantity, priceEth).then(() => {
            const potionCnt = potionCount + quantity;
            setPotionCount(potionCnt);
          }),
        `${quantity} Potions bought!`
      );
    }
    // }
  };

  return (
    <>
      <EvolveBackground src={EvolveBg} alt="evolve-bg" />
      <EvolveWrapper>
        <EvolveMintContainer>
          <Potion src={PotionImg} alt="potion-img" />
          <MintContainer>
            <MintPotion>
              <MintPotionContainer>
                <MintPotionTitle>Mint Your Potion</MintPotionTitle>
                <MintPotionAction>
                  <MintInputBox>
                    <OperationBtn onClick={() => handleClick('minus')}>-</OperationBtn>
                    <MintInput
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                    <OperationBtn onClick={() => handleClick('plus')}>+</OperationBtn>
                  </MintInputBox>
                  {/* <MintButton>{isLoad ? <Spinner /> : "Mint Now"}</MintButton> */}
                  <MintButtonBox>
                    {/* {hasPending && (
                      <MintButton
                        disabled={isLoad}
                        onClick={() => {
                          handleContractFunction(async () => await _getNftsFromApi());
                          console.log('_getNftsFromApi');
                        }}
                      >
                        {isLoad ? <Spinner /> : 'Get Pending NFTs'}
                      </MintButton>
                    )} */}
                    {isConnected ? (
                      <MintButton disabled={isLoad} onClick={async () => await handleMint()}>
                        {isLoad ? <Spinner /> : 'Mint Now'}
                      </MintButton>
                    ) : (
                      <WalletConnectButton />
                    )}
                  </MintButtonBox>
                </MintPotionAction>
                <MintPotionFooter>
                  <EtherValueContainer>
                    <Label>
                      <EtherIcon src={EthereumSvg} alt="ethereum-icon" />
                      Price
                    </Label>
                    <EtherValue>{isConnected ? (price === '0' ? '-' : price) : '-'} ETH</EtherValue>
                  </EtherValueContainer>
                  <EtherValueContainer>
                    <Label>
                      <EtherIcon src={EthereumSvg} alt="ethereum-icon" />
                      Total
                    </Label>
                    <EtherValue>
                      {isConnected ? (price === '0' ? '-' : (parseFloat(price) * quantity).toFixed(3)) : '-'} ETH
                    </EtherValue>
                  </EtherValueContainer>
                  <FreebiesContainer>
                    <FreebiesLabel>Freebies</FreebiesLabel>
                    <FreebiesValue>{freebies}</FreebiesValue>
                  </FreebiesContainer>
                </MintPotionFooter>
              </MintPotionContainer>
            </MintPotion>
            <EvolveNFTs>
              <EvolveNFTsContainer>
                <EvolveTitle>Evolve your NFTs</EvolveTitle>
                <EvolveTable>
                  <EvolveTr>
                    <PrimaryLabel>{consumableData?.requirements?.common ?? 0} Commons</PrimaryLabel>
                    <StyledRightArrow>
                      <RxTriangleRight style={{ width: '100%', height: 'auto' }} />
                    </StyledRightArrow>
                    <SecondaryLabel>1 Rare</SecondaryLabel>
                  </EvolveTr>
                  <SecondaryLine />
                  <EvolveTr>
                    <PrimaryLabel>{consumableData?.requirements?.rare ?? 0} Rares</PrimaryLabel>
                    <StyledRightArrow>
                      <RxTriangleRight style={{ width: '100%', height: 'auto' }} />
                    </StyledRightArrow>
                    <SecondaryLabel>1 Epic</SecondaryLabel>
                  </EvolveTr>
                  <SecondaryLine />
                  <EvolveTr>
                    <PrimaryLabel>{consumableData?.requirements?.epic ?? 0} Epics</PrimaryLabel>
                    <StyledRightArrow>
                      <RxTriangleRight style={{ width: '100%', height: 'auto' }} />
                    </StyledRightArrow>
                    <SecondaryLabel>1 Legendary</SecondaryLabel>
                  </EvolveTr>
                </EvolveTable>
              </EvolveNFTsContainer>
            </EvolveNFTs>
          </MintContainer>
        </EvolveMintContainer>
      </EvolveWrapper>
    </>
  );
};

const EvolveWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;
  padding-top: 25px;
`;

const EvolveBackground = styled.img`
  height: 381px;
  width: 100%;
  object-fit: cover;
  position: absolute;
  z-index: 0;
`;

const EvolveMintContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 45px;
  @media screen and (max-width: 960px) {
    flex-direction: column;
  }
  @media screen and (max-width: 480px) {
    gap: 20px;
  }
`;
const floaty = keyframes`
    0% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-15px);
    }
    100% {
        transform: translateY(0);
    }
`;

const Potion = styled.img`
  width: 422px;
  height: auto;
  animation: ${floaty} 1.5s infinite;
  @media screen and (max-width: 960px) {
    width: 320px;
  }

  @media screen and (max-width: 480px) {
    width: 230px;
  }
`;

const MintContainer = styled.div`
  width: 470px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  z-index: 1;
  @media screen and (max-width: 960px) {
    width: 380px;
  }
  @media screen and (max-width: 480px) {
    width: 340px;
  }
  @media screen and (max-width: 390px) {
    width: 290px;
  }
`;

const MintPotion = styled.div`
  width: 100%;
  background: #2b0707 0% 0% no-repeat padding-box;
`;

const MintPotionContainer = styled.div`
  padding: 30px 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MintPotionTitle = styled.div`
  font-size: 26px;
  text-transform: uppercase;
  font-family: 'gotham-bold';
  @media screen and (max-width: 960px) {
    font-size: 22px;
  }
  @media screen and (max-width: 480px) {
    font-size: 16px;
  }
`;

const MintPotionAction = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 21px;
  width: 100%;
`;

const MintInputBox = styled.div`
  display: flex;
  height: 60px;
  @media screen and (max-width: 960px) {
    height: 42px;
  }
  @media screen and (max-width: 480px) {
    height: 32px;
  }
`;

const OperationBtn = styled.div`
  min-width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f48e37;
  cursor: pointer;
  font-size: 21px;
  font-family: 'gotham-bold';
  user-select: none;
  @media screen and (max-width: 960px) {
    min-width: 42px;
  }
  @media screen and (max-width: 480px) {
    min-width: 32px;
  }
`;

const MintInput = styled.input`
  outline: none;
  border: none;
  margin: 0;
  padding: 0;
  background-color: #ffffff;
  width: 100%;
  height: 100%;
  color: #2b0707;
  font-family: 'gotham-bold';
  font-size: 20px;
  text-align: center;
  @media screen and (max-width: 960px) {
    font-size: 15px;
  }
  @media screen and (max-width: 480px) {
    font-size: 11px;
  }
`;

const MintButton = styled.button`
  background: #f48e37 0% 0% no-repeat padding-box;
  height: 56px;
  border: none;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-size: 14px;
  font-family: 'gotham-bold';
  color: #ffffff;
  cursor: pointer;
  user-select: none;
  @media screen and (max-width: 960px) {
    height: 42px;
    font-size: 14px;
  }
  @media screen and (max-width: 480px) {
    height: 32px;
    font-size: 12px;
  }
`;

const MintButtonBox = styled.div`
  display: flex;
  gap: 8px;
  @media screen and (max-width: 960px) {
    flex-direction: column;
  }
`;

const MintPotionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  width: 100%;
`;

const EtherValueContainer = styled.div`
  display: flex;
  gap: 3px;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

const EtherIcon = styled.img`
  width: 24px;
  height: auto;
  @media screen and (max-width: 960px) {
    width: 20px;
  }
`;
const EtherValue = styled.div`
  font-size: 15px;
  text-align: center;
  color: #f2f5f4;
  @media screen and (max-width: 960px) {
    font-size: 12px;
  }
`;

const Label = styled.div`
  font-size: 13px;
  color: #ff7b03;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 3px;
  @media screen and (max-width: 960px) {
    font-size: 10px;
  }
`;

const FreebiesValue = styled.div`
  color: #f2f5f4;
  font-size: 15px;
  font-family: 'gotham-bold';
  @media screen and (max-width: 960px) {
    font-size: 12px;
  }
`;

const EvolveNFTs = styled.div`
  width: 100%;
  background: #2b0707 0% 0% no-repeat padding-box;
`;

const EvolveNFTsContainer = styled.div`
  padding: 30px 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media screen and (max-width: 960px) {
    padding: 30px 50px;
  }
  @media screen and (max-width: 480px) {
    padding: 30px;
  }
`;

const EvolveTitle = styled.div`
  font-size: 35px;
  font-family: 'gotham-bold';
  @media screen and (max-width: 960px) {
    font-size: 25px;
  }
  @media screen and (max-width: 480px) {
    font-size: 16px;
  }
`;

const EvolveTable = styled.div`
  border: 1px solid #f38e37;
  margin-top: 34px;
  width: 100%;
  @media screen and (max-width: 480px) {
    margin-top: 26px;
  }
`;

const EvolveTr = styled.div`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 30px;
  @media screen and (max-width: 960px) {
    gap: 20px;
  }
  @media screen and (max-width: 390px) {
    gap: 10px;
  }
`;

const PrimaryLabel = styled.div`
  font-size: 14px;
  width: 100px;
  font-family: 'gotham-bold';
  text-transform: uppercase;
  white-space: nowrap;
  @media screen and (max-width: 960px) {
    font-size: 12px;
    width: 90px;
  }
  @media screen and (max-width: 390px) {
    font-size: 10px;
    width: 72px;
  }
`;

const SecondaryLabel = styled.div`
  font-size: 14px;
  font-family: 'gotham-bold';
  color: #f48e37;
  text-transform: uppercase;
  white-space: nowrap;
  @media screen and (max-width: 960px) {
    font-size: 12px;
  }
  @media screen and (max-width: 390px) {
    font-size: 10px;
  }
`;

const SecondaryLine = styled.div`
  background-color: #f48e37;
  height: 1px;
  width: 100%;
`;

const StyledRightArrow = styled.div`
  width: 20px;
  height: 16px;
`;

const FreebiesContainer = styled.div`
  display: flex;
  gap: 6px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FreebiesLabel = EtherValue;
