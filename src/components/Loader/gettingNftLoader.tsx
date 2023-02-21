import { PulseLoader } from 'react-spinners';
import { LoaderVideo, EbmLoaderVideo } from 'src/config/image';
import styled from 'styled-components';

export const GettingNftLoader = () => {
  return (
    <LoaderContainer>
      <LoaderWrapper>
        <LoaderGif playsInline loop autoPlay muted id="my-video-desktop">
          <source src={LoaderVideo} type='video/mp4; codecs="hvc1"' id="background-video-source-desktop" />
          <source src={EbmLoaderVideo} type="video/webm"></source>
          Your browser does not support the video tag.
        </LoaderGif>
        <StaticLoader>
          <Label>Fetching your nft</Label>
          <PulseLoader size={6} margin={5} color={'#f48e37'} speedMultiplier={0.5} />
        </StaticLoader>
      </LoaderWrapper>
    </LoaderContainer>
  );
};

const LoaderContainer = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoaderWrapper = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-end;
  @media screen and (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
  @media screen and (max-width: 480px) {
    align-items: center;
  }
`;

const LoaderGif = styled.video`
  width: 260px;
  height: 200px;
  padding-top: 37.5px;
  @media screen and (max-width: 480px) {
    width: 180px;
    height: 140px;
  }
`;

const StaticLoader = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 25px;
  @media screen and (max-width: 768px) {
    margin-bottom: 0px;
  }
`;

const Label = styled.div`
  font-size: 25px;
  font-family: 'gotham-bold';
  color: #f48e37;
  @media screen and (max-width: 480px) {
    font-size: 18px;
  }
`;
