export type FuneralHomeStatus = 'active' | 'inactive' | 'suspended'
export type ObituaryStatus = 'draft' | 'published' | 'archived'
export type ActivityType = 'obituary_created' | 'obituary_published' | 'client_created' | 'qr_generated'

export interface FuneralHome {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: FuneralHomeStatus
  qrLimit: number
  qrUsed: number
  createdAt: string
  lastLoginAt: string
}

export interface Obituary {
  id: string
  funeralHomeId: string
  funeralHomeName: string
  firstName: string
  lastName: string
  birthDate: string
  deathDate: string
  obituaryText: string
  ceremonyInfo: string
  location: string
  photoUrl?: string
  status: ObituaryStatus
  qrCode?: string
  publicUrl?: string
  views: number
  createdAt: string
  publishedAt?: string
}

export interface ActivityLog {
  id: string
  type: ActivityType
  description: string
  funeralHomeName: string
  timestamp: string
}

export interface AdminMetrics {
  totalFuneralHomes: number
  totalObituaries: number
  totalQrUsed: number
  activeClients: number
}

export interface ChartDataPoint {
  day: string
  obituaries: number
  clients: number
}
