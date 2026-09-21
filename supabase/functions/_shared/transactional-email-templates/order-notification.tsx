/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Hr,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Scent of Time'

interface OrderNotificationProps {
  productName?: string
  quantity?: number
  totalPrice?: string
  variant?: string
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  deliveryCharge?: string
  orderTime?: string
  selectedPerfumes?: string
}

const OrderNotificationEmail = ({
  productName = 'Sample Product',
  quantity = 1,
  totalPrice = '৳0',
  variant = 'Default',
  customerName = 'Customer',
  customerPhone = '01XXXXXXXXX',
  customerAddress = 'N/A',
  deliveryCharge = '৳0',
  orderTime = new Date().toLocaleString(),
  selectedPerfumes,
}: OrderNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New order received — {productName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Order Received</Heading>
        <Text style={subtitle}>A customer just placed an order on {SITE_NAME}.</Text>

        <Section style={detailsSection}>
          <Heading as="h2" style={h2}>Order Details</Heading>
          <Row><Column><Text style={label}>Product</Text></Column><Column><Text style={value}>{productName}</Text></Column></Row>
          <Row><Column><Text style={label}>Variant</Text></Column><Column><Text style={value}>{variant}</Text></Column></Row>
          <Row><Column><Text style={label}>Quantity</Text></Column><Column><Text style={value}>{quantity}</Text></Column></Row>
          <Row><Column><Text style={label}>Total Price</Text></Column><Column><Text style={valueBold}>{totalPrice}</Text></Column></Row>
          <Row><Column><Text style={label}>Delivery Charge</Text></Column><Column><Text style={value}>{deliveryCharge}</Text></Column></Row>
          {selectedPerfumes ? (
            <Row><Column><Text style={label}>Selected Perfumes</Text></Column><Column><Text style={value}>{selectedPerfumes}</Text></Column></Row>
          ) : null}
        </Section>

        <Hr style={hr} />

        <Section style={detailsSection}>
          <Heading as="h2" style={h2}>Customer Info</Heading>
          <Row><Column><Text style={label}>Name</Text></Column><Column><Text style={value}>{customerName}</Text></Column></Row>
          <Row><Column><Text style={label}>Phone</Text></Column><Column><Text style={value}>{customerPhone}</Text></Column></Row>
          <Row><Column><Text style={label}>Address</Text></Column><Column><Text style={value}>{customerAddress}</Text></Column></Row>
          <Row><Column><Text style={label}>Order Time</Text></Column><Column><Text style={value}>{orderTime}</Text></Column></Row>
        </Section>

        <Text style={footer}>This is an automated notification from {SITE_NAME}.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderNotificationEmail,
  subject: (data: Record<string, any>) => `New Order — ${data.productName || 'New Order'}`,
  displayName: 'Order notification',
  previewData: {
    productName: 'Aventus Creed',
    quantity: 2,
    totalPrice: '৳3,200',
    variant: '50ml',
    customerName: 'Ahmed Rahman',
    customerPhone: '01890080280',
    customerAddress: 'Agrabad, Chattogram',
    deliveryCharge: '৳60',
    orderTime: '3/28/2026, 10:30:00 PM',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Jost', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px' }
const h1 = {
  fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  fontSize: '26px',
  fontWeight: '600' as const,
  color: 'hsl(25, 20%, 12%)',
  margin: '0 0 8px',
}
const subtitle = { fontSize: '14px', color: 'hsl(25, 10%, 45%)', margin: '0 0 24px' }
const h2 = {
  fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  fontSize: '18px',
  fontWeight: '600' as const,
  color: 'hsl(25, 20%, 12%)',
  margin: '0 0 12px',
}
const detailsSection = { margin: '0 0 8px' }
const label = { fontSize: '12px', color: 'hsl(25, 10%, 45%)', margin: '4px 0', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }
const value = { fontSize: '14px', color: 'hsl(25, 20%, 12%)', margin: '4px 0' }
const valueBold = { ...value, fontWeight: 'bold' as const }
const hr = { borderColor: 'hsl(30, 20%, 88%)', margin: '16px 0' }
const footer = { fontSize: '12px', color: 'hsl(25, 10%, 45%)', margin: '24px 0 0' }
