/* eslint-disable prettier/prettier */
import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Stripe from 'stripe'
import axios from 'axios'

import { stripe } from '../../lib/stripe'
import { formatedCurrency } from '../../utils/formattedData'
import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from '../../styles/pages/product'
import { useState } from 'react'
import Head from 'next/head'

interface ProductProps {
  product: {
    id: string
    name: string
    imageUrl: string
    price: number
    description: string
    defaultPriceId: string
  }
}

export default function Product({ product }: ProductProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false)

  const { isFallback } = useRouter()

  const handleBuyProduct = async () => {
    try {
      setIsCreatingCheckoutSession(true)

      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId
      })

      const { checkoutUrl } = response.data

      window.location.href = checkoutUrl
    } catch (error) {

      setIsCreatingCheckoutSession(false)
      console.log('Falha ao redirecionar ao checkout');
      
    }
    
  }

  if (isFallback) {
    return <p>Loading...</p>
  }

  return (
   <>
     <Head>
        <title>{product.name} Ignite Shop</title>
      </Head>
      
    <ProductContainer>
      <ImageContainer>
        <Image src={product.imageUrl} width={520} height={480} alt="" />
      </ImageContainer>

      <ProductDetails>
        <h1>{product.name}</h1>
        <span>{formatedCurrency(String(product.price))}</span>

        <p>{product.description}</p>

        <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>Comprar agora</button>
      </ProductDetails>
    </ProductContainer>
   </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
    active: true,
  })

  const products = response.data.slice(0, 2)

  const paths = products.map((product) => {
    return {
      params: { id: product.id },
    }
  })

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  const productId = params?.id || ''

  const response = await stripe.products.list({
    expand: ['data.default_price'],
    active: true,
  })

  const product = response.data.find(item => item.id === productId)

  if (!product) {
    return {
      notFound: true
    }
  }

  const price = product.default_price as Stripe.Price

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0] || '',
        price: price.unit_amount ? price.unit_amount / 100 : null,
        description: product.description,
        defaultPriceId: price.id
      },
    },

    revalidate: 60 * 60 * 1, // hour
  }
}
