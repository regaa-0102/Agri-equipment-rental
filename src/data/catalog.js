import { catalog, categories as tsCategories } from '../lib/catalog'

export const categories = tsCategories.map(c => ({
  name: c.name,
  nameTa: c.nameTa,
  icon: c.icon,
  count: c.count,
  kind: c.kind === 'machine' ? 'equipment' : 'resource',
  image: c.image,
}))

export const listings = catalog.map(item => ({
  id: item.id,
  name: item.name,
  nameTa: item.nameTa,
  category: item.cat,
  type: item.cat === 'Seeds' ? 'resource' : 'equipment',
  image: item.img,
  location: item.location,
  price: item.dailyRate,
  rating: item.rating,
  availability: item.avail,
  available: item.avail,
  description: item.description,
  owner: item.owner,
  ownerPhone: item.ownerPhone,
  reviews: item.reviews,
  unit: item.unit.replace('/', ''),
  specs: item.specs?.map(s => `${s.label}: ${s.value}`) || ['Verified Listing', 'Farm Tested'],
}))

export const equipmentCategories = categories.filter(c => c.kind === 'equipment')
export const productCategories = categories.filter(c => c.kind === 'resource')
export const popularCategories = equipmentCategories.slice(0, 8)
