import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function calculateAge(birthDate: string | Date): string {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return `${age}+`
}

// Calculate years of experience since business started
export function getYearsOfExperience(): number {
  // Owner was doing this work before officially starting the business in 2013
  const startYear = 2012
  const currentYear = new Date().getFullYear()
  return currentYear - startYear
}

// Get years of experience as a string (e.g., "13+", "14+")
export function getYearsOfExperienceString(): string {
  const years = getYearsOfExperience()
  return `${years}+`
}
