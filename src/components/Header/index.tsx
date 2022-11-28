import Image from 'next/image'

import logo from '../../assets/logo.svg'
import { HeaderContainer } from './styles'

export const Header = () => {
  return (
    <HeaderContainer>
      <Image src={logo} alt="" />
    </HeaderContainer>
  )
}
