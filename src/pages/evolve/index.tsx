import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { EvolveMint } from './EvolveMint';
import { EvolveNFTs } from './EvolveNfts';

export interface potionProps {
  potionCount: number;
  setPotionCount: (value: number) => void;
}

export const Evolve = () => {
  const [potionCount, setPotionCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Evolve: ', potionCount);
  }, [potionCount]);

  return (
    <EvolveContainer>
      <EvolveMint potionCount={potionCount} setPotionCount={setPotionCount} />
      <EvolveNFTs potionCount={potionCount} setPotionCount={setPotionCount} />
    </EvolveContainer>
  );
};

const EvolveContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background-color: #430202;
  position: relative;
`;
