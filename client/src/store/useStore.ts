import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'

export type Step = 'EXPLORE' | 'SELECT_COURT' | 'CHOOSE_TIME' | 'CONFIRM';
export type ViewMode = 'OVERVIEW' | 'HUMAN';
export type CourtStatus = 'AVAILABLE' | 'HOVER' | 'LOCKED' | 'BOOKED' | 'SELECTED' | 'MAINTENANCE';

export interface SelectedSlot {
  id: string;
  time: string;
  price: number;
}

export interface SlotRecord {
  id: string;
  time: string;
  price: number;
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface BookingRecord {
  id: string
  userId: string | null
  courtId: string
  courtName: string
  slotId: string
  slotTime: string
  date?: string
  fullName: string
  phone: string
  note?: string
  totalPrice: number
  status: BookingStatus
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD'
  createdAt: string
  isManual?: boolean // Staff booking on behalf of customer
}

export type OrderStatus = 'PENDING' | 'DELIVERED' | 'CANCELLED'
export type LockerStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
export type CheckInStatus = 'ACTIVE' | 'COMPLETED'
export type SkillLevel = 'NEWBIE' | 'INTERMEDIATE' | 'PRO';
export type MatchStatus = 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';

export interface LockerRecord {
  id: string
  number: string
  status: LockerStatus
  userId?: string
}

export interface CheckInRecord {
  id: string
  userId: string
  fullName: string
  phone: string
  checkInAt: number
  checkOutAt?: number
  status: CheckInStatus
  lockerNumber?: string
  courtId?: string
  slotTime?: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface OrderRecord {
  id: string
  userId?: string | null
  guestName?: string | null
  guestPhone?: string | null
  items: OrderItem[]
  total: number
  paymentMethod?: string | null
  status: OrderStatus
  createdAt: string
}

export interface OrderCreatePayload {
  guestName?: string
  guestPhone?: string
  guestAddress?: string
  items: OrderItem[]
  total: number
  paymentMethod?: 'CASH' | 'TRANSFER' | 'CARD'
}

export type CourtType = 'TENNIS' | 'BADMINTON' | 'PICKLEBALL';

function uid() {
  const randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto)
  return randomUUID ? randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export interface CourtData {
  id: string;
  name: string;
  type: CourtType;
  position: [number, number, number];
  status: CourtStatus;
  price: number;
  currentUsersViewing: number;
  isHot?: boolean;
  isDiscount?: boolean;
}

export interface MatchRecord {
  id: string;
  courtId: string;
  courtName: string;
  startTime: number;
  skillLevel: SkillLevel;
  maxPlayers: number;
  currentPlayers: number;
  description?: string;
  status: MatchStatus;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  walletBalance: number;
  points: number;
  role: 'USER' | 'STAFF' | 'ADMIN';
  membership: 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM';
  skillLevel?: SkillLevel;
}

export interface ProductRecord {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStock?: number;
  category: string;
  image?: string;
  description?: string;
  tag?: string;
}

export interface KnowledgeSection {
  heading: string;
  body: string;
}

export interface KnowledgeRecord {
  id: string;
  slug: string;
  title: string;
  desc: string;
  img: string;
  readTime: string;
  level: 'NEWBIE' | 'INTERMEDIATE' | 'PRO' | 'ADVANCED';
  sections: KnowledgeSection[] | string;
  createdAt: string;
}

interface AppState {
  // --- CART ---
  cart: Record<string, number>;
  setCart: (cart: Record<string, number> | ((prevCart: Record<string, number>) => Record<string, number>)) => void;
  clearCart: () => void;
  // --- PROGRESS ---
  currentStep: Step;
  completedSteps: Step[];

  // --- 3D / COURT ---
  viewMode: ViewMode;
  courts: CourtData[];
  slots: SlotRecord[];
  selectedCourtId: string | null;
  hoveredCourtId: string | null;
  selectedSlot: SelectedSlot | null;
  cameraPosition: [number, number, number];
  cameraLookAt: [number, number, number];
  
