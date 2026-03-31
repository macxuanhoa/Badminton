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

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface BookingRecord {
  id: string
  userId?: string
  courtId: string
  courtName: string
  slotId: string
  slotTime: string
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

// Realistic Master Zoning Positions (Metric Meters)
// Total Facility Area: ~72m width x 150m depth
const defaultCourts: CourtData[] = [
  // 4 Pickleball Courts (16m x 8m including buffers)
  // X centers: -27, -9, 9, 27 | Z center: 35
  ...Array(4).fill(null).map((_, i) => ({
    id: `pickleball-${i + 1}`,
    name: `Pickleball ${i + 1}`,
    type: 'PICKLEBALL' as CourtType,
    position: [(i - 1.5) * 18, 0, 35] as [number, number, number],
    status: 'AVAILABLE' as CourtStatus,
    price: 120000,
    currentUsersViewing: 0,
  })),
  // 4 Badminton Courts (18m x 9m including buffers)
  // X centers: -27, -9, 9, 27 | Z center: 75
  ...Array(4).fill(null).map((_, i) => ({
    id: `badminton-${i + 1}`,
    name: `Badminton ${i + 1}`,
    type: 'BADMINTON' as CourtType,
    position: [(i - 1.5) * 18, 0, 75] as [number, number, number],
    status: 'AVAILABLE' as CourtStatus,
    price: 150000,
    currentUsersViewing: 0,
  })),
  // 1 Tennis Court (36m x 18m including buffers)
  // X center: 0 | Z center: 120
  {
    id: 'tennis-1',
    name: 'Tennis 1',
    type: 'TENNIS',
    position: [0, 0, 120],
    status: 'AVAILABLE',
    price: 250000,
    currentUsersViewing: 0,
  }
];

interface AppState {
  // --- PROGRESS ---
  currentStep: Step;
  completedSteps: Step[];

  // --- 3D / COURT ---
  viewMode: ViewMode;
  courts: CourtData[];
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
  user: UserProfile | null
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

  // Admin fetch
  fetchBookings: () => Promise<void>
  fetchOrders: () => Promise<void>

  // --- ACTIONS ---
  setNotification: (notif: { message: string, type: 'success' | 'error' } | null) => void;
  setStep: (step: Step) => void;
  setViewMode: (mode: ViewMode) => void;
  selectCourt: (courtId: string | null) => void;
  setHoveredCourt: (courtId: string | null) => void;
  setSelectedSlot: (slot: SelectedSlot | null) => void;
  updateCourtStatus: (courtId: string, status: CourtStatus) => Promise<void>;
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
      currentStep: 'EXPLORE',
      viewMode: 'OVERVIEW',
      completedSteps: [],
      courts: defaultCourts,
      selectedCourtId: null,
      hoveredCourtId: null,
      selectedSlot: null,
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
        { id: 'p1', name: 'Nước suối Aquafina', price: 15000, stock: 50, minStock: 10, category: 'Nước uống', image: 'https://source.unsplash.com/aHN4dlCa4Oo/1200x900' },
        { id: 'p2', name: 'Nước tăng lực Redbull', price: 25000, stock: 30, minStock: 5, category: 'Nước uống', image: 'https://source.unsplash.com/ArFB6Tz7it8/1200x900' },
        { id: 'p3', name: 'Bóng Pickleball Franklin', price: 85000, stock: 20, minStock: 2, category: 'Dụng cụ', image: 'https://source.unsplash.com/79UPJtBsSAg/1200x900' },
        { id: 'p4', name: 'Quấn cán vợt Yonex', price: 45000, stock: 100, minStock: 20, category: 'Dụng cụ', image: 'https://source.unsplash.com/IJS9yvaM2vk/1200x900' }
      ],
      user: null,
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
        set({ isLoading: true })
        try {
          await api.delete(`/products/${id}`)
          set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
        } catch (err: any) {
          throw new Error(err.response?.data?.message || 'Lỗi khi xóa sản phẩm')
        } finally {
          set({ isLoading: false })
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
          const productsRes = await api.get('/products').catch(() => ({ data: [] }))
          set({ products: productsRes.data || [] })

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
          const msg = err.response?.data?.message || err.message
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
