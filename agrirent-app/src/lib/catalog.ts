export interface EquipmentSpec {
  label: string
  labelTa: string
  value: string
}

export interface CatalogItem {
  id: string
  name: string
  nameTa: string
  category: string
  cat: string // Backward-compatible alias
  brand: string
  model: string
  description: string
  descriptionTa: string
  imageUrl: string
  img: string // Backward-compatible alias
  gallery: string[]
  price: string
  dailyRate: number
  unit: string
  location: string
  lat?: number | undefined
  lng?: number | undefined
  rating: number
  reviews: number
  avail: boolean
  availabilityType?: ('rent' | 'buy' | 'both') | undefined
  purchasePrice?: number | undefined
  vendorId?: string | undefined
  vendorName?: string | undefined
  vendorDistance?: string | undefined
  distance?: string | undefined
  owner: string
  ownerId: string
  ownerPhone: string
  specs: EquipmentSpec[]
  features: string[]
  hp?: number | undefined
  fuelType?: ('Diesel' | 'Solar / Electric' | 'Battery / Hybrid' | 'Petrol') | undefined
  operatorIncluded?: boolean | undefined
  securityDeposit?: number | undefined
  pricePerHour?: number | undefined
  condition?: string | undefined
  year?: string | undefined
  minRentalDays?: number | undefined
  deliveryAvailable?: boolean | undefined
  deliveryCharge?: number | undefined
  updatedAt?: string | undefined
}

export interface CatalogCategory {
  icon: string
  name: string
  nameTa: string
  count: string
  kind: 'machine' | 'supply'
  image: string
}

export interface CatalogFilters {
  category?: string | undefined
  brand?: string | undefined
  minPrice?: number | undefined
  maxPrice?: number | undefined
  minRating?: number | undefined
  availability?: ('rent' | 'buy' | 'both') | undefined
  sortBy?: ('rating' | 'reviews' | 'price_asc' | 'price_desc' | 'nearest') | undefined
  availableOnly?: boolean | undefined
  location?: string | undefined
}

// Category fallback local images
export const categoryImages: Record<string, string> = {
  Tractor: '/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg',
  Harvester: '/equipment/harvesters/claas-crop-tiger-30.jpg',
  'Ploughing & Tilling': '/equipment/tillage/mahindra-mb-plough.jpg',
  'Ploughing / Tillage': '/equipment/tillage/mahindra-mb-plough.jpg',
  Tillage: '/equipment/tillage/mahindra-mb-plough.jpg',
  Seeding: '/equipment/seeding/mahindra-seed-drill.jpg',
  'Sprayers & Drones': '/equipment/sprayers-drones/dji-agras-t40.jpg',
  'Water Pump': '/equipment/water-pumps/kirloskar-diesel-water-pump.jpg',
  'Water Pumps': '/equipment/water-pumps/kirloskar-diesel-water-pump.jpg',
}

const defaultFallbackImg = '/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg'

export function getCategoryFallback(category: string): string {
  if (!category) return defaultFallbackImg
  if (categoryImages[category]) return categoryImages[category] || defaultFallbackImg
  const lower = category.toLowerCase()
  if (lower.includes('tractor')) return categoryImages['Tractor'] || defaultFallbackImg
  if (lower.includes('harvester')) return categoryImages['Harvester'] || defaultFallbackImg
  if (lower.includes('plough') || lower.includes('tillage') || lower.includes('tiller')) return categoryImages['Ploughing & Tilling'] || defaultFallbackImg
  if (lower.includes('seed')) return categoryImages['Seeding'] || defaultFallbackImg
  if (lower.includes('drone') || lower.includes('spray')) return categoryImages['Sprayers & Drones'] || defaultFallbackImg
  if (lower.includes('pump')) return categoryImages['Water Pump'] || defaultFallbackImg
  return defaultFallbackImg
}

export function categoryIcon(cat: string): string {
  const c = categories.find((item) => item.name === cat || item.nameTa === cat)
  if (c) return c.icon
  const lower = (cat || '').toLowerCase()
  if (lower.includes('tractor')) return '🚜'
  if (lower.includes('harvester')) return '🌾'
  if (lower.includes('plough') || lower.includes('tillage') || lower.includes('tiller')) return '⚙️'
  if (lower.includes('seed')) return '🌱'
  if (lower.includes('drone') || lower.includes('spray')) return '🛸'
  if (lower.includes('pump')) return '🪣'
  return '🚜'
}