  // --- REAL-TIME ---
  realtimeLocks: Record<string, string>; // slotId -> userId
  usersOnline: number;
  otherUsersPresence: Record<string, [number, number, number]>; // userId -> [x, y, z]

  // --- BUSINESS ---
  bookings: BookingRecord[]
  orders: OrderRecord[]
  checkIns: CheckInRecord[]
  lockers: LockerRecord[]
  matches: MatchRecord[]
  products: ProductRecord[]
  knowledge: KnowledgeRecord[]
  user: UserProfile | null
  tempUserId: string
  isLoading: boolean
  error: string | null
  notification: { message: string, type: 'success' | 'error' } | null

  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void

  // Auth
  login: (email: string, pass: string) => Promise<void>
  register: (payload: { email: string; password: string; name?: string; phone?: string }) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
  updateMe: (payload: { name?: string; phone?: string; avatarUrl?: string }) => Promise<void>

  // Products
  fetchProducts: () => Promise<void>
  addProduct: (product: Omit<ProductRecord, 'id'>) => Promise<void>
  updateProduct: (id: string, product: Partial<ProductRecord>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  // Knowledge
  fetchKnowledge: () => Promise<void>
  addKnowledge: (knowledge: Omit<KnowledgeRecord, 'id' | 'createdAt'>) => Promise<void>
  updateKnowledge: (id: string, knowledge: Partial<Omit<KnowledgeRecord, 'id' | 'createdAt'>>) => Promise<void>
  deleteKnowledge: (id: string) => Promise<void>

  // Admin fetch
  fetchBookings: () => Promise<void>
  fetchOrders: () => Promise<void>
  fetchCourts: () => Promise<void>
  fetchSlots: () => Promise<void>

  // --- ACTIONS ---
  setNotification: (notif: { message: string, type: 'success' | 'error' } | null) => void;
  setStep: (step: Step) => void;
  setViewMode: (mode: ViewMode) => void;
  selectCourt: (courtId: string | null) => void;
  setHoveredCourt: (courtId: string | null) => void;
  setSelectedSlot: (slot: SelectedSlot | null) => void;
  updateCourtStatus: (courtId: string, status: CourtStatus) => Promise<void>;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  createBooking: (payload: Omit<BookingRecord, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  createOrder: (payload: OrderCreatePayload) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  createCheckIn: (payload: Omit<CheckInRecord, 'id' | 'checkInAt' | 'status'>) => string
  updateCheckInStatus: (checkInId: string, status: CheckInStatus) => void
  updateLockerStatus: (lockerId: string, status: LockerStatus, userId?: string) => void
  releaseBooking: (bookingId: string) => Promise<void>;
  extendBooking: (bookingId: string, extraSlotId: string, extraTime: string, extraPrice: number) => Promise<void>;
  updateRealtimeLock: (slotId: string, userId: string | null) => void;
  updatePresence: (userId: string, position: [number, number, number] | null) => void;
  setCamera: (pos: [number, number, number], lookAt: [number, number, number]) => void;
  joinMatch: (matchId: string) => void;
  createMatch: (payload: Omit<MatchRecord, 'id' | 'status' | 'currentPlayers'>) => void;
  updateWallet: (amount: number) => void;
  fetchInitialData: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: {},
      setCart: (cart) => set((state) => ({ 
        cart: typeof cart === 'function' ? cart(state.cart) : cart 
      })),
      clearCart: () => set({ cart: {} }),
      currentStep: 'EXPLORE',
      viewMode: 'OVERVIEW',
      completedSteps: [],
      courts: [],
      slots: [],
      selectedCourtId: null,
      hoveredCourtId: null,
      selectedSlot: null,
      selectedDate: new Date().toISOString().split('T')[0],
      cameraPosition: [0, 60, 180],
      cameraLookAt: [0, 0, 60],
      realtimeLocks: {},
      usersOnline: 0,
      otherUsersPresence: {},
      bookings: [],
      orders: [],
      checkIns: [],
      lockers: Array(20).fill(null).map((_, i) => ({
        id: `locker-${i + 1}`,
        number: (i + 1).toString().padStart(2, '0'),
        status: 'AVAILABLE'
      })),
      matches: [
        {
          id: 'match-1',
          courtId: 'pickleball-1',
          courtName: 'Pickleball 1',
          startTime: Date.now() + 3600000,
          skillLevel: 'INTERMEDIATE',
          maxPlayers: 4,
          currentPlayers: 2,
          status: 'OPEN'
        },
        {
          id: 'match-2',
          courtId: 'badminton-3',
          courtName: 'Badminton 3',
          startTime: Date.now() + 7200000,
          skillLevel: 'PRO',
          maxPlayers: 2,
          currentPlayers: 1,
          status: 'OPEN'
        }
      ],
      products: [
        { id: 'racket-01', name: 'Yonex Astrox 88D Pro', category: 'Vợt Cầu Lông', price: 3850000, stock: 5, description: 'Vợt thiên công, phù hợp người chơi có lực tay tốt, chuyên dùng cho tấn công mạnh mẽ.', tag: 'Best Seller', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxZTFlMmUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwYTBhMGEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTYwIiBmb250LXNpemU9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzliNTZmIj7wn5S/PC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmIiBmb250LXdlaWdodD0iYm9sZCI+Vl9UX0M8L3RleHQ+PC9zdmc+' },
        { id: 'racket-02', name: 'Lining Tectonic 7', category: 'Vợt Cầu Lông', price: 3200000, stock: 8, description: 'Vợt cân bằng, linh hoạt trong cả tấn công và phòng thủ, phù hợp mọi trình độ.', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImcyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMmQxYTIyIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMGQwYjBkIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZzIpIi8+PHRleHQgeD0iMjAwIiB5PSIxNjAiIGZvbnQtc2l6ZT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmNzE3MzYiP/Cfk788L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSJib2xkIj5MSU5JTkc8L3RleHQ+PC9zdmc+' },
        { id: 'racket-03', name: 'Victor Thruster F Claw', category: 'Vợt Cầu Lông', price: 4200000, stock: 4, description: 'Vợt top đầu, thiết kế head-heavy, lực đập cực mạnh, dành cho người chơi tấn công.', tag: 'Hot', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImczIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTIwMjA3Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDYwNDA2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZzMpIi8+PHRleHQgeD0iMjAwIiB5PSIxNjAiIGZvbnQtc2l6ZT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNlZjE5NTAiP/Cfk788L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSJib2xkIj5WSUNUT1I8L3RleHQ+PC9zdmc+' },
        { id: 'shuttle-01', name: 'Cầu Thành Công (12 quả)', category: 'Quả Cầu Lông', price: 220000, stock: 50, description: 'Cầu lông vũ tiêu chuẩn thi đấu, độ bền cao, quỹ đạo ổn định.', tag: 'Hot', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Imc0IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTAxYjE3Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDQwNzA1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZzQpIi8+PHRleHQgeD0iMjAwIiB5PSIxNjAiIGZvbnQtc2l6ZT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3YmQxNGIiP/Cfk7M8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSJib2xkIj5DQUlMQU5HTzwvdGV4dD48L3N2Zz4=' },
        { id: 'shuttle-02', name: 'Cầu RSL Tourney Classic', category: 'Quả Cầu Lông', price: 350000, stock: 30, description: 'Cầu lông vũ chất lượng cao, dùng cho các giải đấu chuyên nghiệp.', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ZzUiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxZDIxMjUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwNTA1MDciLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnNSkiLz48dGV4dCB4PSIyMDAiIHk9IjE2MCIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk0YTM0YiI+8J+Tsw8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSJib2xkIj5SU0w8L3RleHQ+PC9zdmc+' },
        { id: 'shoes-01', name: 'Victor P9200TTY', category: 'Giày Cầu Lông', price: 2450000, stock: 3, description: 'Phiên bản giới hạn Tai Tzu Ying, hỗ trợ di chuyển tối ưu, đệm Shock Absorption.', tag: 'New', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ZzYiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxODE1MTUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwNDA0MDQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnNikiLz48dGV4dCB4PSIyMDAiIHk9IjE2MCIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2YzN2IyMiI+8J+TqTwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjIyMCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkdJQUhTPC90ZXh0Pjwvc3ZnPg==' },
        { id: 'shoes-02', name: 'Yonex SHB 65Z3', category: 'Giày Cầu Lông', price: 2850000, stock: 6, description: 'Giày cầu lông cao cấp, hỗ trợ nhanh nhẹ, bám sân tốt.', tag: 'Best Seller', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ZzciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxYTFhMmEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwYjBiMGIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnNykiLz48dGV4dCB4PSIyMDAiIHk9IjE2MCIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzUxNWJmZiI+8J+TqTwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjIyMCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC13ZWlnaHQ9ImJvbGQiPllPTkVYPC90ZXh0Pjwvc3ZnPg==' },
        { id: 'grip-01', name: 'Quấn cán Yonex AC102EX', category: 'Phụ Kiện', price: 45000, stock: 100, description: 'Độ bám tốt, thấm hút mồ hôi hiệu quả, mềm tay.', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ZzgiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxNzFiMWUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwNDA1MDciLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnOCkiLz48dGV4dCB4PSIyMDAiIHk9IjE2MCIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzdkNmRmZiI+8J+TsTwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjIyMCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC13ZWlnaHQ9ImJvbGQiPlFVTU4gQ0FOPC90ZXh0Pjwvc3ZnPg==' },
        { id: 'string-01', name: 'Dây căng Yonex BG66 Ultimax', category: 'Phụ Kiện', price: 120000, stock: 40, description: 'Dây căng tốt, cảm giác đánh tốt, nảy cao.', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ZzkiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxNjFiMTciLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwNDA0MDYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnOSkiLz48dGV4dCB4PSIyMDAiIHk9IjE2MCIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2VhOWMxMSI+8J+Tuw8vdGV4dD48dGV4dCB4PSIyMDAiIHk9IjIyMCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC13ZWlnaHQ9ImJvbGQiPlNUUklORzwvdGV4dD48L3N2Zz4=' },
      ],
      knowledge: [],
      user: null,
      tempUserId: 'guest-' + Math.random().toString(36).substring(2, 11),
      isLoading: false,
      error: null,
      notification: null,
      theme: (typeof window !== 'undefined' && localStorage.getItem('theme') === 'light') ? 'light' : 'dark',
      setTheme: (theme) => {
        localStorage.setItem('theme', theme)
        document.documentElement.dataset.theme = theme
        set({ theme })
      },
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        localStorage.setItem('theme', next)
        document.documentElement.dataset.theme = next
        set({ theme: next })
      },

      // --- AUTH ACTIONS ---
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.post('/auth/login', { email, password })
          localStorage.setItem('access_token', res.data.access_token)
          set({ user: res.data.user, isLoading: false })
        } catch (err: any) {
          set({ error: err.response?.data?.message || 'Lỗi đăng nhập', isLoading: false })
          throw err
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.post('/auth/register', payload)
          localStorage.setItem('access_token', res.data.access_token)
          set({ user: res.data.user, isLoading: false })
        } catch (err: any) {
          set({ error: err.response?.data?.message || 'Lỗi đăng ký', isLoading: false })
          throw err
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        set({ user: null })
      },

      refreshMe: async () => {
        try {
          const token = localStorage.getItem('access_token')
          if (!token) return
          const res = await api.get('/auth/me')
          set({ user: res.data })
        } catch {
          localStorage.removeItem('access_token')
          set({ user: null })
        }
      },

      updateMe: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.patch('/auth/me', payload)
          set({ user: res.data, isLoading: false })
        } catch (err: any) {
          const msg = err.response?.data?.message || 'Lỗi cập nhật tài khoản'
          set({ error: msg, isLoading: false })
          throw new Error(msg)
        }
      },

      // --- PRODUCT ACTIONS ---
      fetchProducts: async () => {
        set({ isLoading: true })
        try {
          const res = await api.get('/products')
          set({ products: res.data })
        } catch (err) {
          console.error('Lỗi khi tải sản phẩm:', err)
        } finally {
          set({ isLoading: false })
        }
      },

      addProduct: async (data) => {
        set({ isLoading: true })
        try {
          const res = await api.post('/products', data)
          set((s) => ({ products: [res.data, ...s.products] }))
        } catch (err: any) {
          throw new Error(err.response?.data?.message || 'Lỗi khi thêm sản phẩm')
        } finally {
          set({ isLoading: false })
        }
      },

      updateProduct: async (id, data) => {
        set({ isLoading: true })
        try {
          const res = await api.patch(`/products/${id}`, data)
          set((s) => ({
            products: s.products.map((p) => (p.id === id ? res.data : p)),
          }))
        } catch (err: any) {
          throw new Error(err.response?.data?.message || 'Lỗi khi cập nhật sản phẩm')
        } finally {
          set({ isLoading: false })
        }
      },

      deleteProduct: async (id) => {
        set({ isLoading: true });
        try {
          await api.delete(`/products/${id}`);
          set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        } catch (err: any) {
          throw new Error(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
        } finally {
          set({ isLoading: false });
        }
      },

      fetchKnowledge: async () => {
        set({ isLoading: true });
        try {
          const res = await api.get('/knowledge');
          // Parse sections from JSON string if needed
          const mapped = res.data.map((k: any) => ({
            ...k,
            sections: typeof k.sections === 'string' ? JSON.parse(k.sections) : k.sections,
          }));
          set({ knowledge: mapped });
        } catch (err) {
          console.error('Lỗi khi tải kiến thức:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      addKnowledge: async (data) => {
        set({ isLoading: true });
        try {
          const payload = { ...data, sections: JSON.stringify(data.sections) };
          const res = await api.post('/knowledge', payload);
          const newKnowledge = {
            ...res.data,
            sections: typeof res.data.sections === 'string' ? JSON.parse(res.data.sections) : res.data.sections,
          };
          set((s) => ({ knowledge: [newKnowledge, ...s.knowledge] }));
        } catch (err: any) {
          throw new Error(err.response?.data?.message || 'Lỗi khi thêm kiến thức');
        } finally {
          set({ isLoading: false });
        }
      },

      updateKnowledge: async (id, data) => {
        set({ isLoading: true });
        try {
          const payload = data.sections ? { ...data, sections: JSON.stringify(data.sections) } : data;
          const res = await api.put(`/knowledge/${id}`, payload);
          const updatedKnowledge = {
            ...res.data,
            sections: typeof res.data.sections === 'string' ? JSON.parse(res.data.sections) : res.data.sections,
          };
          set((s) => ({
            knowledge: s.knowledge.map((k) => (k.id === id ? updatedKnowledge : k)),
          }));
        } catch (err: any) {
          throw new Error(err.response?.data?.message || 'Lỗi khi cập nhật kiến thức');
        } finally {
          set({ isLoading: false });
        }
      },

      deleteKnowledge: async (id) => {
        set({ isLoading: true });
        try {
          await api.delete(`/knowledge/${id}`);
          set((s) => ({ knowledge: s.knowledge.filter((k) => k.id !== id) }));
        } catch (err: any) {
          throw new Error(err.response?.data?.message || 'Lỗi khi xóa kiến thức');
        } finally {
          set({ isLoading: false });
        }
      },

      fetchBookings: async () => {
        const res = await api.get('/bookings').catch(() => ({ data: [] }))
        const mapped: BookingRecord[] = (res.data || []).map((b: any) => ({
          id: b.id,
          userId: b.userId ?? undefined,
          courtId: b.courtId,
          courtName: b.court?.name || b.courtName || '',
          slotId: b.slotId,
          slotTime: b.slotTime || '',
          date: b.date,
          fullName: b.fullName || '',
          phone: b.phone || '',
          note: b.note || undefined,
          totalPrice: Number(b.totalPrice || 0),
          status: b.status,
          paymentMethod: b.paymentMethod || 'CASH',
          createdAt: b.createdAt,
          isManual: b.isManual ?? undefined,
        }))
        set({ bookings: mapped })
      },

      fetchCourts: async () => {
        try {
          const res = await api.get('/courts')
          const mapped: CourtData[] = res.data.map((c: any) => ({
            ...c,
            position: JSON.parse(c.position || '[0,0,0]'),
            currentUsersViewing: 0,
            isHot: Boolean(c.isHot),
            isDiscount: Boolean(c.isDiscount),
          }))
          set({ courts: mapped })
        } catch (err) {
          console.error('Lỗi khi tải danh sách sân:', err)
        }
      },

      fetchSlots: async () => {
        try {
          const res = await api.get('/courts/slots')
          set({ slots: res.data })
        } catch (err) {
          console.error('Lỗi khi tải khung giờ:', err)
        }
      },

      fetchOrders: async () => {
        const res = await api.get('/orders').catch(() => ({ data: [] }))
        const mapped: OrderRecord[] = (res.data || []).map((o: any) => {
          let items: OrderItem[] = []
          const raw = o.items
          if (Array.isArray(raw)) items = raw
          else if (typeof raw === 'string') {
            try {
              items = JSON.parse(raw)
            } catch {
              items = []
            }
          }
          return {
            id: o.id,
            userId: o.userId ?? null,
            guestName: o.guestName ?? null,
            guestPhone: o.guestPhone ?? null,
            items,
            total: Number(o.total || 0),
            paymentMethod: o.paymentMethod ?? null,
            status: o.status,
            createdAt: o.createdAt,
          }
        })
        set({ orders: mapped })
      },

      // --- FETCH INITIAL DATA ---
      fetchInitialData: async () => {
        set({ isLoading: true })
        try {
          const hasToken = !!localStorage.getItem('access_token')
          const [productsRes, courtsRes, slotsRes] = await Promise.all([
            api.get('/products').catch(() => ({ data: [] })),
            api.get('/courts').catch(() => ({ data: [] })),
            api.get('/courts/slots').catch(() => ({ data: [] })),
          ])
          
          set({ products: productsRes.data || [] })
          set({ slots: slotsRes.data || [] })
          set({ courts: (courtsRes.data || []).map((c: any) => ({
            ...c,
            position: JSON.parse(c.position || '[0,0,0]'),
            currentUsersViewing: 0,
            isHot: Boolean(c.isHot),
            isDiscount: Boolean(c.isDiscount),
          })) })

          if (!hasToken) return

          const me = await api.get('/auth/me').catch(() => null)
          if (!me?.data) return

          set({ user: me.data })
          if (me.data.role === 'ADMIN' || me.data.role === 'STAFF') {
            await Promise.all([get().fetchBookings(), get().fetchOrders()])
          }
        } finally {
          set({ isLoading: false })
        }
      },

      setNotification: (notification) => set({ notification }),
      setStep: (step) => set({ currentStep: step }),
      setViewMode: (mode) => set({ viewMode: mode }),
      selectCourt: (courtId) => set((state) => {
        const updatedCourts = state.courts.map(c => {
          if (c.status === 'BOOKED' || c.status === 'LOCKED') return c;
          if (c.id === courtId) return { ...c, status: 'SELECTED' as CourtStatus };
          return { ...c, status: 'AVAILABLE' as CourtStatus };
        });
        return { selectedCourtId: courtId, courts: updatedCourts, selectedSlot: null };
      }),
      setHoveredCourt: (courtId) => set((state) => {
        const updatedCourts = state.courts.map(c => {
          if (c.status === 'SELECTED' || c.status === 'BOOKED' || c.status === 'LOCKED') return c;
          if (c.id === courtId) return { ...c, status: 'HOVER' as CourtStatus };
          return { ...c, status: 'AVAILABLE' as CourtStatus };
        });
        return { hoveredCourtId: courtId, courts: updatedCourts };
      }),
      setSelectedSlot: (slot) => set({ selectedSlot: slot }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      updateCourtStatus: async (courtId, status) => {
        set((state) => ({
          courts: state.courts.map(c => c.id === courtId ? { ...c, status } : c)
        }))
      },

      createBooking: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.post('/bookings', payload)
          const record: BookingRecord = {
            id: res.data.id,
            userId: res.data.userId ?? undefined,
            courtId: res.data.courtId,
            courtName: payload.courtName,
            slotId: res.data.slotId,
            slotTime: res.data.slotTime || payload.slotTime,
            fullName: res.data.fullName || payload.fullName,
            phone: res.data.phone || payload.phone,
            note: res.data.note || payload.note,
            totalPrice: Number(res.data.totalPrice || payload.totalPrice || 0),
            status: res.data.status,
            paymentMethod: res.data.paymentMethod || payload.paymentMethod,
            createdAt: res.data.createdAt,
            isManual: payload.isManual,
          }
          
          set((state) => ({
            bookings: [record, ...state.bookings],
            courts: state.courts.map((c) => (c.id === payload.courtId ? { ...c, status: 'BOOKED' } : c)),
            isLoading: false
          }))
          return record.id
        } catch (err: any) {
          const msg = err.response?.data?.message || err.message || 'Không thể tạo lượt đặt sân'
          set({ error: msg, isLoading: false })
          throw new Error(msg)
        }
      },

      updateBookingStatus: async (bookingId, status) => {
        set((state) => ({ bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, status } : b)) }))
      },

      createOrder: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          // If logged in, check balance
          set((state) => {
            if (state.user && state.user.walletBalance < payload.total) {
              throw new Error('Số dư ví không đủ để thanh toán đơn hàng.');
            }
            return state;
          });

          const res = await api.post('/orders', payload)
          let items: OrderItem[] = []
          const raw = res.data.items
          if (Array.isArray(raw)) items = raw
          else if (typeof raw === 'string') {
            try {
              items = JSON.parse(raw)
            } catch {
              items = payload.items
            }
          } else {
            items = payload.items
          }

          const record: OrderRecord = {
            id: res.data.id,
            userId: res.data.userId ?? null,
            guestName: res.data.guestName ?? payload.guestName ?? null,
            guestPhone: res.data.guestPhone ?? payload.guestPhone ?? null,
            items,
            total: Number(res.data.total || payload.total || 0),
            paymentMethod: res.data.paymentMethod ?? payload.paymentMethod ?? null,
            status: res.data.status,
            createdAt: res.data.createdAt,
          }
          
          set((state) => ({
            orders: [record, ...state.orders],
            products: state.products.map(p => {
              const item = payload.items.find(i => i.productId === p.id);
              if (item) return { ...p, stock: p.stock - item.quantity };
              return p;
            }),
            isLoading: false
          }))
          return record.id
        } catch (err: any) {
          const msg = err.response?.data?.message || err.message
          set({ error: msg, isLoading: false })
          throw new Error(msg)
        }
      },

      updateOrderStatus: async (orderId, status) =>
        set((state) => ({ orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)) })),

      createCheckIn: (payload) => {
        const id = uid()
        const record: CheckInRecord = { ...payload, id, checkInAt: Date.now(), status: 'ACTIVE' }
        set((state) => ({
          checkIns: [record, ...state.checkIns],
          lockers: state.lockers.map(l => l.number === payload.lockerNumber ? { ...l, status: 'OCCUPIED', userId: payload.userId } : l)
        }))
        return id
      },

      updateCheckInStatus: (checkInId, status) =>
        set((state) => {
          const checkIn = state.checkIns.find(c => c.id === checkInId)
          return {
            checkIns: state.checkIns.map((c) => (c.id === checkInId ? { ...c, status, checkOutAt: status === 'COMPLETED' ? Date.now() : undefined } : c)),
            lockers: status === 'COMPLETED' && checkIn?.lockerNumber ? state.lockers.map(l => l.number === checkIn.lockerNumber ? { ...l, status: 'AVAILABLE', userId: undefined } : l) : state.lockers
          }
        }),

      updateLockerStatus: (lockerId, status, userId) =>
        set((state) => ({ lockers: state.lockers.map((l) => (l.id === lockerId ? { ...l, status, userId } : l)) })),

      releaseBooking: async (bookingId) => {
        try {
          await api.delete(`/bookings/${bookingId}`)
          set((state) => {
            const booking = state.bookings.find(b => b.id === bookingId);
            if (!booking) return state;
            return {
              bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b),
              courts: state.courts.map(c => c.id === booking.courtId ? { ...c, status: 'AVAILABLE' } : c)
            }
          })
        } catch (err: any) {
          throw new Error(err.response?.data?.message || 'Lỗi khi hủy sân')
        }
      },

      extendBooking: async (bookingId, extraSlotId, extraTime, extraPrice) => {
        // Simulation for now as we don't have extend API yet
        set((state) => {
          const booking = state.bookings.find(b => b.id === bookingId);
          if (!booking) return state;
          
          const isTaken = state.bookings.some(b => 
            b.courtId === booking.courtId && 
            b.slotId === extraSlotId && 
            b.status !== 'CANCELLED'
          );
          if (isTaken) throw new Error('Không thể gia hạn vì khung giờ tiếp theo đã có người đặt.');

          return {
            bookings: state.bookings.map(b => b.id === bookingId ? { 
              ...b, 
              slotId: extraSlotId, 
              slotTime: `${b.slotTime.split(' - ')[0]} - ${extraTime.split(' - ')[1]}`,
              totalPrice: b.totalPrice + extraPrice
            } : b)
          }
        })
      },
      updateRealtimeLock: (slotId, userId) => set((state) => {
        const newLocks = { ...state.realtimeLocks };
        if (userId) newLocks[slotId] = userId;
        else delete newLocks[slotId];
        return { realtimeLocks: newLocks };
      }),
      updatePresence: (userId, position) => set((state) => {
        const newPresence = { ...state.otherUsersPresence };
        if (position) newPresence[userId] = position;
        else delete newPresence[userId];
        return { otherUsersPresence: newPresence, usersOnline: Object.keys(newPresence).length + 1 };
      }),
      setCamera: (pos: [number, number, number], lookAt: [number, number, number]) => set({ cameraPosition: pos, cameraLookAt: lookAt }),
      joinMatch: (matchId) => set((state) => ({
        matches: state.matches.map(m => 
          m.id === matchId && m.currentPlayers < m.maxPlayers 
            ? { ...m, currentPlayers: m.currentPlayers + 1, status: m.currentPlayers + 1 === m.maxPlayers ? 'FULL' : 'OPEN' } 
            : m
        )
      })),
      createMatch: (payload) => set((state) => ({
        matches: [{ ...payload, id: uid(), status: 'OPEN', currentPlayers: 1 }, ...state.matches]
      })),
      updateWallet: (amount) => set((state) => ({
        user: state.user ? { ...state.user, walletBalance: state.user.walletBalance + amount } : null
      })),
    }),
    {
      name: 'elyra-hub-premium-store-v2',
      partialize: (state) => ({
        cart: state.cart,
        courts: state.courts,
        bookings: state.bookings,
        orders: state.orders,
        checkIns: state.checkIns,
        lockers: state.lockers,
        matches: state.matches,
        user: state.user,
        products: state.products,
        theme: state.theme
      }),
    }
  )
)
