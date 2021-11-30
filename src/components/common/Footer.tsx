import styled from 'styled-components'

import Link from 'next/link'
import {
  ActiveButton,
  ContainerPadding,
} from '@/src/components/pureStyledComponents/common/Helpers'

const Wrapper = styled.footer`
  background-color: #000;
  padding-bottom: 100px;
  padding-top: 60px;

  ${ContainerPadding}

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletLandscapeStart}) {
    padding-bottom: 60px;
  }
`

const SocialGrid = styled.div`
  column-gap: 20px;
  display: grid;
  grid-template-columns: 1fr;
  margin: 0 auto 55px;
  max-width: 100%;
  row-gap: 50px;
  width: ${({ theme }) => theme.layout.maxWidth};

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const SocialTitle = styled.h4`
  color: ${({ theme }) => theme.colors.color_1};
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 20px;
  text-align: center;
`

const SocialButtons = styled.div`
  display: flex;
  gap: 40px;
  justify-content: center;
`

const SocialButton = styled.a`
  --dimensions: 32px;

  align-items: center;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  cursor: pointer;
  display: flex;
  height: var(--dimensions);
  justify-content: center;
  text-decoration: none;
  user-select: none;
  width: var(--dimensions);

  ${ActiveButton}

  &:hover {
    .fill {
      fill: ${({ theme }) => theme.colors.color_2};
      transition: fill 0.15s linear;
    }
  }
`

const Menu = styled.nav`
  align-items: center;
  display: flex;
  justify-content: center;
  list-style: none;
  margin: 0 auto 30px;
  padding: 0;
`

const Item = styled.span`
  color: ${({ theme }) => theme.colors.textColor};
  cursor: pointer;
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 20px 0 0;
  text-decoration: none;
  text-transform: uppercase;
  user-select: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }

  &:last-child {
    margin: 0;
  }

  ${ActiveButton}
`

const Copyright = styled.div`
  font-size: 1rem;
  line-height: 1.2;
  margin: 0;
  text-align: center;
