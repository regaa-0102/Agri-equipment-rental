export function maskPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 4 ? `******${digits.slice(-4)}` : "******"
}

export function normalizeIndianMobileNumber(phone: string): string | null {
  const trimmed = phone.trim()
  const digits = trimmed.replace(/\D/g, "")
  const nationalNumber = digits.length === 10
    ? digits
    : digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : null

  if (!nationalNumber || !/^[6-9]\d{9}$/.test(nationalNumber)) return null
  if (trimmed.startsWith("+") && !digits.startsWith("91")) return null
  return `+91${nationalNumber}`
}
