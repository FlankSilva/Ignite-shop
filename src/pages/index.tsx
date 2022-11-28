import Stripe from 'stripe'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { NextSeo } from 'next-seo'

import { useKeenSlider } from 'keen-slider/react'

import { FooterContainer, HomeContainer, Product } from '../styles/pages/home'

import 'keen-slider/keen-slider.min.css'
import { stripe } from '../lib/stripe'
import { formatedCurrency } from '../utils/formattedData'

interface HomeProps {
  products: {
    id: string
    name: string
    imageUrl: string
    price: number
  }[]
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    },
  })

  return (
    <>
      {/* <Head>
        <title>Home Ignite Shop</title>
      </Head> */}

      <NextSeo title="Home ignite shop" description="Teste teste" />

      <HomeContainer ref={sliderRef} className="keen-slider">
        {products.map((product) => {
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              prefetch={false}
            >
              <Product className="keen-slider__slide">
                <Image src={product.imageUrl} width={520} height={480} alt="" />

                <FooterContainer>
                  <strong>{product.name}</strong>
                  <span>{formatedCurrency(String(product.price))}</span>
                </FooterContainer>
              </Product>
            </Link>
          )
        })}
      </HomeContainer>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
    active: true,
  })

  const products = response.data.map((product) => {
    const price = product.default_price as Stripe.Price

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0] || '',
      price: price.unit_amount ? price.unit_amount / 100 : null,
    }
  })

  return {
    props: {
      products,
    },
  }
}
