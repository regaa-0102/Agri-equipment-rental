export function maskPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 4 ? `******${digits.slice(-4)}` : "******"
}