`

export const Footer: React.FC = (props) => {
  const year = new Date().getFullYear()

  return (
    <Wrapper {...props}>
      <SocialGrid>
        <Column>
          <SocialTitle>Join Johnny's Community</SocialTitle>
          <SocialButtons>
            <SocialButton
              href="https://discord.com"
              rel="noopener noreferrer"
              role="link"
              target="_blank"
              title="Join FIAT's Discord community"
            >
              <svg
                height="23.992"
                viewBox="0 0 31.989 23.992"
                width="31.989"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
              >
                <defs>
                  <clipPath id="clip-path">
                    <rect
                      fill="#fff"
                      height="23.992"
                      id="Rectangle_25"
                      transform="translate(0 0)"
                      width="31.989"
                    />
                  </clipPath>
                </defs>
                <g clipPath="url(#clip-path)" transform="translate(0 0)">
                  <path
                    className="fill"
                    d="M26.793,2.412a26.1,26.1,0,0,0-6.442-2,.1.1,0,0,0-.1.049,18.181,18.181,0,0,0-.8,1.648,24.1,24.1,0,0,0-7.236,0A16.675,16.675,0,0,0,11.395.462a.1.1,0,0,0-.1-.049,26.028,26.028,0,0,0-6.442,2,.092.092,0,0,0-.042.036A26.712,26.712,0,0,0,.131,20.463a.109.109,0,0,0,.041.074,26.246,26.246,0,0,0,7.9,4,.1.1,0,0,0,.111-.036A18.759,18.759,0,0,0,9.8,21.865a.1.1,0,0,0-.055-.139,17.284,17.284,0,0,1-2.469-1.177.1.1,0,0,1-.01-.168c.166-.124.332-.254.49-.384a.1.1,0,0,1,.1-.014,18.718,18.718,0,0,0,15.906,0,.1.1,0,0,1,.1.013c.158.131.324.261.492.386a.1.1,0,0,1-.009.168,16.219,16.219,0,0,1-2.47,1.176.1.1,0,0,0-.054.141,21.062,21.062,0,0,0,1.616,2.629.1.1,0,0,0,.111.038,26.159,26.159,0,0,0,7.916-4,.1.1,0,0,0,.041-.073,26.536,26.536,0,0,0-4.68-18.015A.08.08,0,0,0,26.793,2.412ZM10.577,16.867a3.042,3.042,0,0,1-2.844-3.19,3.025,3.025,0,0,1,2.844-3.19,3.009,3.009,0,0,1,2.844,3.19A3.025,3.025,0,0,1,10.577,16.867Zm10.517,0a3.042,3.042,0,0,1-2.844-3.19,3.025,3.025,0,0,1,2.844-3.19,3.009,3.009,0,0,1,2.844,3.19A3.017,3.017,0,0,1,21.093,16.867Z"
                    fill="#fff"
                    id="Path_170"
                    transform="translate(0 -0.754)"
                  />
                </g>
              </svg>
            </SocialButton>
          </SocialButtons>
        </Column>
        <Column>
          <SocialTitle>Join Johnny's Community</SocialTitle>
          <SocialButtons>
            <SocialButton
              href="https://twitter.com"
              rel="noopener noreferrer"
              role="link"
              target="_blank"
              title="Follow FIAT's on Twitter"
            >
              <svg
                height="23.992"
                viewBox="0 0 29.529 23.992"
                width="29.529"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="translate(0)">
                  <path
                    className="fill"
                    d="M615.8,380.215a17.1,17.1,0,0,1-2.018,8.017,16.743,16.743,0,0,1-15.227,9.228,16.789,16.789,0,0,1-9.284-2.712c.423.039.9.059,1.442.059a12,12,0,0,0,7.555-2.6,5.621,5.621,0,0,1-3.546-1.184,6.027,6.027,0,0,1-2.106-2.97,10.822,10.822,0,0,0,1.1.059,7.845,7.845,0,0,0,1.614-.172,6.088,6.088,0,0,1-3.46-2.136,5.8,5.8,0,0,1-1.385-3.8v-.116a5.718,5.718,0,0,0,2.712.807,6.719,6.719,0,0,1-1.961-2.193,5.867,5.867,0,0,1,.116-5.94,16.939,16.939,0,0,0,12.456,6.344,8.444,8.444,0,0,1-.116-1.383,6.026,6.026,0,0,1,.807-3.029,5.934,5.934,0,0,1,2.193-2.22,5.842,5.842,0,0,1,3-.807,5.77,5.77,0,0,1,2.451.519,6.847,6.847,0,0,1,1.99,1.383,12.273,12.273,0,0,0,3.863-1.442,6.02,6.02,0,0,1-2.653,3.347,13.093,13.093,0,0,0,3.46-.982,13.316,13.316,0,0,1-3.056,3.172A3.568,3.568,0,0,1,615.8,380.215Z"
                    fill="#fff"
                    transform="translate(-589.271 -373.468)"
                  />
                </g>
              </svg>
            </SocialButton>
            <SocialButton
              href="https://instagram.com"
              rel="noopener noreferrer"
              role="link"
              target="_blank"
              title="Follow FIAT's on Instagram"
            >
              <svg
                height="24.217"
                viewBox="0 0 24.217 24.217"
                width="24.217"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="fill"
                  d="M4.233-8.733A6.049,6.049,0,0,1,7.341-7.9a6.235,6.235,0,0,1,2.27,2.27,6.049,6.049,0,0,1,.838,3.108A6.049,6.049,0,0,1,9.612.591a6.235,6.235,0,0,1-2.27,2.27A6.049,6.049,0,0,1,4.233,3.7a6.049,6.049,0,0,1-3.108-.838A6.235,6.235,0,0,1-1.145.591a6.049,6.049,0,0,1-.838-3.108,6.049,6.049,0,0,1,.838-3.108A6.235,6.235,0,0,1,1.125-7.9,6.049,6.049,0,0,1,4.233-8.733Zm0,10.27A3.9,3.9,0,0,0,7.1.348,3.9,3.9,0,0,0,8.287-2.517,3.9,3.9,0,0,0,7.1-5.382,3.9,3.9,0,0,0,4.233-6.571,3.9,3.9,0,0,0,1.368-5.382,3.9,3.9,0,0,0,.179-2.517,3.9,3.9,0,0,0,1.368.348,3.9,3.9,0,0,0,4.233,1.537ZM12.179-9a1.684,1.684,0,0,1-.459,1.027,1.316,1.316,0,0,1-1,.432,1.4,1.4,0,0,1-1.027-.432A1.4,1.4,0,0,1,9.26-9a1.4,1.4,0,0,1,.432-1.027,1.4,1.4,0,0,1,1.027-.432,1.4,1.4,0,0,1,1.027.432A1.4,1.4,0,0,1,12.179-9Zm4.108,1.459q.054,1.514.054,5.027T16.26,2.537A10.194,10.194,0,0,1,15.8,5.213a6.327,6.327,0,0,1-3.838,3.838,10.194,10.194,0,0,1-2.676.459q-1.541.081-5.054.081T-.821,9.511A8.827,8.827,0,0,1-3.5,9,5.762,5.762,0,0,1-5.848,7.565,6.3,6.3,0,0,1-7.334,5.213a10.194,10.194,0,0,1-.459-2.676Q-7.875,1-7.875-2.517t.081-5.054a10.194,10.194,0,0,1,.459-2.676A6.3,6.3,0,0,1-5.848-12.6,6.3,6.3,0,0,1-3.5-14.084a10.194,10.194,0,0,1,2.676-.459q1.541-.081,5.054-.081t5.054.081a10.194,10.194,0,0,1,2.676.459A6.3,6.3,0,0,1,14.314-12.6,6.3,6.3,0,0,1,15.8-10.247,11,11,0,0,1,16.288-7.544ZM13.693,4.619A11.381,11.381,0,0,0,14.125,1.7q.054-1.189.054-3.351v-1.73q0-2.216-.054-3.351a10.846,10.846,0,0,0-.432-2.919,3.9,3.9,0,0,0-2.324-2.324,10.846,10.846,0,0,0-2.919-.432Q7.26-12.463,5.1-12.463H3.368q-2.162,0-3.351.054a11.381,11.381,0,0,0-2.919.432A3.9,3.9,0,0,0-5.226-9.652a10.846,10.846,0,0,0-.432,2.919q-.054,1.189-.054,3.351v1.73q0,2.162.054,3.351a11.381,11.381,0,0,0,.432,2.919A4.1,4.1,0,0,0-2.9,6.943a11.381,11.381,0,0,0,2.919.432q1.189.054,3.351.054H5.1q2.216,0,3.351-.054a10.846,10.846,0,0,0,2.919-.432A4.1,4.1,0,0,0,13.693,4.619Z"
                  fill="#fff"
                  transform="translate(7.875 14.625)"
                />
              </svg>
            </SocialButton>
          </SocialButtons>
        </Column>
      </SocialGrid>
      <Menu>
        <Link href="/faq" passHref>
          <Item>FAQ</Item>
        </Link>
        <Link href="/terms-and-conditions" passHref>
          <Item>Terms And Conditions</Item>
        </Link>
        <Link href="/privacy-policy" passHref>
          <Item>Privacy Policy</Item>
        </Link>
      </Menu>
      <Copyright>© Copyright {year}</Copyright>
    </Wrapper>
  )
}