export function getGoogleImageSearchUrl(equipmentName: string): string {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent((equipmentName || '').trim() + ' agricultural equipment')}`
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

/**
 * Exactly 6 Curated Agricultural Categories
 */
export const categories: CatalogCategory[] = [
  {
    icon: '🚜',
    name: 'Tractor',
    nameTa: 'டிராக்டர்',
    count: '3 listings',
    kind: 'machine',
    image: '/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg',
  },
  {
    icon: '🌾',
    name: 'Harvester',
    nameTa: 'அறுவடை இயந்திரம்',
    count: '3 listings',
    kind: 'machine',
    image: '/equipment/harvesters/claas-crop-tiger-30.jpg',
  },
  {
    icon: '⚙️',
    name: 'Ploughing & Tilling',
    nameTa: 'உழவு & ரோட்டாவேட்டர்',
    count: '3 listings',
    kind: 'machine',
    image: '/equipment/tillage/mahindra-mb-plough.jpg',
  },
  {
    icon: '🌱',
    name: 'Seeding',
    nameTa: 'விதைப்பான் இயந்திரம்',
    count: '3 listings',
    kind: 'machine',
    image: '/equipment/seeding/mahindra-seed-drill.jpg',
  },
  {
    icon: '🛸',
    name: 'Sprayers & Drones',
    nameTa: 'தெளிப்பான் & விவசாய ட்ரோன்',
    count: '3 listings',
    kind: 'machine',
    image: '/equipment/sprayers-drones/dji-agras-t40.jpg',
  },
  {
    icon: '🪣',
    name: 'Water Pump',
    nameTa: 'நீர் பம்ப் செட்',
    count: '3 listings',
    kind: 'machine',
    image: '/equipment/water-pumps/kirloskar-diesel-water-pump.jpg',
  },
]

export const categoryNames = ['All', ...categories.map((c) => c.name)]

export const tamilNaduDistricts = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Cuddalore',
  'Coimbatore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kancheepuram',
  'Kanniyakumari',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Namakkal',
  'The Nilgiris',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupathur',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Viluppuram',
  'Virudhunagar',
]

export const tamilNaduDistrictCoordinates: Record<string, { lat: number; lng: number }> = {
  Ariyalur: { lat: 11.1401, lng: 79.0786 },
  Chengalpattu: { lat: 12.6819, lng: 79.9888 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Cuddalore: { lat: 11.748, lng: 79.7714 },
  Dharmapuri: { lat: 12.1277, lng: 78.1579 },
  Dindigul: { lat: 10.3673, lng: 77.9803 },
  Erode: { lat: 11.341, lng: 77.7172 },
  Kallakurichi: { lat: 11.7385, lng: 78.9639 },
  Kancheepuram: { lat: 12.8342, lng: 79.7036 },
  Kanniyakumari: { lat: 8.1833, lng: 77.4119 },
  Karur: { lat: 10.9601, lng: 78.0766 },
  Krishnagiri: { lat: 12.5186, lng: 78.2137 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  Mayiladuthurai: { lat: 11.1035, lng: 79.655 },
  Nagapattinam: { lat: 10.7672, lng: 79.8449 },
  Namakkal: { lat: 11.2189, lng: 78.1677 },
  'The Nilgiris': { lat: 11.4102, lng: 76.695 },
  Perambalur: { lat: 11.2333, lng: 78.8833 },
  Pudukkottai: { lat: 10.3833, lng: 78.8001 },
  Ramanathapuram: { lat: 9.3639, lng: 78.8395 },
  Ranipet: { lat: 12.9273, lng: 79.3333 },
  Salem: { lat: 11.6643, lng: 78.146 },
  Sivaganga: { lat: 9.8433, lng: 78.4809 },
  Tenkasi: { lat: 8.9595, lng: 77.3152 },
  Thanjavur: { lat: 10.787, lng: 79.1378 },
  Theni: { lat: 10.0104, lng: 77.4768 },
  Thoothukudi: { lat: 8.7642, lng: 78.1348 },
  Tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  Tirunelveli: { lat: 8.7139, lng: 77.7567 },
  Tirupathur: { lat: 12.4967, lng: 78.5677 },
  Tiruppur: { lat: 11.1085, lng: 77.3411 },
  Tiruvallur: { lat: 13.1439, lng: 79.9089 },
  Tiruvannamalai: { lat: 12.2253, lng: 79.0747 },
  Tiruvarur: { lat: 10.7661, lng: 79.6344 },
  Vellore: { lat: 12.9165, lng: 79.1325 },
  Viluppuram: { lat: 11.9401, lng: 79.4861 },
  Virudhunagar: { lat: 9.5851, lng: 77.9579 },
}

/**
 * Exactly 18 Verified Realistic Agricultural Equipment Listings
 * 6 categories × 3 models each
 */
export const SEED_CATALOG: CatalogItem[] = [
  // =========================================================================
  // A. TRACTORS (3 Models)
  // =========================================================================
  {
    id: 'eq-tractor-1',
    name: 'Mahindra 575 DI Yuvo Tech+',
    nameTa: 'மகிந்திரா 575 DI யுவோ டெக்+',
    category: 'Tractor',
    cat: 'Tractor',
    brand: 'Mahindra',
    model: '575 DI Yuvo Tech+',
    imageUrl: '/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg',
    img: '/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg',
    gallery: ['/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg'],
    price: '₹1,800/day',
    dailyRate: 1800,
    unit: '/day',
    location: 'Coimbatore, Tamil Nadu',
    lat: 11.0168,
    lng: 76.9558,
    rating: 4.9,
    reviews: 42,
    avail: true,
    owner: 'Karthik Subramanian',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98421 23456',
    hp: 47,
    fuelType: 'Diesel',
    operatorIncluded: true,
    securityDeposit: 3000,
    specs: [
      { label: 'Engine Power', labelTa: 'என்ஜின் திறன்', value: '47 HP (4-Cylinder)' },
      { label: 'Transmission', labelTa: 'டிரான்ஸ்மிஷன்', value: '12 Forward + 3 Reverse' },
      { label: 'Lift Capacity', labelTa: 'தூக்கும் திறன்', value: '1,700 kg' },
      { label: 'Fuel Tank', labelTa: 'எரிபொருள் தொட்டி', value: '60 Litres' },
    ],
    features: ['12F+3R Gearbox', 'High Precision Hydraulics', 'Dual Clutch', 'Power Steering'],
    description:
      'Official Mahindra 575 DI Yuvo Tech+ tractor with powerful 4-cylinder engine, 12F+3R transmission, superior fuel economy, and 1700 kg lift capacity ideal for rotary tillage, haulage, and puddling.',
    descriptionTa:
      'அதிநவீன 47 HP டிராக்டர், 12 முன்னோக்கி + 3 பின்தோக்கி கியர் அமைப்பு மற்றும் சிறந்த எரிபொருள் செயல்திறனுடன் கூடியது.',
  },
  {
    id: 'eq-tractor-2',
    name: 'John Deere 5310',
    nameTa: 'ஜான் டீர் 5310',
    category: 'Tractor',
    cat: 'Tractor',
    brand: 'John Deere',
    model: '5310 PowerTech',
    imageUrl: '/equipment/tractors/john-deere-5310.jpg',
    img: '/equipment/tractors/john-deere-5310.jpg',
    gallery: ['/equipment/tractors/john-deere-5310.jpg'],
    price: '₹2,200/day',
    dailyRate: 2200,
    unit: '/day',
    location: 'Thanjavur, Tamil Nadu',
    lat: 10.787,
    lng: 79.1378,
    rating: 4.8,
    reviews: 38,
    avail: true,
    owner: 'M. Ramesh',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98422 34567',
    hp: 55,
    fuelType: 'Diesel',
    operatorIncluded: true,
    securityDeposit: 3500,
    specs: [
      { label: 'Engine Power', labelTa: 'என்ஜின் திறன்', value: '55 HP PowerTech Turbo' },
      { label: 'Transmission', labelTa: 'டிரான்ஸ்மிஷன்', value: '9 Forward + 3 Reverse Collarshift' },
      { label: 'Lift Capacity', labelTa: 'தூக்கும் திறன்', value: '2,000 kg' },
      { label: 'Brakes', labelTa: 'பிரேக்', value: 'Oil Immersed Disc Brakes' },
    ],
    features: ['Turbocharged PowerTech Engine', 'Heavy Duty Front Axle', 'Independent PTO', 'Power Steering'],
    description:
      'Heavy-duty John Deere 5310 utility tractor with 55 HP turbocharged PowerTech engine, Trem IV emission compliance, 2000 kg lift capacity, and oil-immersed disc brakes for heavy field operations.',
    descriptionTa:
      'டர்போசார்ஜ் செய்யப்பட்ட 55 HP என்ஜின், வலுவான ஹைட்ராலிக் லிப்ட் மற்றும் இணையற்ற நம்பகத்தன்மை கொண்ட முன்னணி டிராக்டர்.',
  },
  {
    id: 'eq-tractor-3',
    name: 'New Holland 3630 TX Super',
    nameTa: 'நியூ ஹாலந்து 3630 TX சூப்பர்',
    category: 'Tractor',
    cat: 'Tractor',
    brand: 'New Holland',
    model: '3630 TX Super',
    imageUrl: '/equipment/tractors/new-holland-3630-tx-super.jpg',
    img: '/equipment/tractors/new-holland-3630-tx-super.jpg',
    gallery: ['/equipment/tractors/new-holland-3630-tx-super.jpg'],
    price: '₹2,000/day',
    dailyRate: 2000,
    unit: '/day',
    location: 'Madurai, Tamil Nadu',
    lat: 9.9252,
    lng: 78.1198,
    rating: 4.8,
    reviews: 35,
    avail: true,
    owner: 'V. Selvam',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98423 45678',
    hp: 50,
    fuelType: 'Diesel',
    operatorIncluded: true,
    securityDeposit: 3000,
    specs: [
      { label: 'Engine Power', labelTa: 'என்ஜின் திறன்', value: '50 HP FPT Engine' },
      { label: 'Transmission', labelTa: 'டிரான்ஸ்மிஷன்', value: '8 Forward + 2 Reverse Constant Mesh' },
      { label: 'Lift Capacity', labelTa: 'தூக்கும் திறன்', value: '1,800 kg' },
      { label: 'Clutch', labelTa: 'கிளட்ச்', value: 'Double Clutch Independent PTO' },
    ],
    features: ['FPT High Torque Engine', 'Double Clutch Independent PTO', 'Power Steering', 'Rops Canopy'],
    description:
      'New Holland 3630 TX Super 50 HP tractor featuring high torque backup, double clutch with independent PTO lever, and robust 1,800 kg hydraulic lift capacity for commercial farm work.',
    descriptionTa:
      '50 HP திறன் கொண்ட பல்துறை டிராக்டர், இரட்டை கிளட்ச் மற்றும் கனரக விவசாய வேலைகளுக்கான உறுதியான கட்டமைப்பு.',
  },

  // =========================================================================
  // B. HARVESTERS (3 Models)
  // =========================================================================
  {
    id: 'eq-harvester-1',
    name: 'Claas Crop Tiger 30',
    nameTa: 'கிளாஸ் கிராப் டைகர் 30',
    category: 'Harvester',
    cat: 'Harvester',
    brand: 'Claas',
    model: 'Crop Tiger 30 Terra Trac',
    imageUrl: '/equipment/harvesters/claas-crop-tiger-30.jpg',
    img: '/equipment/harvesters/claas-crop-tiger-30.jpg',
    gallery: ['/equipment/harvesters/claas-crop-tiger-30.jpg'],
    price: '₹4,800/day',
    dailyRate: 4800,
    unit: '/day',
    location: 'Thanjavur, Tamil Nadu',
    lat: 10.787,
    lng: 79.1378,
    rating: 4.9,
    reviews: 51,
    avail: true,
    owner: 'Balvinder Singh',
    ownerId: 'usr-owner-2',
    ownerPhone: '+91 98140 87654',
    hp: 60,
    fuelType: 'Diesel',
    operatorIncluded: true,
    securityDeposit: 7500,
    specs: [
      { label: 'Engine', labelTa: 'என்ஜின்', value: '60 HP Tata 4SP RTV Diesel' },
      { label: 'Cutter Bar Width', labelTa: 'கட்டர் பார் அகலம்', value: '7.0 Feet (2.1 m)' },
      { label: 'Grain Tank', labelTa: 'தானிய தொட்டி', value: '1,200 Litres' },
      { label: 'Drive Type', labelTa: 'இயக்க வகை', value: 'Terra Trac Rubber Track' },
    ],
    features: ['Tangential Axial Flow (TAF)', 'Rubber Track System', 'Multi-Crop Harvester', 'Operator Cabin'],
    description:
      'Claas Crop Tiger 30 Terra Trac multi-crop combine harvester equipped with 60 HP engine, Tangential Axial Flow (TAF) threshing, and rubber tracks for muddy and wet paddy fields.',
    descriptionTa:
      'கிளாஸ் கிராப் டைகர் 30 கம்பைன் ஹார்வெஸ்டர், ஈர நில நெல் மற்றும் தானியங்களை விரைவாக அறுவடை செய்ய ரப்பர் ட்ராக் அமைப்புடன் கூடியது.',
  },
  {
    id: 'eq-harvester-2',
    name: 'Kubota DC-68G',
    nameTa: 'குபோடா DC-68G',
    category: 'Harvester',
    cat: 'Harvester',
    brand: 'Kubota',
    model: 'DC-68G Harvesking',
    imageUrl: '/equipment/harvesters/kubota-dc-68g.jpg',
    img: '/equipment/harvesters/kubota-dc-68g.jpg',
    gallery: ['/equipment/harvesters/kubota-dc-68g.jpg'],
    price: '₹5,200/day',
    dailyRate: 5200,
    unit: '/day',
    location: 'Erode, Tamil Nadu',
    lat: 11.341,
    lng: 77.7172,
    rating: 4.9,
    reviews: 47,
    avail: true,
    owner: 'Balvinder Singh',
    ownerId: 'usr-owner-2',
    ownerPhone: '+91 98140 87654',
    hp: 68,
    fuelType: 'Diesel',
    operatorIncluded: true,
    securityDeposit: 8000,
    specs: [
      { label: 'Engine', labelTa: 'என்ஜின்', value: '68 HP Kubota Diesel Turbo' },
      { label: 'Transmission', labelTa: 'டிரான்ஸ்மிஷன்', value: 'Hydrostatic Transmission (HST)' },
      { label: 'Cutter Bar', labelTa: 'கட்டர் பார்', value: '2.0 m width' },
      { label: 'Ground Clearance', labelTa: 'தரை இடைவெளி', value: 'High-Clearance Crawler Track' },
    ],
    features: ['Single Lever Steering', 'High Speed Threshing', 'Adjustable Reel', 'Low Ground Pressure'],
    description:
      'Authentic Kubota DC-68G Harvesking paddy combine harvester featuring 68 HP diesel engine, Hydrostatic Transmission (HST), and crawler tracks for maximum efficiency with minimal grain loss.',
    descriptionTa:
      'குபோடா DC-68G ஹார்வெஸ்டர், நெல் அறுவடையில் குறைந்த தானிய இழப்பு மற்றும் அதிக வேக செயல்பாட்டிற்கான பிரத்யேக இயந்திரம்.',
  },
  {
    id: 'eq-harvester-3',
    name: 'New Holland TC5.30',
    nameTa: 'நியூ ஹாலந்து TC5.30',
    category: 'Harvester',
    cat: 'Harvester',
    brand: 'New Holland',
    model: 'TC5.30 Multi-Crop',
    imageUrl: '/equipment/harvesters/new-holland-tc5-30.jpg',
    img: '/equipment/harvesters/new-holland-tc5-30.jpg',
    gallery: ['/equipment/harvesters/new-holland-tc5-30.jpg'],
    price: '₹5,800/day',
    dailyRate: 5800,
    unit: '/day',
    location: 'Salem, Tamil Nadu',
    lat: 11.6643,
    lng: 78.146,
    rating: 4.8,
    reviews: 36,
    avail: true,
    owner: 'Balvinder Singh',
    ownerId: 'usr-owner-2',
    ownerPhone: '+91 98140 87654',
    hp: 130,
    fuelType: 'Diesel',
    operatorIncluded: true,
    securityDeposit: 9000,
    specs: [
      { label: 'Engine Power', labelTa: 'என்ஜின் திறன்', value: '130 HP Turbocharged' },
      { label: 'Cutterbar Width', labelTa: 'கட்டர் பார் அகலம்', value: '15 Feet (4.6 m)' },
      { label: 'Grain Tank', labelTa: 'தானிய தொட்டி', value: '3,000 Litres' },
      { label: 'Separation', labelTa: 'பிரிப்பு அமைப்பு', value: 'Rotary Separator with 5 Walkers' },
    ],
    features: ['Double Cascade Cleaning', 'Large 3000L Tank', 'Multi-Crop Capability', 'AC Driver Cabin'],
    description:
      'High-capacity New Holland TC5.30 multi-crop combine harvester with 130 HP turbocharged engine, 15-foot cutterbar, 3000-litre grain tank, and rotary separator for extensive commercial acreage.',
    descriptionTa:
      'நியூ ஹாலந்து TC5.30 பெரிய அளவிலான பல பயிர் அறுவடை இயந்திரம், 130 HP என்ஜின் மற்றும் 3000 லிட்டர் தானிய தொட்டி வசதியுடன் கூடியது.',
  },

  // =========================================================================
  // C. PLOUGHING / TILLAGE (3 Models)
  // =========================================================================
  {
    id: 'eq-tillage-1',
    name: 'Mahindra MB Plough',
    nameTa: 'மகிந்திரா MB ஏர் கலப்பை',
    category: 'Ploughing & Tilling',
    cat: 'Ploughing & Tilling',
    brand: 'Mahindra',
    model: 'Dharti Mitra MB Plough',
    imageUrl: '/equipment/tillage/mahindra-mb-plough.jpg',
    img: '/equipment/tillage/mahindra-mb-plough.jpg',
    gallery: ['/equipment/tillage/mahindra-mb-plough.jpg'],
    price: '₹850/day',
    dailyRate: 850,
    unit: '/day',
    location: 'Tiruchirappalli, Tamil Nadu',
    lat: 10.7905,
    lng: 78.7047,
    rating: 4.8,
    reviews: 29,
    avail: true,
    owner: 'Selvam Murugan',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98421 54321',
    hp: 45,
    fuelType: 'Diesel',
    operatorIncluded: false,
    securityDeposit: 1500,
    specs: [
      { label: 'Working Depth', labelTa: 'வேலை ஆழம்', value: '10 - 15 cm' },
      { label: 'Plough Bottoms', labelTa: 'கலப்பை அடி', value: '2 or 3 Furrows Reversible' },
      { label: 'Tractor Required', labelTa: 'டிராக்டர் தேவை', value: '40 - 55 HP' },
      { label: 'Blades', labelTa: 'பிளேடுகள்', value: 'High Boron Hardened Steel' },
    ],
    features: ['Hardpan Breaker', 'Reversible Mouldboard', 'Deep Residue Inversion', 'Heavy Tubular Frame'],
    description:
      'Mahindra Dharti Mitra reversible mouldboard plough engineered for deep soil aeration, hardpan penetration, weed burial, and post-monsoon seedbed tillage.',
    descriptionTa:
      'மகிந்திரா MB ஏர் கலப்பை, ஆழமான மண் உழவு மற்றும் களைகளை பூமிக்குள் புதைத்து இயற்கை உரமாக மாற்ற உகந்தது.',
  },
  {
    id: 'eq-tillage-2',
    name: 'Shaktiman Rotary Tiller',
    nameTa: 'சக்திமான் ரோட்டரி டில்லர்',
    category: 'Ploughing & Tilling',
    cat: 'Ploughing & Tilling',
    brand: 'Shaktiman',
    model: 'Regular Plus Series Rotavator',
    imageUrl: '/equipment/tillage/shaktiman-rotary-tiller.jpg',
    img: '/equipment/tillage/shaktiman-rotary-tiller.jpg',
    gallery: ['/equipment/tillage/shaktiman-rotary-tiller.jpg'],
    price: '₹1,100/day',
    dailyRate: 1100,
    unit: '/day',
    location: 'Coimbatore, Tamil Nadu',
    lat: 11.0168,
    lng: 76.9558,
    rating: 4.9,
    reviews: 64,
    avail: true,
    owner: 'Selvam Murugan',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98421 54321',
    hp: 40,
    fuelType: 'Diesel',
    operatorIncluded: false,
    securityDeposit: 2000,
    specs: [
      { label: 'Tillage Width', labelTa: 'உழவு அகலம்', value: '7.0 Feet (2.1 m)' },
      { label: 'Blades', labelTa: 'பிளேடுகள்', value: '48 L-type Boron Steel Blades' },
      { label: 'Gearbox', labelTa: 'கியர்பாக்ஸ்', value: 'Multi-Speed Side Gear Drive' },
      { label: 'Tractor Required', labelTa: 'டிராக்டர் தேவை', value: '45 - 60 HP' },
    ],
    features: ['Boron Steel Blades', 'Multi-Speed Gearbox', 'Heavy Spring Trailing Board', 'Submerged Oil Seal'],
    description:
      'Shaktiman Regular Plus rotary tiller with 48 boron steel blades and multi-speed drive for single-pass soil pulverization in both dry and wet agricultural fields.',
    descriptionTa:
      'சக்திமான் ரோட்டரி டில்லர், ஒரே சுற்றில் மண்ணை மிருதுவாக்கி விதைப்புக்கு தயார் செய்யும் உயர்தர உழவு இயந்திரம்.',
  },
  {
    id: 'eq-tillage-3',
    name: 'John Deere Disc Harrow',
    nameTa: 'ஜான் டீர் டிஸ்க் ஹாரோ',
    category: 'Ploughing & Tilling',
    cat: 'Ploughing & Tilling',
    brand: 'John Deere',
    model: 'GreenSystem Disc Harrow',
    imageUrl: '/equipment/tillage/john-deere-disc-harrow.jpg',
    img: '/equipment/tillage/john-deere-disc-harrow.jpg',
    gallery: ['/equipment/tillage/john-deere-disc-harrow.jpg'],
    price: '₹950/day',
    dailyRate: 950,
    unit: '/day',
    location: 'Madurai, Tamil Nadu',
    lat: 9.9252,
    lng: 78.1198,
    rating: 4.7,
    reviews: 31,
    avail: true,
    owner: 'Selvam Murugan',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98421 54321',
    hp: 45,
    fuelType: 'Diesel',
    operatorIncluded: false,
    securityDeposit: 1500,
    specs: [
      { label: 'Discs', labelTa: 'டிஸ்க்குகள்', value: '16 Discs (Notched + Plain)' },
      { label: 'Disc Diameter', labelTa: 'டிஸ்க் விட்டம்', value: '560 mm Boron Steel' },
      { label: 'Gang Angle', labelTa: 'சாய்வு கோணம்', value: 'Adjustable 0° - 20°' },
      { label: 'Tractor Required', labelTa: 'டிராக்டர் தேவை', value: '40 - 55 HP' },
    ],
    features: ['High Carbon Boron Steel Discs', 'Heavy Duty Spool', 'Grease Sealed Bearings', 'Universal Hitch'],
    description:
      'John Deere GreenSystem heavy tandem disc harrow with 16 boron discs designed for chopping heavy crop residues, clod breaking, and thorough secondary tillage.',
    descriptionTa:
      'ஜான் டீர் டிஸ்க் ஹாரோ, கட்டிகளை உடைக்கவும் பயிர் கழிவுகளை மண்ணோடு கலக்கவும் பயன்படும் உறுதியான டிஸ்க் கலப்பை.',
  },

  // =========================================================================
  // D. SEEDING (3 Models)
  // =========================================================================
  {
    id: 'eq-seeding-1',
    name: 'Mahindra Seed Drill',
    nameTa: 'மகிந்திரா விதைப்பான்',
    category: 'Seeding',
    cat: 'Seeding',
    brand: 'Mahindra',
    model: 'Dharti Mitra Super Seeder',
    imageUrl: '/equipment/seeding/mahindra-seed-drill.jpg',
    img: '/equipment/seeding/mahindra-seed-drill.jpg',
    gallery: ['/equipment/seeding/mahindra-seed-drill.jpg'],
    price: '₹1,400/day',
    dailyRate: 1400,
    unit: '/day',
    location: 'Thanjavur, Tamil Nadu',
    lat: 10.787,
    lng: 79.1378,
    rating: 4.9,
    reviews: 39,
    avail: true,
    owner: 'Selvam Murugan',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98421 54321',
    hp: 50,
    fuelType: 'Diesel',
    operatorIncluded: false,
    securityDeposit: 2500,
    specs: [
      { label: 'Row Capacity', labelTa: 'வரிசை திறன்', value: '9 or 11 Tynes' },
      { label: 'Mechanism', labelTa: 'இயங்கும் முறை', value: 'Rotary Tiller + Seed/Fertilizer Delivery' },
      { label: 'Seed Hopper', labelTa: 'விதை தொட்டி', value: '80 kg Capacity' },
      { label: 'Fertilizer Hopper', labelTa: 'உர தொட்டி', value: '80 kg Capacity' },
    ],
    features: ['Simultaneous Tilling & Seeding', 'Paddy Residue Management', 'Precision Depth Control', 'Zero-Till Operation'],
    description:
      'Mahindra Super Seeder 3-in-1 seeding implement combining rotavator tillage, precision seed dispensing, and fertilizer placement directly into paddy residue without field burning.',
    descriptionTa:
      'மகிந்திரா சூப்பர் சீடர், அறுவடைக்கு பின் வைக்கோல் உள்ள நிலத்தில் நேரடியாக விதைக்க உதவும் 3-இன்-1 விதைப்பான்.',
  },
  {
    id: 'eq-seeding-2',
    name: 'John Deere Seed Drill',
    nameTa: 'ஜான் டீர் சீட் கம் உரம் டிரில்',
    category: 'Seeding',
    cat: 'Seeding',
    brand: 'John Deere',
    model: 'GreenSystem Seed Cum Fertilizer Drill',
    imageUrl: '/equipment/seeding/john-deere-seed-drill.jpg',
    img: '/equipment/seeding/john-deere-seed-drill.jpg',
    gallery: ['/equipment/seeding/john-deere-seed-drill.jpg'],
    price: '₹1,350/day',
    dailyRate: 1350,
    unit: '/day',
    location: 'Salem, Tamil Nadu',
    lat: 11.6643,
    lng: 78.146,
    rating: 4.8,
    reviews: 28,
    avail: true,
    owner: 'Selvam Murugan',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98421 54321',
    hp: 40,
    fuelType: 'Diesel',
    operatorIncluded: false,
    securityDeposit: 2500,
    specs: [
      { label: 'Rows', labelTa: 'வரிசைகள்', value: '9 Rows Adjustable Spacing' },
      { label: 'Metering Type', labelTa: 'அளவீட்டு வகை', value: 'Fluted Roller Metering' },
      { label: 'Depth Control', labelTa: 'ஆழ கட்டுப்பாடு', value: 'Spring Loaded Furrow Openers' },
      { label: 'Tractor Required', labelTa: 'டிராக்டர் தேவை', value: '35 - 50 HP' },
    ],
    features: ['Fluted Roller System', 'Dual Compartment Box', 'Uniform Depth Placement', 'Low Seed Damage'],
    description:
      'John Deere GreenSystem Seed Cum Fertilizer Drill with fluted roller metering ensuring uniform seed spacing and simultaneous root-zone fertilizer placement for wheat, pulses, and oilseeds.',
    descriptionTa:
      'ஜான் டீர் சீட் டிரில், ஒரே நேரத்தில் விதை மற்றும் உரத்தை சீரான ஆழத்தில் பதிக்க உதவும் நம்பகமான விதைப்பான்.',
  },
  {
    id: 'eq-seeding-3',
    name: 'Shaktiman Pneumatic Planter',
    nameTa: 'சக்திமான் நியூமேடிக் பிளான்டர்',
    category: 'Seeding',
    cat: 'Seeding',
    brand: 'Shaktiman',
    model: 'SVPP 4-Row Precision Planter',
    imageUrl: '/equipment/seeding/shaktiman-pneumatic-planter.jpg',
    img: '/equipment/seeding/shaktiman-pneumatic-planter.jpg',
    gallery: ['/equipment/seeding/shaktiman-pneumatic-planter.jpg'],
    price: '₹1,800/day',
    dailyRate: 1800,
    unit: '/day',
    location: 'Dindigul, Tamil Nadu',
    lat: 10.3673,
    lng: 77.9803,
    rating: 4.9,
    reviews: 22,
    avail: true,
    owner: 'Selvam Murugan',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98421 54321',
    hp: 50,
    fuelType: 'Diesel',
    operatorIncluded: false,
    securityDeposit: 3000,
    specs: [
      { label: 'Rows', labelTa: 'வரிசைகள்', value: '4 Rows (45 - 75 cm adjustable)' },
      { label: 'Technology', labelTa: 'தொழில்நுட்பம்', value: 'Pneumatic Vacuum Metering' },
      { label: 'Accuracy', labelTa: 'துல்லியம்', value: 'Single Seed Precision Sowing' },
      { label: 'Supported Crops', labelTa: 'பயிர்கள்', value: 'Corn, Cotton, Soybean, Sunflower' },
    ],
    features: ['Vacuum Metering Unit', 'Individual Parallelogram Row Units', 'Zero Seed Damage', 'Adjustable Row Distance'],
    description:
      'Shaktiman SVPP 4-row pneumatic precision planter utilizing vacuum suction technology for single-seed placement with exact plant-to-plant spacing in cotton, corn, and maize fields.',
    descriptionTa:
      'சக்திமான் நியூமேடிக் பிளான்டர், காற்று அழுத்த முறையில் விதைகளை துல்லிய இடைவெளியில் நடும் அதிநவீன இயந்திரம்.',
  },

  // =========================================================================
  // E. SPRAYERS & DRONES (3 Models)
  // =========================================================================
  {
    id: 'eq-drone-1',
    name: 'DJI Agras T40 Agricultural Drone',
    nameTa: 'டிஜேஐ அக்ராஸ் T40 விவசாய ட்ரோன்',
    category: 'Sprayers & Drones',
    cat: 'Sprayers & Drones',
    brand: 'DJI',
    model: 'Agras T40',
    imageUrl: '/equipment/sprayers-drones/dji-agras-t40.jpg',
    img: '/equipment/sprayers-drones/dji-agras-t40.jpg',
    gallery: ['/equipment/sprayers-drones/dji-agras-t40.jpg'],
    price: '₹2,800/day',
    dailyRate: 2800,
    unit: '/day',
    location: 'Coimbatore, Tamil Nadu',
    lat: 11.0168,
    lng: 76.9558,
    rating: 4.9,
    reviews: 76,
    avail: true,
    owner: 'Balvinder Singh',
    ownerId: 'usr-owner-2',
    ownerPhone: '+91 98140 87654',
    hp: 0,
    fuelType: 'Battery / Hybrid',
    operatorIncluded: true,
    securityDeposit: 5000,
    specs: [
      { label: 'Payload Capacity', labelTa: 'சுமை திறன்', value: '40 Litres Spray / 50 kg Spread' },
      { label: 'Spray Flow Rate', labelTa: 'தெளிக்கும் வேகம்', value: 'Up to 12 L/min Dual Atomized' },
      { label: 'Rotor Type', labelTa: 'ரோட்டார் வகை', value: 'Coaxial Twin Rotor' },
      { label: 'Radar', labelTa: 'ரேடார்', value: 'Active Phased Array + Binocular Vision' },
    ],
    features: ['DGCA Certified Drone', 'Certified Remote Pilot Included', 'Dual Atomized Sprayers', 'Omnidirectional Obstacle Avoidance'],
    description:
      'DJI Agras T40 flagship agricultural drone featuring coaxial twin rotor design, 40-litre spraying payload, dual atomized centrifugal nozzles, and active phased-array radar for 40 acres/hour coverage.',
    descriptionTa:
      'டிஜேஐ அக்ராஸ் T40 விவசாய ட்ரோன், 40 லிட்டர் கொள்ளளவு மற்றும் அதிநவீன ரேடார் அமைப்புடன் பயிர் தெளிப்புக்கு சிறந்தது.',
  },
  {
    id: 'eq-drone-2',
    name: 'Garuda Kisan Agricultural Drone',
    nameTa: 'கருடா கிசான் விவசாய ட்ரோன்',
    category: 'Sprayers & Drones',
    cat: 'Sprayers & Drones',
    brand: 'Garuda Aerospace',
    model: 'Agri Kisan Drone V2',
    imageUrl: '/equipment/sprayers-drones/garuda-kisan-drone.jpg',
    img: '/equipment/sprayers-drones/garuda-kisan-drone.jpg',
    gallery: ['/equipment/sprayers-drones/garuda-kisan-drone.jpg'],
    price: '₹2,200/day',
    dailyRate: 2200,
    unit: '/day',
    location: 'Erode, Tamil Nadu',
    lat: 11.341,
    lng: 77.7172,
    rating: 4.8,
    reviews: 43,
    avail: true,
    owner: 'Balvinder Singh',
    ownerId: 'usr-owner-2',
    ownerPhone: '+91 98140 87654',
    hp: 0,
    fuelType: 'Battery / Hybrid',
    operatorIncluded: true,
    securityDeposit: 4000,
    specs: [
      { label: 'Spray Tank', labelTa: 'தெளிப்பு தொட்டி', value: '10 - 12 Litres' },
      { label: 'Flight Time', labelTa: 'பறக்கும் நேரம்', value: 'Up to 25 mins per battery' },
      { label: 'Coverage', labelTa: 'பரப்பளவு', value: '6 - 8 acres per hour' },
      { label: 'Certification', labelTa: 'சான்றிதழ்', value: 'DGCA Type Certified (Make in India)' },
    ],
    features: ['DGCA Certified', 'Terrain Following Radar', 'Flow Sensor Control', 'Pilot Operator Included'],
    description:
      'Garuda Kisan DGCA-certified indigenous agricultural drone engineered for uniform pesticide and micronutrient spraying with terrain-following sensors and high-efficiency nozzles.',
    descriptionTa:
      'கருடா கிசான் இந்திய தயாரிப்பு விவசாய ட்ரோன், பயிர்களின் மீது பூச்சிக்கொல்லி மருந்தை சீராக தெளிக்க உகந்தது.',
  },
  {
    id: 'eq-sprayer-1',
    name: 'John Deere Field Sprayer',
    nameTa: 'ஜான் டீர் ஃபீல்ட் ஸ்ப்ரேயர்',
    category: 'Sprayers & Drones',
    cat: 'Sprayers & Drones',
    brand: 'John Deere',
    model: '4630 Self-Propelled Sprayer',
    imageUrl: '/equipment/sprayers-drones/john-deere-field-sprayer.jpg',
    img: '/equipment/sprayers-drones/john-deere-field-sprayer.jpg',
    gallery: ['/equipment/sprayers-drones/john-deere-field-sprayer.jpg'],
    price: '₹3,200/day',
    dailyRate: 3200,
    unit: '/day',
    location: 'Madurai, Tamil Nadu',
    lat: 9.9252,
    lng: 78.1198,
    rating: 4.8,
    reviews: 26,
    avail: true,
    owner: 'Selvam Murugan',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98421 54321',
    hp: 165,
    fuelType: 'Diesel',
    operatorIncluded: true,
    securityDeposit: 5000,
    specs: [
      { label: 'Tank Capacity', labelTa: 'தொட்டி கொள்ளளவு', value: '2,270 Litres (600 Gal)' },
      { label: 'Boom Width', labelTa: 'பூம் அகலம்', value: '80 - 90 Feet (24 - 27 m)' },
      { label: 'Crop Clearance', labelTa: 'பயிர் இடைவெளி', value: '1.27 m Underbody' },
      { label: 'Engine Power', labelTa: 'என்ஜின் திறன்', value: '165 HP John Deere PowerTech' },
    ],
    features: ['High Crop Clearance', 'Wide 80ft Spray Boom', 'Pressure Regulated Nozzles', 'Climate Controlled Cab'],
    description:
      'John Deere 4630 self-propelled commercial field sprayer with 165 HP engine, 2,270-litre tank, wide 80-foot boom, and high underbody clearance for mature cotton, maize, and sugarcane spraying.',
    descriptionTa:
      'ஜான் டீர் ஃபீல்ட் ஸ்ப்ரேயர், பரந்த தெளிப்பு கைகள் மற்றும் பெரிய தொட்டி வசதியுடன் கூடிய கனரக வயல் தெளிப்பான்.',
  },

  // =========================================================================
  // F. WATER PUMPS (3 Models)
  // =========================================================================
  {
    id: 'eq-pump-1',
    name: 'Kirloskar Diesel Water Pump',
    nameTa: 'கிர்லோஸ்கர் டீசல் நீர் பம்ப்',
    category: 'Water Pump',
    cat: 'Water Pump',
    brand: 'Kirloskar',
    model: '5 HP Diesel Engine Pumpset',
    imageUrl: '/equipment/water-pumps/kirloskar-diesel-water-pump.jpg',
    img: '/equipment/water-pumps/kirloskar-diesel-water-pump.jpg',
    gallery: ['/equipment/water-pumps/kirloskar-diesel-water-pump.jpg'],
    price: '₹600/day',
    dailyRate: 600,
    unit: '/day',
    location: 'Tiruchirappalli, Tamil Nadu',
    lat: 10.7905,
    lng: 78.7047,
    rating: 4.8,
    reviews: 54,
    avail: true,
    owner: 'Selvam Murugan',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98421 54321',
    hp: 5,
    fuelType: 'Diesel',
    operatorIncluded: false,
    securityDeposit: 1000,
    specs: [
      { label: 'Power', labelTa: 'திறன்', value: '5.0 HP Single Cylinder Diesel' },
      { label: 'Delivery Port', labelTa: 'வெளியேறும் குழாய்', value: '3" x 3" (75 mm)' },
      { label: 'Discharge Rate', labelTa: 'நீர் வெளியேற்றம்', value: '55,000 Litres/hour' },
      { label: 'Max Head', labelTa: 'அதிகபட்ச உயரம்', value: '18 - 24 metres' },
    ],
    features: ['Cast Iron Construction', 'Fuel Efficient Diesel Engine', 'Trolley Mounted Portable', 'Continuous Duty Run'],
    description:
      'Kirloskar 5 HP portable diesel water pumpset with 3-inch delivery port and 55,000 L/h flow capacity, ideal for flood irrigation, canals, and rural farms without reliable electricity.',
    descriptionTa:
      'கிர்லோஸ்கர் 5 HP டீசல் நீர் பம்ப் செட், மின்சாரம் இல்லாத இடங்களில் பாசனம் செய்ய உகந்த நம்பகமான டீசல் பம்ப்.',
  },
  {
    id: 'eq-pump-2',
    name: 'Texmo Solar Water Pump',
    nameTa: 'டெக்ஸ்மோ சோலார் நீர் பம்ப்',
    category: 'Water Pump',
    cat: 'Water Pump',
    brand: 'Texmo',
    model: 'Taro Solar Submersible Pumpset',
    imageUrl: '/equipment/water-pumps/texmo-solar-water-pump.jpg',
    img: '/equipment/water-pumps/texmo-solar-water-pump.jpg',
    gallery: ['/equipment/water-pumps/texmo-solar-water-pump.jpg'],
    price: '₹750/day',
    dailyRate: 750,
    unit: '/day',
    location: 'Coimbatore, Tamil Nadu',
    lat: 11.0168,
    lng: 76.9558,
    rating: 4.9,
    reviews: 40,
    avail: true,
    owner: 'Selvam Murugan',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98421 54321',
    hp: 3,
    fuelType: 'Solar / Electric',
    operatorIncluded: false,
    securityDeposit: 1500,
    specs: [
      { label: 'Power', labelTa: 'திறன்', value: '3.0 HP High-Efficiency DC Solar' },
      { label: 'Head Range', labelTa: 'தலைமை வரம்பு', value: 'Up to 80 metres' },
      { label: 'Discharge', labelTa: 'வெளியேற்றம்', value: '25,000 - 35,000 L/h' },
      { label: 'Pump Type', labelTa: 'பம்ப் வகை', value: 'Stainless Steel Borewell Submersible' },
    ],
    features: ['Zero Fuel Cost', 'Stainless Steel Construction', 'MPPT Solar Controller', 'Water Lubricated Motor'],
    description:
      'Texmo (Taro) 3 HP high-efficiency solar submersible pump system with MPPT controller, designed for sustainable, zero-electricity-cost deep borewell farm irrigation.',
    descriptionTa:
      'டெக்ஸ்மோ சோலார் சப்மெர்சிபிள் பம்ப், சூரிய சக்தியில் இயங்கும் சூழல் நட்பு மற்றும் செலவில்லா பாசன பம்ப்.',
  },
  {
    id: 'eq-pump-3',
    name: 'Kirloskar Electric Water Pump',
    nameTa: 'கிர்லோஸ்கர் எலக்ட்ரிக் மோனோபிளாக் பம்ப்',
    category: 'Water Pump',
    cat: 'Water Pump',
    brand: 'Kirloskar',
    model: 'KSMB Monobloc Centrifugal Pump',
    imageUrl: '/equipment/water-pumps/kirloskar-electric-water-pump.jpg',
    img: '/equipment/water-pumps/kirloskar-electric-water-pump.jpg',
    gallery: ['/equipment/water-pumps/kirloskar-electric-water-pump.jpg'],
    price: '₹450/day',
    dailyRate: 450,
    unit: '/day',
    location: 'Erode, Tamil Nadu',
    lat: 11.341,
    lng: 77.7172,
    rating: 4.7,
    reviews: 33,
    avail: true,
    owner: 'Selvam Murugan',
    ownerId: 'usr-owner-1',
    ownerPhone: '+91 98421 54321',
    hp: 2,
    fuelType: 'Solar / Electric',
    operatorIncluded: false,
    securityDeposit: 1000,
    specs: [
      { label: 'Power', labelTa: 'திறன்', value: '2.0 HP (1.5 kW) Single Phase' },
      { label: 'Delivery Port', labelTa: 'வெளியேறும் குழாய்', value: '2" x 2" (50 mm)' },
      { label: 'Discharge', labelTa: 'வெளியேற்றம்', value: '30,000 Litres/hour' },
      { label: 'Max Head', labelTa: 'அதிகபட்ச உயரம்', value: '28 metres' },
    ],
    features: ['Class F Insulation', 'CED Coated Anti-Rust Body', 'Thermal Overload Protector', 'Low Power Consumption'],
    description:
      'Kirloskar KSMB high-efficiency electric monobloc centrifugal pump with thermal overload protection, anti-corrosive coating, and dependable continuous flow for open well irrigation.',
    descriptionTa:
      'கிர்லோஸ்கர் எலக்ட்ரிக் மோனோபிளாக் பம்ப், திறந்தவெளி கிணறு மற்றும் தொட்டிகளில் இருந்து சீரான நீர் இறைக்க உகந்தது.',
  },
]

export const catalog: CatalogItem[] = SEED_CATALOG

const CATALOG_STORAGE_KEY = 'agrirent_custom_catalog_items'

export const STANDARD_CATEGORIES = [
  { value: 'Tractor', labelEn: 'Tractors', labelTa: 'டிராக்டர்கள் (Tractors)' },
  { value: 'Harvester', labelEn: 'Harvesters', labelTa: 'அறுவடை இயந்திரங்கள் (Harvesters)' },
  { value: 'Ploughing & Tilling', labelEn: 'Ploughing / Tillage', labelTa: 'உழவு / நிலம் பண்படுத்துதல் (Ploughing / Tillage)' },
  { value: 'Seeding', labelEn: 'Seeding', labelTa: 'விதைப்பு கருவிகள் (Seeding)' },
  { value: 'Sprayers & Drones', labelEn: 'Sprayers & Drones', labelTa: 'தெளிப்பான் & ட்ரோன்கள் (Sprayers & Drones)' },
  { value: 'Water Pump', labelEn: 'Water Pumps', labelTa: 'நீர் பம்புகள் (Water Pumps)' },
] as const

export function normalizeCategory(cat: string): string {
  const lower = (cat || '').toLowerCase().trim()
  if (lower.includes('tractor')) return 'Tractor'
  if (lower.includes('harvester') || lower.includes('combine')) return 'Harvester'
  if (
    lower.includes('plough') ||
    lower.includes('tillage') ||
    lower.includes('tiller') ||
    lower.includes('harrow') ||
    lower.includes('rotavator')
  ) {
    return 'Ploughing & Tilling'
  }
  if (lower.includes('seed') || lower.includes('planter')) return 'Seeding'
  if (lower.includes('spray') || lower.includes('drone')) return 'Sprayers & Drones'
  if (lower.includes('pump')) return 'Water Pump'
  return 'Tractor'
}

export function getCategoryCount(categoryName: string, items?: CatalogItem[]): number {
  const list = items || getFullCatalog()
  const cat = categoryName.toLowerCase().trim()
  return list.filter((item) => {
    const itemCat = (item.category || item.cat || '').toLowerCase().trim()
    return (
      itemCat === cat ||
      (cat.includes('plough') && (itemCat.includes('plough') || itemCat.includes('tillage'))) ||
      (cat.includes('tillage') && (itemCat.includes('plough') || itemCat.includes('tillage'))) ||
      (cat.includes('seeding') && (itemCat.includes('seeding') || itemCat.includes('seeder'))) ||
      (cat.includes('spray') && (itemCat.includes('spray') || itemCat.includes('drone'))) ||
      (cat.includes('drone') && (itemCat.includes('spray') || itemCat.includes('drone'))) ||
      (cat.includes('pump') && itemCat.includes('pump')) ||
      (cat.includes('tractor') && itemCat.includes('tractor')) ||
      (cat.includes('harvester') && itemCat.includes('harvester'))
    )
  }).length
}

export function getDynamicCategories(items?: CatalogItem[]): CatalogCategory[] {
  const list = items || getFullCatalog()
  return categories.map((cat) => {
    const countNum = getCategoryCount(cat.name, list)
    return {
      ...cat,
      count: `${countNum} ${countNum === 1 ? 'listing' : 'listings'}`,
    }
  })
}

export const PURCHASE_PRICE_MAP: Record<string, { purchasePrice: number; vendorId: string; vendorName: string }> = {
  'eq-tractor-1': { purchasePrice: 850000, vendorId: 'vnd-1', vendorName: 'Sri Murugan Mahindra Tractors & Implements' },
  'eq-tractor-2': { purchasePrice: 1120000, vendorId: 'vnd-3', vendorName: 'Deere PowerTech Agricultural Center' },
  'eq-tractor-3': { purchasePrice: 680000, vendorId: 'vnd-1', vendorName: 'Sri Murugan Mahindra Tractors & Implements' },
  'eq-harvester-1': { purchasePrice: 2450000, vendorId: 'vnd-4', vendorName: 'Kisan Harvester & Drone SuperStore' },
  'eq-harvester-2': { purchasePrice: 2200000, vendorId: 'vnd-4', vendorName: 'Kisan Harvester & Drone SuperStore' },
  'eq-harvester-3': { purchasePrice: 2100000, vendorId: 'vnd-2', vendorName: 'Cauvery Delta Agro Machinery & Implements Dealer' },
  'eq-tillage-1': { purchasePrice: 75000, vendorId: 'vnd-1', vendorName: 'Sri Murugan Mahindra Tractors & Implements' },
  'eq-tillage-2': { purchasePrice: 135000, vendorId: 'vnd-5', vendorName: 'Kongu Agro Implements & Spares Hub' },
  'eq-tillage-3': { purchasePrice: 88000, vendorId: 'vnd-2', vendorName: 'Cauvery Delta Agro Machinery & Implements Dealer' },
  'eq-seeding-1': { purchasePrice: 62000, vendorId: 'vnd-1', vendorName: 'Sri Murugan Mahindra Tractors & Implements' },
  'eq-seeding-2': { purchasePrice: 195000, vendorId: 'vnd-5', vendorName: 'Kongu Agro Implements & Spares Hub' },
  'eq-seeding-3': { purchasePrice: 84000, vendorId: 'vnd-2', vendorName: 'Cauvery Delta Agro Machinery & Implements Dealer' },
  'eq-drone-1': { purchasePrice: 980000, vendorId: 'vnd-4', vendorName: 'Kisan Harvester & Drone SuperStore' },
  'eq-drone-2': { purchasePrice: 550000, vendorId: 'vnd-4', vendorName: 'Kisan Harvester & Drone SuperStore' },
  'eq-drone-3': { purchasePrice: 145000, vendorId: 'vnd-5', vendorName: 'Kongu Agro Implements & Spares Hub' },
  'eq-pump-1': { purchasePrice: 42000, vendorId: 'vnd-2', vendorName: 'Cauvery Delta Agro Machinery & Implements Dealer' },
  'eq-pump-2': { purchasePrice: 175000, vendorId: 'vnd-5', vendorName: 'Kongu Agro Implements & Spares Hub' },
  'eq-pump-3': { purchasePrice: 58000, vendorId: 'vnd-1', vendorName: 'Sri Murugan Mahindra Tractors & Implements' },
}

function enrichItem(item: CatalogItem): CatalogItem {
  const p = PURCHASE_PRICE_MAP[item.id]
  return {
    ...item,
    availabilityType: item.availabilityType || 'both',
    purchasePrice: item.purchasePrice || p?.purchasePrice || (item.dailyRate * 350),
    vendorId: item.vendorId || p?.vendorId || 'vnd-1',
    vendorName: item.vendorName || p?.vendorName || 'Sri Murugan Mahindra Tractors & Implements',
  }
}

export function getFullCatalog(): CatalogItem[] {
  let list = SEED_CATALOG
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY)
      if (raw) {
        const customs: CatalogItem[] = JSON.parse(raw)
        const customIds = new Set(customs.map((c) => c.id))
        const remainingSeed = SEED_CATALOG.filter((s) => !customIds.has(s.id))
        list = [...customs, ...remainingSeed]
      }
    } catch {}
  }
  return list.map(enrichItem)
}

export function addCatalogItem(item: CatalogItem): void {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY)
    const existing: CatalogItem[] = raw ? JSON.parse(raw) : []
    const updated = [item, ...existing.filter((i) => i.id !== item.id)]
    window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('agrirent_catalog_updated', { detail: item }))
  } catch (e) {
    console.error('Failed to save custom catalog item to local storage:', e)
  }
}

export function updateCatalogItem(id: string, updates: Partial<CatalogItem>): void {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY)
    let customs: CatalogItem[] = raw ? JSON.parse(raw) : []
    const index = customs.findIndex((item) => item.id === id)
    if (index !== -1 && customs[index]) {
      customs[index] = { ...customs[index]!, ...updates }
    } else {
      const seed = SEED_CATALOG.find((s) => s.id === id)
      if (seed) {
        customs.unshift({ ...seed, ...updates })
      }
    }
    window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(customs))
    window.dispatchEvent(new CustomEvent('agrirent_catalog_updated', { detail: { id, updates } }))
  } catch (e) {
    console.error('Failed to update catalog item in local storage:', e)
  }
}

export function deleteCatalogItem(id: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY)
    let customs: CatalogItem[] = raw ? JSON.parse(raw) : []
    const initialLen = customs.length
    customs = customs.filter((item) => item.id !== id)
    window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(customs))
    window.dispatchEvent(new CustomEvent('agrirent_catalog_updated', { detail: { id, deleted: true } }))
    return customs.length < initialLen
  } catch (e) {
    console.error('Failed to delete catalog item from local storage:', e)
    return false
  }
}

export async function syncCatalogWithServer(): Promise<CatalogItem[]> {
  if (typeof window === 'undefined') return SEED_CATALOG
  try {
    const res = await fetch('/api/listings')
    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.listings)) {
        const serverListings: any[] = data.listings
        const seedIds = new Set(SEED_CATALOG.map((s) => s.id))
        const customItems: CatalogItem[] = serverListings
          .filter((l) => !seedIds.has(l.id))
          .map((l) => ({
            id: l.id,
            name: l.name,
            nameTa: l.nameTa || l.name,
            category: l.category,
            cat: l.category,
            brand: l.brand || l.name.split(' ')[0] || 'Custom Fleet',
            model: l.model || l.name,
            imageUrl: l.imageUrl || l.img || '/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg',
            img: l.img || l.imageUrl || '/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg',
            gallery: [l.img || l.imageUrl || '/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg'],
            description: l.description || '',
            descriptionTa: l.descriptionTa || l.description || '',
            price: `₹${Number(l.pricePerDay).toLocaleString('en-IN')}/day`,
            dailyRate: Number(l.pricePerDay),
            unit: '/day',
            location: l.location || 'Tamil Nadu',
            lat: l.lat,
            lng: l.lng,
            rating: l.rating || 5.0,
            reviews: l.reviews || 0,
            avail: l.available !== false,
            owner: l.ownerName || 'Verified Fleet Owner',
            ownerId: l.ownerId || '',
            ownerPhone: l.ownerPhone || '',
            securityDeposit: l.securityDeposit || 2000,
            pricePerHour: l.pricePerHour,
            condition: l.condition,
            year: l.year,
            minRentalDays: l.minRentalDays,
            deliveryAvailable: l.deliveryAvailable,
            deliveryCharge: l.deliveryCharge,
            specs: l.specs || [],
            features: ['Owner Direct Fleet', 'Pre-inspected', 'Immediate Dispatch'],
            hp: typeof l.hp === 'number' ? l.hp : parseInt(l.hp) || undefined,
            fuelType: l.fuelType,
            operatorIncluded: l.operatorIncluded,
          }))

        window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(customItems))
        window.dispatchEvent(new CustomEvent('agrirent_catalog_updated'))
        return getFullCatalog()
      }
    }
  } catch (err) {
    console.warn('Could not sync catalog with server:', err)
  }
  return getFullCatalog()
}

export function findCatalogItem(id: string): CatalogItem | undefined {
  const all = getFullCatalog()
  return all.find((item) => item.id === id) || SEED_CATALOG.find((item) => item.id === id)
}

/**
 * Returns a sorted, unique list of all brands available in the catalog.
 */
export function getAllBrands(items?: CatalogItem[]): string[] {
  const list = items || getFullCatalog()
  const brandsSet = new Set<string>()
  for (const item of list) {
    if (item.brand && item.brand.trim()) {
      brandsSet.add(item.brand.trim())
    }
  }
  return Array.from(brandsSet).sort((a, b) => a.localeCompare(b))
}

/**
 * Searches and filters the equipment catalog.
 */
export function searchCatalog(
  items: CatalogItem[],
  query: string,
  filters?: CatalogFilters
): CatalogItem[] {
  const q = (query || '').trim().toLowerCase()

  const filtered: CatalogItem[] = items.filter((item) => {
    // 1. Text Search
    if (q) {
      const name = (item.name || '').toLowerCase()
      const nameTa = (item.nameTa || '').toLowerCase()
      const brand = (item.brand || '').toLowerCase()
      const model = (item.model || '').toLowerCase()
      const category = (item.category || item.cat || '').toLowerCase()
      const location = (item.location || '').toLowerCase()
      const description = (item.description || '').toLowerCase()

      const directMatch =
        name.includes(q) ||
        nameTa.includes(q) ||
        brand.includes(q) ||
        model.includes(q) ||
        category.includes(q) ||
        location.includes(q) ||
        description.includes(q)

      if (!directMatch) {
        if (q === 'drone' || q === 'drones') {
          if (!category.includes('drone') && !name.includes('drone')) return false
        } else if (q === 'tractor' || q === 'tractors') {
          if (!category.includes('tractor') && !name.includes('tractor')) return false
        } else if (q === 'harvester' || q === 'combine') {
          if (!category.includes('harvester') && !name.includes('harvester')) return false
        } else if (q === 'tiller' || q === 'rotavator' || q === 'plough' || q === 'plow' || q === 'harrow' || q === 'tillage') {
          if (!category.includes('tilling') && !name.includes('tiller') && !name.includes('plough') && !name.includes('harrow')) return false
        } else if (q === 'sprayer' || q === 'spray') {
          if (!category.includes('sprayer') && !name.includes('sprayer') && !category.includes('drone')) return false
        } else if (q === 'seeder' || q === 'planter' || q === 'seed') {
          if (!category.includes('seeding') && !name.includes('planter') && !name.includes('seed')) return false
        } else if (q === 'pump' || q === 'pumps') {
          if (!category.includes('pump') && !name.includes('pump')) return false
        } else {
          return false
        }
      }
    }

    // 2. Category Filter
    if (filters?.category && filters.category !== 'All') {
      const cat = filters.category.toLowerCase().trim()
      const itemCat = (item.category || item.cat || '').toLowerCase().trim()
      
      const match =
        itemCat === cat ||
        (cat.includes('plough') && (itemCat.includes('plough') || itemCat.includes('tillage'))) ||
        (cat.includes('tillage') && (itemCat.includes('plough') || itemCat.includes('tillage'))) ||
        (cat.includes('seeding') && (itemCat.includes('seeding') || itemCat.includes('seeder'))) ||
        (cat.includes('spray') && (itemCat.includes('spray') || itemCat.includes('drone'))) ||
        (cat.includes('drone') && (itemCat.includes('spray') || itemCat.includes('drone'))) ||
        (cat.includes('pump') && itemCat.includes('pump')) ||
        (cat.includes('tractor') && itemCat.includes('tractor')) ||
        (cat.includes('harvester') && itemCat.includes('harvester'))

      if (!match) return false
    }

    // 3. Brand Filter
    if (filters?.brand && filters.brand !== 'All') {
      if (item.brand?.toLowerCase() !== filters.brand.toLowerCase()) {
        return false
      }
    }

    // 4. Max Price Filter
    if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
      if (item.dailyRate > filters.maxPrice) {
        return false
      }
    }

    // 5. Min Price Filter
    if (filters?.minPrice !== undefined && filters.minPrice > 0) {
      if (item.dailyRate < filters.minPrice) {
        return false
      }
    }

    // 6. Availability Filter
    if (filters?.availableOnly) {
      if (!item.avail) {
        return false
      }
    }

    // 7. Location Filter
    if (filters?.location && filters.location !== 'All Locations' && filters.location !== 'All') {
      const locTarget = (filters.location.split(',')[0] || '').trim().toLowerCase()
      if (!item.location.toLowerCase().includes(locTarget)) {
        return false
      }
    }

    // 8. Rating Filter
    if (filters?.minRating && filters.minRating > 0) {
      if ((item.rating || 0) < filters.minRating) {
        return false
      }
    }

    // 9. Availability Mode (Rent vs Buy)
    if (filters?.availability && filters.availability !== 'both') {
      if (filters.availability === 'rent') {
        if (item.availabilityType === 'buy') return false
      } else if (filters.availability === 'buy') {
        if (item.availabilityType === 'rent' && (!item.purchasePrice || item.purchasePrice === 0)) return false
      }
    }

    return true
  })

  // Sorting
  if (filters?.sortBy) {
    if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (filters.sortBy === 'reviews') {
      filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    } else if (filters.sortBy === 'price_asc') {
      filtered.sort((a, b) => a.dailyRate - b.dailyRate)
    } else if (filters.sortBy === 'price_desc') {
      filtered.sort((a, b) => b.dailyRate - a.dailyRate)
    }
  }

  return filtered
}
