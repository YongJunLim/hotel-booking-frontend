import { Hotel } from '../../../src/types/params'

export const MockHotelData: Hotel[] = [
  {
    id: '1a1a',
    name: 'Cookie A Hotel',
    latitude: 1.389154,
    longitude: 103.989427,
    address: '1 avenue cookie',
    rating: 3.5,
    categories: { overall: { name: 'Overall', score: 8.5, popularity: 100 } },
    description: 'description 1a',
    amenities: { dryCleaning: true, continentalBreakfast: true },
    image_details: {
      suffix: '.jpg',
      count: 0,
      prefix: 'https://1avenuecookie.net/1a1a/',
    },
  },
  {
    id: '2a2a',
    name: 'Book B Hotel',
    latitude: 1.389154,
    longitude: 103.989427,
    address: '2 avenue book',
    rating: 1.5,
    categories: { overall: { name: 'Overall', score: 8.5, popularity: 100 } },
    description: 'description 2a',
    amenities: { dryCleaning: true, continentalBreakfast: true },
    image_details: {
      suffix: '.jpg',
      count: 0,
      prefix: 'https://2avenuebook.net/2a2a/',
    },
  },
  {
    id: '2b2b',
    name: 'Milk B Hotel',
    latitude: 1.389154,
    longitude: 103.989427,
    address: '2 bvenue milk',
    rating: 1.5,
    categories: { overall: { name: 'Overall', score: 8.5, popularity: 100 } },
    description: 'description 2b',
    amenities: { dryCleaning: true, continentalBreakfast: true },
    image_details: {
      suffix: '.jpg',
      count: 0,
      prefix: 'https://2bvenuemilk.net/1a1a/',
    },
  },
  {
    id: '3a3a',
    name: 'Oreo A Hotel',
    latitude: 1.389154,
    longitude: 103.989427,
    address: '3 avenue Oreo',
    rating: 3.5,
    categories: { overall: { name: 'Overall', score: 8.5, popularity: 100 } },
    description: 'description 3a',
    amenities: { dryCleaning: true, continentalBreakfast: true },
    image_details: {
      suffix: '.jpg',
      count: 0,
      prefix: 'https://3avenueOreo.net/1a1a/',
    },
  },
  {
    id: '3c3c',
    name: 'Oreo C Hotel',
    latitude: 1.389154,
    longitude: 103.989427,
    address: '3 cvenue Oreo',
    rating: 4.5,
    categories: { overall: { name: 'Overall', score: 8.5, popularity: 100 } },
    description: 'description 3c',
    amenities: { dryCleaning: true, continentalBreakfast: true },
    image_details: {
      suffix: '.jpg',
      count: 0,
      prefix: 'https://3cvenueOreo.net/1a1a/',
    },
  },
]

export const MockPriceData = [
  {
    completed: true,
    hotels: [
      {
        id: '1a1a',
        price: 500,
        searchRank: 0.96,
      },
    ],
  },
  {
    completed: true,
    hotels: [
      {
        id: '2b2b',
        price: 1000,
        searchRank: 0.96,
      },
    ],
  },
  {
    completed: true,
    hotels: [
      {
        id: '3c3c',
        price: 2000,
        searchRank: 0.96,
      },
    ],
  },
]
