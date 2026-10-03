import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import {
  categoryNames,
  addCatalogItem,
  updateCatalogItem,
  findCatalogItem,
  getCategoryFallback,
  CatalogItem,
  STANDARD_CATEGORIES,
  normalizeCategory,
  tamilNaduDistricts,
} from '../lib/catalog'
import { useLanguage } from '../context/LanguageContext'
import { api, getStoredUser } from '../lib/api-client'
import { addNotification } from '../lib/notifications'
import {
  CheckCircle2,
  Upload,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Tractor,
  Layers,
  DollarSign,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Thanjavur: { lat: 10.787, lng: 79.1378 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  Salem: { lat: 11.6643, lng: 78.146 },
  Erode: { lat: 11.341, lng: 77.7172 },
  Tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  Dindigul: { lat: 10.3673, lng: 77.9803 },
  Tirunelveli: { lat: 8.7139, lng: 77.7567 },
  Vellore: { lat: 12.9165, lng: 79.1325 },
  Cuddalore: { lat: 11.748, lng: 79.7714 },
  Nagapattinam: { lat: 10.7672, lng: 79.8449 },
  Villupuram: { lat: 11.9401, lng: 79.4861 },
}

export default function AddEquipment({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const currentUser = getStoredUser()

  // Detect Edit Mode if an equipment ID was stored for editing
  const [editId, setEditId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  // Step 1: Basic Information
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [category, setCategory] = useState<string>('Tractor')
  const [description, setDescription] = useState('')

  // Step 2: Adaptive Specifications
  const [hp, setHp] = useState('')
  const [fuelType, setFuelType] = useState('Diesel')
  const [transmission, setTransmission] = useState('Synchromesh')
  const [year, setYear] = useState('2024')
  const [condition, setCondition] = useState('Excellent')
  const [operatorIncluded, setOperatorIncluded] = useState(true)

  // Harvester specific
  const [cuttingWidth, setCuttingWidth] = useState('7.5 feet')
  const [grainTankCapacity, setGrainTankCapacity] = useState('1,200 Litres')

  // Tillage & Seeding specific
  const [workingWidth, setWorkingWidth] = useState('6 feet (42 blades)')
  const [numberOfRows, setNumberOfRows] = useState('9 Rows')
  const [tinesBlades, setTinesBlades] = useState('3 Bottom MB Reversible')

  // Sprayer & Drone specific
  const [tankCapacity, setTankCapacity] = useState('40 Litres')
  const [flightTime, setFlightTime] = useState('15 - 20 mins')
  const [coverageArea, setCoverageArea] = useState('40 acres / day')

  // Water Pump specific
  const [pumpType, setPumpType] = useState('Centrifugal Monobloc')
  const [flowRate, setFlowRate] = useState('35,000 Litres / hr')
  const [maxHead, setMaxHead] = useState('32 metres')

  // Step 3: Rental & Location Details
  const [pricePerDay, setPricePerDay] = useState('1800')
  const [pricePerHour, setPricePerHour] = useState('')
  const [securityDeposit, setSecurityDeposit] = useState('3000')
  const [minRentalDays, setMinRentalDays] = useState('1')
  const [deliveryAvailable, setDeliveryAvailable] = useState(true)
  const [deliveryCharge, setDeliveryCharge] = useState('500')
  const [district, setDistrict] = useState('Coimbatore')
  const [fullAddress, setFullAddress] = useState('')

  // Step 4: Equipment Image
  const [uploadedImage, setUploadedImage] = useState<string>('')
  const [imageFileName, setImageFileName] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successItem, setSuccessItem] = useState<CatalogItem | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Load existing equipment if in Edit mode
  useEffect(() => {
    try {
      const storedEditId = window.localStorage.getItem('agrirent_edit_equipment_id')
      if (storedEditId) {
        setEditId(storedEditId)
        const item = findCatalogItem(storedEditId)
        if (item) {
          setName(item.name)
          setBrand(item.brand || '')
          setModel(item.model || '')
          setCategory(normalizeCategory(item.category || item.cat))
          setDescription(item.description || '')
          setPricePerDay(String(item.dailyRate || 1800))
          if (item.pricePerHour) setPricePerHour(String(item.pricePerHour))
          if (item.securityDeposit) setSecurityDeposit(String(item.securityDeposit))
          if (item.minRentalDays) setMinRentalDays(String(item.minRentalDays))
          setDeliveryAvailable(item.deliveryAvailable !== false)
          if (item.deliveryCharge) setDeliveryCharge(String(item.deliveryCharge))
          if (item.condition) setCondition(item.condition)
          if (item.year) setYear(item.year)
          if (item.hp) setHp(String(item.hp))
          if (item.fuelType) setFuelType(item.fuelType)
          setOperatorIncluded(Boolean(item.operatorIncluded))
          if (item.imageUrl || item.img) {
            setUploadedImage(item.imageUrl || item.img)
            setImageFileName('Current Equipment Image')
          }
          const locParts = (item.location || '').split(',')
          const distCandidate = (locParts[0] || '').trim()
          if (tamilNaduDistricts.includes(distCandidate)) {
            setDistrict(distCandidate)
          }
        }
      } else {
        // Preset sample defaults for ease of demonstration if new
        setName('Swaraj 744 FE')
        setBrand('Swaraj')
        setModel('744 FE')
        setCategory('Tractor')
        setDescription('48 HP 3-Cylinder fuel-efficient tractor with multispeed reverse PTO, smooth power steering and high lifting capacity. Ideal for cultivation, haulage, and rotavator operations.')
        setHp('48')
        setPricePerDay('1500')
        setSecurityDeposit('2500')
        setDistrict('Thoothukudi')
      }
    } catch (e) {
      console.error('Error reading edit state:', e)
    }
  }, [])

  // Handle Image File Upload with Data URL
  const handleImageFile = (file: File) => {
    setErrorMessage(null)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setErrorMessage(
        isTamil
          ? 'செல்லுபடியாகும் படக் கோப்பை பதிவேற்றவும் (JPG, JPEG, PNG, WEBP).'
          : 'Please upload a valid image file (JPG, JPEG, PNG, or WEBP).'
      )
      return
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(
        isTamil
          ? 'படத்தின் அளவு 10MB-க்குள் இருக்க வேண்டும்.'
          : 'Image file size must be less than 10MB.'
      )
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (dataUrl) {
        setUploadedImage(dataUrl)
        setImageFileName(file.name)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0])
    }
  }

  // Validate step before advancing
  const validateStep = (step: number): boolean => {
    setErrorMessage(null)
    if (step === 1) {
      if (!name.trim()) {
        setErrorMessage(isTamil ? 'உபகரணத்தின் பெயர் தேவை' : 'Equipment Name is required.')
        return false
      }
      if (!brand.trim()) {
        setErrorMessage(isTamil ? 'பிராண்ட் / உற்பத்தியாளர் பெயர் தேவை' : 'Brand / Manufacturer is required.')
        return false
      }
      if (!model.trim()) {
        setErrorMessage(isTamil ? 'மாடல் பெயர் தேவை' : 'Model is required.')
        return false
      }
      if (!description.trim()) {
        setErrorMessage(isTamil ? 'விளக்கம் தேவை' : 'Description is required.')
        return false
      }
    } else if (step === 3) {
      const rate = Number(pricePerDay)
      if (isNaN(rate) || rate <= 0) {
        setErrorMessage(isTamil ? 'செல்லுபடியான ஒரு நாள் வாடகைத் தொகையை உள்ளிடவும்' : 'Please enter a valid rental rate per day (greater than 0).')
        return false
      }
      const deposit = Number(securityDeposit)
      if (isNaN(deposit) || deposit < 0) {
        setErrorMessage(isTamil ? 'செல்லுபடியான முன்பணத்தை உள்ளிடவும்' : 'Please enter a valid security deposit.')
        return false
      }
    } else if (step === 4) {
      if (!uploadedImage.trim()) {
        setErrorMessage(isTamil ? 'உபகரணத்தின் படம் பதிவேற்றப்பட வேண்டும்.' : 'Equipment image is required. Please upload a photo.')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => (prev + 1) as any)
      }
    }
  }

  const handleBack = () => {
    setErrorMessage(null)
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any)
    }
  }

  // Final Publish Handler
  const handlePublish = async () => {
    if (!validateStep(1) || !validateStep(3) || !validateStep(4)) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    const normalizedCat = normalizeCategory(category)
    const priceNum = Number(pricePerDay) || 1500
    const depositNum = Number(securityDeposit) || 2000
    const priceHrNum = pricePerHour.trim() ? Number(pricePerHour) : undefined
    const minDaysNum = Number(minRentalDays) || 1
    const delivChargeNum = Number(deliveryCharge) || 0

    const coords = LOCATION_COORDINATES[district] || { lat: 10.998, lng: 76.96 }
    const locationString = `${district}, Tamil Nadu`

    // Owner info from authenticated user or fallback demo owner
    const ownerName = currentUser?.name || 'Selvam Murugan'
    const ownerPhone = currentUser?.phone || '+91 94432 10987'
    const ownerId = currentUser?.id || 'usr-owner-1'

    // Construct adaptive specs
    const specsList = [
      { label: 'Brand', labelTa: 'பிராண்ட்', value: brand.trim() },
      { label: 'Model', labelTa: 'மாடல்', value: model.trim() },
      { label: 'Condition', labelTa: 'நிலை', value: condition },
      { label: 'Manufacturing Year', labelTa: 'உற்பத்தி ஆண்டு', value: year },
    ]

    if (normalizedCat === 'Tractor') {
      if (hp) specsList.push({ label: 'Horsepower', labelTa: 'இயந்திர திறன்', value: `${hp} HP` })
      specsList.push({ label: 'Fuel Type', labelTa: 'எரிபொருள் வகை', value: fuelType })
      specsList.push({ label: 'Transmission', labelTa: 'டிரான்ஸ்மிஷன்', value: transmission })
      specsList.push({ label: 'Operator Included', labelTa: 'இயக்குனர்', value: operatorIncluded ? 'Yes' : 'No' })
    } else if (normalizedCat === 'Harvester') {
      if (hp) specsList.push({ label: 'Engine Power', labelTa: 'இயந்திர திறன்', value: `${hp} HP` })
      specsList.push({ label: 'Cutting Width', labelTa: 'அறுக்கும் அகலம்', value: cuttingWidth })
      specsList.push({ label: 'Grain Tank Capacity', labelTa: 'தானிய தொட்டி அளவு', value: grainTankCapacity })
      specsList.push({ label: 'Operator Included', labelTa: 'இயக்குனர்', value: operatorIncluded ? 'Yes' : 'No' })
    } else if (normalizedCat === 'Ploughing & Tilling') {
      specsList.push({ label: 'Working Width', labelTa: 'பணி அகலம்', value: workingWidth })
      specsList.push({ label: 'Blades / Tines', labelTa: 'பிளேடுகள் / அமைப்புகள்', value: tinesBlades })
      if (hp) specsList.push({ label: 'Power Required', labelTa: 'தேவைப்படும் திறன்', value: `${hp} HP Tractor` })
    } else if (normalizedCat === 'Seeding') {
      specsList.push({ label: 'Number of Rows', labelTa: 'வரிசைகள்', value: numberOfRows })
      specsList.push({ label: 'Working Width', labelTa: 'பணி அகலம்', value: workingWidth })
      if (hp) specsList.push({ label: 'Power Required', labelTa: 'தேவைப்படும் திறன்', value: `${hp} HP Tractor` })
    } else if (normalizedCat === 'Sprayers & Drones') {
      specsList.push({ label: 'Tank Capacity', labelTa: 'மருந்து தொட்டி அளவு', value: tankCapacity })
      specsList.push({ label: 'Flight / Run Time', labelTa: 'பறக்கும் நேரம்', value: flightTime })
      specsList.push({ label: 'Daily Coverage', labelTa: 'தினசரி தெளிக்கும் பரப்பு', value: coverageArea })
    } else if (normalizedCat === 'Water Pump') {
      specsList.push({ label: 'Pump Type', labelTa: 'பம்ப் வகை', value: pumpType })
      specsList.push({ label: 'Flow Rate', labelTa: 'வெளியேற்றம்', value: flowRate })
      specsList.push({ label: 'Max Head', labelTa: 'அதிகபட்ச உயரம்', value: maxHead })
      if (hp) specsList.push({ label: 'Motor Power', labelTa: 'மோட்டார் திறன்', value: `${hp} HP` })
    }

    const finalImage = uploadedImage.trim() || getCategoryFallback(normalizedCat)
    const listingId = editId || `eq-owner-${Date.now().toString(36)}`

    const itemRecord: CatalogItem = {
      id: listingId,
      name: name.trim(),
      nameTa: name.trim(),
      category: normalizedCat,
      cat: normalizedCat,
      brand: brand.trim(),
      model: model.trim(),
      imageUrl: finalImage,
      img: finalImage,
      gallery: [finalImage],
      description: description.trim(),
      descriptionTa: `${name.trim()} - ${description.trim()}`,
      price: `₹${priceNum.toLocaleString('en-IN')}/day`,
      dailyRate: priceNum,
      pricePerHour: priceHrNum,
      unit: isTamil ? '/நாள்' : '/day',
      rating: 5.0,
      reviews: 0,
      avail: true,
      location: locationString,
      lat: coords.lat,
      lng: coords.lng,
      securityDeposit: depositNum,
      minRentalDays: minDaysNum,
      deliveryAvailable,
      deliveryCharge: delivChargeNum,
      condition,
      year,
      owner: ownerName,
      ownerPhone: ownerPhone,
      ownerId: ownerId,
      specs: specsList,
      features: ['Owner Direct Fleet', 'Pre-inspected', 'Immediate Dispatch'],
      hp: hp ? Number(hp) || undefined : undefined,
      fuelType: fuelType as any,
      operatorIncluded,
    }

    try {
      if (editId) {
        // Edit existing listing
        updateCatalogItem(editId, itemRecord)
        try {
          await api.updateListing(editId, {
            name: itemRecord.name,
            category: itemRecord.category,
            brand: itemRecord.brand,
            model: itemRecord.model,
            description: itemRecord.description,
            pricePerDay: priceNum,
            pricePerHour: priceHrNum,
            securityDeposit: depositNum,
            minRentalDays: minDaysNum,
            deliveryAvailable,
            deliveryCharge: delivChargeNum,
            location: locationString,
            img: finalImage,
            condition,
            year,
            specs: specsList,
            hp: hp ? `${hp} HP` : undefined,
            fuelType,
            operatorIncluded,
          })
        } catch (apiErr) {
          console.warn('Backend update sync note:', apiErr)
        }

        window.localStorage.removeItem('agrirent_edit_equipment_id')
      } else {
        // Create new listing
        addCatalogItem(itemRecord)
        try {
          await api.createListing({
            name: itemRecord.name,
            category: itemRecord.category,
            brand: itemRecord.brand,
            model: itemRecord.model,
            description: itemRecord.description,
            pricePerDay: priceNum,
            pricePerHour: priceHrNum,
            securityDeposit: depositNum,
            minRentalDays: minDaysNum,
            deliveryAvailable,
            deliveryCharge: delivChargeNum,
            location: locationString,
            lat: coords.lat,
            lng: coords.lng,
            img: finalImage,
            condition,
            year,
            specs: specsList,
            hp: hp ? `${hp} HP` : undefined,
            fuelType,
            operatorIncluded,
          })
        } catch (apiErr) {
          console.warn('Backend create sync note:', apiErr)
        }

        addNotification({
          userId: ownerId,
          title: isTamil ? `உபகரணம் சேர்க்கப்பட்டது: ${name}` : `Equipment Added: ${name}`,
          message: isTamil
            ? `உங்கள் ${name} வெற்றிகரமாக சேர்க்கப்பட்டது மற்றும் ${category} பிரிவில் நேரலையில் உள்ளது.`
            : `Your ${name} has been successfully listed for rental and is live under ${category}.`,
          type: 'equipment_added',
          relatedId: listingId,
        })
      }

      setSuccessItem(itemRecord)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to publish equipment. Please check details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form for adding another equipment
  const handleAddAnother = () => {
    window.localStorage.removeItem('agrirent_edit_equipment_id')
    setEditId(null)
    setSuccessItem(null)
    setCurrentStep(1)
    setName('')
    setBrand('')
    setModel('')
    setDescription('')
    setUploadedImage('')
    setImageFileName('')
    setHp('')
  }

  // =========================================================================
  // SUCCESS SCREEN
  // =========================================================================
  if (successItem) {
    return (
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F9FAFB' }}>
        <Sidebar activeItem="Add Equipment" onNavigate={onNavigate} role="owner" />
        <div style={{ flex: 1, minWidth: 0, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            className="card-shadow"
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: 40,
              maxWidth: 620,
              width: '100%',
              textAlign: 'center',
              border: '1px solid #E5E7EB',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                background: PM,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: P,
              }}
            >
              <CheckCircle2 size={42} />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>
              {editId
                ? (isTamil ? 'உபகரணம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது' : 'Equipment Updated Successfully')
                : (isTamil ? 'உபகரணம் வெற்றிகரமாக சேர்க்கப்பட்டது' : 'Equipment Added Successfully')}
            </h2>

            <p style={{ color: '#4B5563', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
              <strong>{successItem.name}</strong> {isTamil ? 'வெற்றிகரமாக உங்கள் பட்டியலில் சேர்க்கப்பட்டது. இது இப்போது' : 'has been added successfully to your listings and is now live in the'}{' '}
              <strong style={{ color: P }}>{successItem.category}</strong> {isTamil ? 'பிரிவில் கிடைக்கும்.' : 'catalog.'}
            </p>

            {/* Equipment Preview Snapshot */}
            <div
              style={{
                background: '#F9FAFB',
                borderRadius: 16,
                padding: 16,
                marginBottom: 28,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                textAlign: 'left',
                border: '1px solid #E5E7EB',
              }}
            >
              <img
                src={successItem.img}
                alt={successItem.name}
                style={{ width: 84, height: 70, borderRadius: 10, objectFit: 'cover', background: '#E5E7EB', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: P, textTransform: 'uppercase' }}>
                  {successItem.category}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '2px 0 4px' }}>
                  {successItem.name}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  <strong>{successItem.price}</strong> • {successItem.location}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: 14, fontWeight: 700, borderRadius: 12 }}
              >
                {isTamil ? 'முக்கிய பட்டியலை பார்க்கவும்' : 'View Equipment in Main Catalog'}
              </button>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleAddAnother}
                  className="btn-outline"
                  style={{ flex: 1, padding: '12px', fontSize: 14, fontWeight: 700, borderRadius: 12 }}
                >
                  + {isTamil ? 'மற்றொரு உபகரணம் சேர்க்க' : 'Add Another Equipment'}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('owner-dashboard')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: 14,
                    fontWeight: 700,
                    borderRadius: 12,
                    background: '#F3F4F6',
                    color: '#374151',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isTamil ? 'உரிமையாளர் டாஷ்போர்டு' : 'Owner Dashboard'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // MAIN FORM
  // =========================================================================
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F9FAFB' }}>
      <Sidebar activeItem="Add Equipment" onNavigate={onNavigate} role="owner" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {/* Top Header */}
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid #E5E7EB',
            padding: '16px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
              {editId
                ? (isTamil ? 'உபகரணத்தைத் திருத்தவும்' : 'Edit Equipment Listing')
                : (isTamil ? 'புதிய உபகரணத்தைச் சேர்க்கவும்' : 'Add Agricultural Equipment')}
            </h1>
            <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
              {isTamil
                ? 'உங்கள் விவசாய உபகரணத்தின் விவரங்களை உள்ளிட்டு நேரடியாக வெளியிடவும்.'
                : 'Complete the details below to list your tractor or machinery on the AgriRent marketplace.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => onNavigate('owner-dashboard')}
              className="btn-outline"
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              {t('Cancel')}
            </button>
          </div>
        </div>

        <div style={{ padding: '28px', maxWidth: 960, margin: '0 auto' }}>
          {/* Multi-step progress tabs */}
          <div
            style={{
              display: 'flex',
              background: '#fff',
              borderRadius: 16,
              padding: '8px',
              border: '1px solid #E5E7EB',
              marginBottom: 24,
              overflowX: 'auto',
            }}
          >
            {[
              { step: 1, label: isTamil ? '1. அடிப்படை விவரங்கள்' : '1. Basic Info', icon: Tractor },
              { step: 2, label: isTamil ? '2. தொழில்நுட்ப விவரங்கள்' : '2. Specifications', icon: Layers },
              { step: 3, label: isTamil ? '3. வாடகை & இருப்பிடம்' : '3. Rental & Location', icon: DollarSign },
              { step: 4, label: isTamil ? '4. படம் பதிவேற்றம்' : '4. Equipment Image', icon: ImageIcon },
              { step: 5, label: isTamil ? '5. மதிப்பாய்வு & வெளியிடு' : '5. Review & Publish', icon: Sparkles },
            ].map(({ step, label, icon: StepIcon }) => {
              const isActive = currentStep === step
              const isPast = currentStep > step
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => {
                    if (step < currentStep || validateStep(currentStep)) {
                      setCurrentStep(step as any)
                    }
                  }}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: 'none',
                    background: isActive ? P : isPast ? PM : 'transparent',
                    color: isActive ? '#fff' : isPast ? P : '#6B7280',
                    fontWeight: isActive || isPast ? 700 : 500,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <StepIcon size={14} />
                  <span>{label}</span>
                  {isPast && <Check size={13} strokeWidth={3} />}
                </button>
              )
            })}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 14,
                padding: '14px 18px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#B91C1C',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Container */}
          <div
            className="card-shadow"
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '32px',
              border: '1px solid #E5E7EB',
            }}
          >
            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: 14 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
                    {isTamil ? 'உபகரணத்தின் அடிப்படை விவரங்கள்' : 'Equipment Basic Information'}
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
                    {isTamil ? 'உபகரணத்தின் பெயர், பிராண்ட், மாடல் மற்றும் வகையைத் தேர்வு செய்யவும்.' : 'Enter the complete model name, brand and category.'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      {isTamil ? 'உபகரணத்தின் முழுப் பெயர் *' : 'Equipment Name *'}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Swaraj 744 FE / Mahindra 575 DI"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      {isTamil ? 'வகை (Category) *' : 'Category *'}
                    </label>
                    <select
                      className="input-field"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      {STANDARD_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {isTamil ? c.labelTa : c.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      {isTamil ? 'பிராண்ட் / உற்பத்தியாளர் *' : 'Brand / Manufacturer *'}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Swaraj, Mahindra, John Deere, Kubota"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      {isTamil ? 'மாடல் *' : 'Model *'}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 744 FE, 5310, Crop Tiger 30"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                    {isTamil ? 'விளக்கம் (Description) *' : 'Equipment Description *'}
                  </label>
                  <textarea
                    rows={4}
                    className="input-field"
                    placeholder="Describe condition, suitable farming operations, attachments, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Adaptive Specifications */}
            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: 14 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
                    {isTamil ? `${category} தொழில்நுட்ப விவரங்கள்` : `${category} Specifications`}
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
                    {isTamil ? 'தேர்வு செய்யப்பட்ட வகைக்குரிய சிறப்பம்சங்களை உள்ளிடவும்.' : 'Enter technical specifications specific to this equipment category.'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                  {/* Common: Year & Condition */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      {isTamil ? 'உற்பத்தி ஆண்டு' : 'Manufacturing Year'}
                    </label>
                    <select className="input-field" value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%' }}>
                      {['2026', '2025', '2024', '2023', '2022', '2021', '2020'].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      {isTamil ? 'இயந்திரத்தின் நிலை' : 'Equipment Condition'}
                    </label>
                    <select className="input-field" value={condition} onChange={(e) => setCondition(e.target.value)} style={{ width: '100%' }}>
                      <option value="Excellent">{isTamil ? 'சிறந்தது (Excellent)' : 'Excellent'}</option>
                      <option value="Good">{isTamil ? 'நன்றாக உள்ளது (Good)' : 'Good'}</option>
                      <option value="Fair">{isTamil ? 'மிதமானது (Fair)' : 'Fair'}</option>
                    </select>
                  </div>

                  {/* Adaptive per category */}
                  {category === 'Tractor' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'குதிரைத்திறன் (Horsepower HP)' : 'Horsepower (HP)'}
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="e.g. 50"
                          value={hp}
                          onChange={(e) => setHp(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'எரிபொருள் வகை' : 'Fuel Type'}
                        </label>
                        <select className="input-field" value={fuelType} onChange={(e) => setFuelType(e.target.value)} style={{ width: '100%' }}>
                          <option value="Diesel">Diesel</option>
                          <option value="Electric">Electric / Battery</option>
                          <option value="Petrol">Petrol</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'டிரான்ஸ்மிஷன் வகை' : 'Transmission'}
                        </label>
                        <select className="input-field" value={transmission} onChange={(e) => setTransmission(e.target.value)} style={{ width: '100%' }}>
                          <option value="Synchromesh">Synchromesh</option>
                          <option value="Constant Mesh">Constant Mesh</option>
                          <option value="Sliding Mesh">Sliding Mesh</option>
                          <option value="Hydrostatic">Hydrostatic</option>
                        </select>
                      </div>
                    </>
                  )}

                  {category === 'Harvester' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'இயந்திர திறன் (HP)' : 'Engine Power (HP)'}
                        </label>
                        <input type="number" className="input-field" placeholder="e.g. 76" value={hp} onChange={(e) => setHp(e.target.value)} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'வெட்டும் அகலம்' : 'Cutting Width'}
                        </label>
                        <input type="text" className="input-field" placeholder="e.g. 7.5 feet / 2.2 m" value={cuttingWidth} onChange={(e) => setCuttingWidth(e.target.value)} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'தானிய தொட்டி கொள்ளளவு' : 'Grain Tank Capacity'}
                        </label>
                        <input type="text" className="input-field" placeholder="e.g. 1,200 Litres" value={grainTankCapacity} onChange={(e) => setGrainTankCapacity(e.target.value)} style={{ width: '100%' }} />
                      </div>
                    </>
                  )}

                  {category === 'Ploughing & Tilling' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'பணி அகலம்' : 'Working Width'}
                        </label>
                        <input type="text" className="input-field" placeholder="e.g. 6 feet / 1.8 m" value={workingWidth} onChange={(e) => setWorkingWidth(e.target.value)} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'பிளேடுகள் / அமைப்புகள்' : 'Blades / Tines'}
                        </label>
                        <input type="text" className="input-field" placeholder="e.g. 42 L-Type Blades" value={tinesBlades} onChange={(e) => setTinesBlades(e.target.value)} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'தேவைப்படும் டிராக்டர் திறன் (HP)' : 'Tractor Power Required (HP)'}
                        </label>
                        <input type="number" className="input-field" placeholder="e.g. 45" value={hp} onChange={(e) => setHp(e.target.value)} style={{ width: '100%' }} />
                      </div>
                    </>
                  )}

                  {category === 'Seeding' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'வரிசைகளின் எண்ணிக்கை' : 'Number of Rows'}
                        </label>
                        <input type="text" className="input-field" placeholder="e.g. 9 Rows" value={numberOfRows} onChange={(e) => setNumberOfRows(e.target.value)} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'தேவைப்படும் டிராக்டர் திறன் (HP)' : 'Tractor Power Required (HP)'}
                        </label>
                        <input type="number" className="input-field" placeholder="e.g. 35" value={hp} onChange={(e) => setHp(e.target.value)} style={{ width: '100%' }} />
                      </div>
                    </>
                  )}

                  {category === 'Sprayers & Drones' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'தொட்டி கொள்ளளவு' : 'Tank Capacity'}
                        </label>
                        <input type="text" className="input-field" placeholder="e.g. 40 Litres" value={tankCapacity} onChange={(e) => setTankCapacity(e.target.value)} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'பறக்கும் நேரம் / பேட்டரி' : 'Flight Time / Battery'}
                        </label>
                        <input type="text" className="input-field" placeholder="e.g. 15-20 mins (Dual 30Ah)" value={flightTime} onChange={(e) => setFlightTime(e.target.value)} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'தினசரி தெளிக்கும் பரப்பு' : 'Coverage Area'}
                        </label>
                        <input type="text" className="input-field" placeholder="e.g. 40 acres / day" value={coverageArea} onChange={(e) => setCoverageArea(e.target.value)} style={{ width: '100%' }} />
                      </div>
                    </>
                  )}

                  {category === 'Water Pump' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'பம்ப் வகை' : 'Pump Type'}
                        </label>
                        <select className="input-field" value={pumpType} onChange={(e) => setPumpType(e.target.value)} style={{ width: '100%' }}>
                          <option value="Centrifugal Monobloc">Centrifugal Monobloc</option>
                          <option value="Submersible Open Well">Submersible Open Well</option>
                          <option value="Solar DC Pump">Solar DC Pump</option>
                          <option value="Diesel Portable Engine">Diesel Portable Engine</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'மோட்டார் திறன் (HP)' : 'Motor Power (HP)'}
                        </label>
                        <input type="number" className="input-field" placeholder="e.g. 5" value={hp} onChange={(e) => setHp(e.target.value)} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'நீர் வெளியேற்றும் அளவு' : 'Discharge Flow Rate'}
                        </label>
                        <input type="text" className="input-field" placeholder="e.g. 35,000 Litres/hr" value={flowRate} onChange={(e) => setFlowRate(e.target.value)} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                          {isTamil ? 'அதிகபட்ச உயரம் (Head)' : 'Max Head'}
                        </label>
                        <input type="text" className="input-field" placeholder="e.g. 32 metres" value={maxHead} onChange={(e) => setMaxHead(e.target.value)} style={{ width: '100%' }} />
                      </div>
                    </>
                  )}
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    <input
                      type="checkbox"
                      checked={operatorIncluded}
                      onChange={(e) => setOperatorIncluded(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: P }}
                    />
                    <span>{isTamil ? 'இயக்குனர் (Driver / Operator) சேவை சேர்க்கப்பட்டுள்ளது' : 'Experienced Driver / Operator included with rental'}</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3: Rental & Location Details */}
            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: 14 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
                    {isTamil ? 'வாடகை கட்டணம் & இருப்பிடம்' : 'Rental Rates & Location Details'}
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
                    {isTamil ? 'தினசரி வாடகை, முன்பணம் மற்றும் உங்கள் மாவட்டத்தைத் தேர்வு செய்யவும்.' : 'Set fair rental pricing and delivery options for farmers.'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      {isTamil ? 'தினசரி வாடகை (₹/நாள்) *' : 'Rental Rate per Day (₹) *'}
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="e.g. 1500"
                      value={pricePerDay}
                      onChange={(e) => setPricePerDay(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      {isTamil ? 'மணிநேர வாடகை (₹/மணி - விருப்பத்தேர்வு)' : 'Hourly Rate (₹/hour - Optional)'}
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="e.g. 400"
                      value={pricePerHour}
                      onChange={(e) => setPricePerHour(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      {isTamil ? 'முன்பணம் (Security Deposit ₹)' : 'Security Deposit (₹)'}
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="e.g. 2500"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      {isTamil ? 'குறைந்தபட்ச வாடகை நாட்கள்' : 'Minimum Rental Days'}
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="1"
                      value={minRentalDays}
                      onChange={(e) => setMinRentalDays(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      {isTamil ? 'மாவட்டம் (District) *' : 'District (Tamil Nadu) *'}
                    </label>
                    <select
                      className="input-field"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      {tamilNaduDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                      {isTamil ? 'டெலிவரி கட்டணம் (₹)' : 'Delivery Charge (₹)'}
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="e.g. 500"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      disabled={!deliveryAvailable}
                      style={{ width: '100%', opacity: deliveryAvailable ? 1 : 0.5 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    <input
                      type="checkbox"
                      checked={deliveryAvailable}
                      onChange={(e) => setDeliveryAvailable(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: P }}
                    />
                    <span>{isTamil ? 'விவசாயியின் பண்ணைக்கு நேரடியாக இயந்திரத்தை கொண்டு சேர்க்க இயலும் (Delivery Available)' : 'Farmstead doorstep delivery available upon booking'}</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 4: Equipment Image */}
            {currentStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: 14 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
                    {isTamil ? 'உபகரணத்தின் உண்மைப் படத்தை பதிவேற்றவும் *' : 'Upload Equipment Image *'}
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
                    {isTamil
                      ? 'உங்கள் உபகரணத்தின் தெளிவான புகைப்படத்தை பதிவேற்றவும். விவசாயிகள் இதை நேரடியாக பார்ப்பார்கள்.'
                      : 'Upload an authentic photograph of your equipment. Accepted formats: JPG, PNG, WEBP (Max 10MB).'}
                  </p>
                </div>

                {uploadedImage ? (
                  /* Uploaded Image Preview */
                  <div
                    style={{
                      border: '2px solid #E5E7EB',
                      borderRadius: 16,
                      padding: 20,
                      background: '#F9FAFB',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <div style={{ position: 'relative', maxWidth: 440, width: '100%', height: 260, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <img
                        src={uploadedImage}
                        alt="Uploaded Equipment Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 6,
                          padding: '3px 8px',
                        }}
                      >
                        {imageFileName || 'Equipment Photo'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-outline"
                        style={{ padding: '8px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <RotateCcw size={15} />
                        <span>{isTamil ? 'படத்தை மாற்றவும்' : 'Replace Photo'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImage('')
                          setImageFileName('')
                        }}
                        style={{
                          background: '#FEF2F2',
                          color: '#DC2626',
                          border: '1px solid #FCA5A5',
                          borderRadius: 8,
                          padding: '8px 18px',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Trash2 size={15} />
                        <span>{isTamil ? 'நீக்கு' : 'Remove Photo'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop Upload Dropzone */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragOver(true)
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragOver ? P : '#CBD5E1'}`,
                      background: isDragOver ? '#F0FDF4' : '#F8FAFC',
                      borderRadius: 16,
                      padding: '48px 24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        background: isDragOver ? '#DCFCE7' : '#E2E8F0',
                        color: isDragOver ? P : '#64748B',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}
                    >
                      <Upload size={28} />
                    </div>

                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
                      {isTamil ? 'படத்தை இங்கே இழுத்துப் போடவும் அல்லது கிளிக் செய்யவும்' : 'Drag & drop your equipment photo here, or click to browse'}
                    </div>

                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                      {isTamil ? 'ஆதரிக்கப்படும் வடிவங்கள்: JPG, PNG, WEBP (அதிகபட்சம் 10MB)' : 'Supports JPG, JPEG, PNG, WEBP (Maximum size: 10MB)'}
                    </div>

                    <button
                      type="button"
                      className="btn-primary"
                      style={{ padding: '8px 20px', fontSize: 13, pointerEvents: 'none' }}
                    >
                      {isTamil ? 'படத்தை தேர்வு செய்யவும்' : 'Select Photo from Computer'}
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0])
                    }
                  }}
                />
              </div>
            )}

            {/* STEP 5: Review & Publish */}
            {currentStep === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: 14 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
                    {isTamil ? 'மதிப்பாய்வு செய்து வெளியிடவும்' : 'Review Equipment & Publish'}
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
                    {isTamil ? 'எல்லா விவரங்களும் சரியாக உள்ளதா என்பதை உறுதிப்படுத்தி வெளியிடவும்.' : 'Please verify all listing details before publishing to the marketplace.'}
                  </p>
                </div>

                <div
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: 16,
                    padding: 24,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 24,
                  }}
                >
                  {/* Photo Preview */}
                  <div>
                    <img
                      src={uploadedImage || getCategoryFallback(category)}
                      alt={name}
                      style={{ width: '100%', height: 220, borderRadius: 12, objectFit: 'cover', background: '#E5E7EB' }}
                    />
                    <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ background: PM, color: P, fontSize: 12, fontWeight: 700, borderRadius: 6, padding: '3px 8px' }}>
                        {category}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
                        ₹{Number(pricePerDay).toLocaleString('en-IN')}/day
                      </span>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>
                        {isTamil ? 'கருவியின் பெயர்' : 'Equipment Name'}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>{name}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>
                          {isTamil ? 'பிராண்ட் & மாடல்' : 'Brand & Model'}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{brand} • {model}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>
                          {isTamil ? 'மாவட்டம்' : 'Location'}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{district}, Tamil Nadu</div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>
                        {isTamil ? 'முன்பணம்' : 'Security Deposit'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>₹{Number(securityDeposit).toLocaleString('en-IN')}</div>
                    </div>

                    {hp && (
                      <div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>
                          {isTamil ? 'இயந்திர திறன்' : 'Power'}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{hp} HP</div>
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>
                        {isTamil ? 'உரிமையாளர்' : 'Owner'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                        {currentUser?.name || 'Selvam Murugan'} ({currentUser?.phone || '+91 94432 10987'})
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>
                        {isTamil ? 'விளக்கம்' : 'Description'}
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>{description}</div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: '#15803D',
                    fontSize: 13,
                  }}
                >
                  <Info size={18} style={{ flexShrink: 0 }} />
                  <span>
                    {isTamil
                      ? `வெளியிட்ட பிறகு, இந்த கருவி தானாகவே "${category}" பிரிவிலும், முழு தேடல் முடிவுகளிலும் சேர்க்கப்படும்.`
                      : `After publishing, this equipment will automatically appear under "${category}" and will be searchable across the entire platform.`}
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Step Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #F3F4F6',
                marginTop: 28,
                paddingTop: 20,
              }}
            >
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-outline"
                    style={{ padding: '10px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <ArrowLeft size={15} />
                    <span>{isTamil ? 'பின்செல்ல' : 'Back'}</span>
                  </button>
                )}
              </div>

              <div>
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary"
                    style={{ padding: '10px 24px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <span>{isTamil ? 'அடுத்த நிலை' : 'Next Step'}</span>
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handlePublish}
                    className="btn-primary"
                    style={{
                      padding: '12px 32px',
                      fontSize: 14,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#15803D',
                    }}
                  >
                    <span>
                      {isSubmitting
                        ? (isTamil ? 'வெளியிடப்படுகிறது...' : 'Publishing...')
                        : editId
                        ? (isTamil ? 'மாற்றங்களைச் சேமி' : 'Save Changes')
                        : (isTamil ? 'உபகரணத்தை வெளியிடவும்' : 'Publish Equipment')}
                    </span>
                    <Sparkles size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
