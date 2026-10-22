import { useEffect, useState } from 'react'

type Page = 'home' | 'search' | 'hotel' | 'rooms' | 'amenities' | 'booking' | 'bookings' | 'payment' | 'offers' | 'contact' | 'auth' | 'admin' | 'manager' | 'saved'
type IconName = 'search' | 'calendar' | 'users' | 'map' | 'heart' | 'star' | 'arrow' | 'menu' | 'close' | 'bed' | 'wifi' | 'pool' | 'spa' | 'card' | 'check' | 'sun' | 'phone' | 'mail'
type Amenity = { id: string; name: string; description: string; category: string }
type Room = { name: string; price: number; copy: string; image: string }
type Hotel = { id: string; name: string; city: string; price: number; rating: number; image: string; images: string[]; tag: string; description: string; amenities: string[]; rooms: Room[]; active: boolean }
type SearchCriteria = { city: string; checkIn: string; checkOut: string; guests: number; rooms: number }
type GuestDetails = { name: string; email: string; phone: string }
type Booking = { code: string; hotelName: string; city: string; image: string; roomName: string; checkIn: string; checkOut: string; guests: number; total: number; status: 'Confirmed' | 'Cancelled' }

const photos = {
  hero: 'https://images.unsplash.com/photo-1526786220381-1d21eedf92bf?auto=format&fit=crop&w=2000&q=90',
  pool: 'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=85',
  resort: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=1200&q=85',
  patio: 'https://images.unsplash.com/photo-1650965171703-087486b3a1b0?auto=format&fit=crop&w=1200&q=85',
  terrace: 'https://images.unsplash.com/photo-1585418694458-dc80a5c20294?auto=format&fit=crop&w=1200&q=85',
  beach: 'https://images.unsplash.com/photo-1679310289994-9033a196b136?auto=format&fit=crop&w=1400&q=85',
}

const defaultAmenities: Amenity[] = [
  { id: 'pool', name: 'Infinity pool', description: 'A calm, open-air swimming pool.', category: 'Wellness' },
  { id: 'wifi', name: 'Fast Wi-Fi', description: 'Complimentary high-speed Wi-Fi.', category: 'Essentials' },
  { id: 'spa', name: 'Spa', description: 'Restorative treatments and therapies.', category: 'Wellness' },
  { id: 'breakfast', name: 'Breakfast included', description: 'A fresh breakfast is included with your stay.', category: 'Dining' },
  { id: 'beach', name: 'Beach access', description: 'Easy access to the nearby beach.', category: 'Experiences' },
  { id: 'parking', name: 'Free parking', description: 'Complimentary on-site parking.', category: 'Essentials' },
  { id: 'transfer', name: 'Airport transfer', description: 'Airport pickup and drop-off available.', category: 'Services' },
  { id: 'pet', name: 'Pet friendly', description: 'Bring your four-legged travel companion.', category: 'Services' },
]

const defaultRooms: Room[] = [
  { name: 'Garden Room', price: 12900, copy: 'King bed · Garden patio · 2 guests', image: photos.patio },
  { name: 'Poolside Suite', price: 17500, copy: 'King bed · Pool view · 3 guests', image: photos.pool },
  { name: 'Grand Villa', price: 24900, copy: '2 bedrooms · Private deck · 5 guests', image: photos.resort },
]

function createHotel(name: string, city: string, price: number, rating: number, image: string, tag: string, id = `stay-${crypto.randomUUID()}`): Hotel {
  return {
    id, name, city, price, rating, image, images: [image], tag,
    description: `Discover a considered escape in ${city}, with warm hospitality, thoughtful rooms and space to slow down.`,
    amenities: ['wifi', 'breakfast'],
    rooms: defaultRooms.map((room, index) => ({ ...room, price: Math.round((price * (index === 0 ? 1 : index === 1 ? 1.36 : 1.94)) / 100) * 100 })),
    active: true,
  }
}

function loadStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch (error) {
    console.error(`Could not load saved ${key} data. Starting with the default catalog.`, error)
    return fallback
  }
}

function saveStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Could not save ${key} data. Changes will only last for this session.`, error)
  }
}

const defaultHotels: Hotel[] = [
  createHotel('Grandstay Azure Bay', 'Goa', 12900, 4.9, photos.pool, 'Beachfront', 'azure-bay'),
  createHotel('Grandstay Palm Cove', 'Kochi', 9800, 4.8, photos.resort, 'Private pool', 'palm-cove'),
  createHotel('Grandstay Sand & Sky', 'Pondicherry', 11200, 4.7, photos.patio, 'Guest favourite', 'sand-sky'),
  createHotel('Grandstay Coral House', 'Alibaug', 14900, 4.9, photos.beach, 'New opening', 'coral-house'),
]

function dateString(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

function addDaysToDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateString(new Date())
  date.setDate(date.getDate() + days)
  return dateString(date)
}

function formatStayDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function defaultSearchCriteria(): SearchCriteria {
  const checkIn = new Date()
  checkIn.setDate(checkIn.getDate() + 7)
  const checkOut = new Date(checkIn)
  checkOut.setDate(checkOut.getDate() + 3)
  return { city: 'All destinations', checkIn: dateString(checkIn), checkOut: dateString(checkOut), guests: 2, rooms: 1 }
}

function getNightCount(criteria: SearchCriteria) {
  const nights = (new Date(`${criteria.checkOut}T00:00:00`).getTime() - new Date(`${criteria.checkIn}T00:00:00`).getTime()) / 86400000
  return Number.isFinite(nights) && nights > 0 ? nights : 1
}

function getBookingTotal(room: Room, criteria: SearchCriteria) {
  return Math.round(room.price * getNightCount(criteria) * criteria.rooms * 1.12)
}

function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>, calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    map: <><path d="M12 21s7-5.4 7-12a7 7 0 0 0-14 0c0 6.6 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" />,
    star: <path d="m12 2 3.1 6.3 6.9 1-5 4.8 1.2 6.9-6.2-3.2L5.8 21 7 14.1l-5-4.8 6.9-1L12 2Z" />, arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>, close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    bed: <><path d="M3 18v-7h18v7M3 14h18M7 11V7h5a4 4 0 0 1 4 4" /></>, wifi: <><path d="M5 12.6a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><path d="M12 20h.01" /></>,
    pool: <><path d="M4 15c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1M4 19c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1M9 12V5a2 2 0 0 1 4 0M9 9h7" /></>,
    spa: <><path d="M12 21c-4-2-7-5-7-9 4 0 6 1 7 4 1-3 3-4 7-4 0 4-3 7-7 9ZM12 16c-2-4-1-8 0-11 2 3 3 7 0 11Z" /></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>, check: <path d="m5 12 4 4L19 6" />, sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  }
  return <svg aria-hidden="true" className={className} width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">{paths[name]}</svg>
}

function SearchBar({ go, onSearch, initialCriteria = defaultSearchCriteria(), destinations }: { go?: (page: Page) => void; onSearch?: (criteria: SearchCriteria) => void; initialCriteria?: SearchCriteria; destinations?: string[] }) {
  const [criteria, setCriteria] = useState(initialCriteria)
  useEffect(() => setCriteria(initialCriteria), [initialCriteria.city, initialCriteria.checkIn, initialCriteria.checkOut, initialCriteria.guests, initialCriteria.rooms])
  const update = (next: Partial<SearchCriteria>) => setCriteria((current) => ({ ...current, ...next }))
  const search = () => { onSearch?.(criteria); go?.('search') }
  return <div className="grid w-full gap-px overflow-hidden rounded-2xl bg-white/40 text-left text-[#244b48] shadow-xl backdrop-blur lg:grid-cols-[1.15fr_1.35fr_1fr_auto] lg:rounded-full">
    <label className="flex min-w-0 items-center gap-3 bg-white px-5 py-3.5 lg:rounded-l-full"><Icon name="map" className="h-5 w-5 shrink-0 text-[#ff7657]" /><span className="min-w-0 flex-1"><small className="block text-[10px] font-bold uppercase tracking-widest text-[#244b48]/45">City</small><select aria-label="Choose destination" className="w-full bg-transparent text-sm font-semibold outline-none" value={criteria.city} onChange={(event) => update({ city: event.target.value })}>{['All destinations', ...(destinations ?? ['Goa', 'Kochi', 'Pondicherry', 'Alibaug'])].map((item) => <option key={item}>{item}</option>)}</select></span></label>
    <div className="flex min-w-0 items-center gap-3 bg-white px-5 py-3.5"><Icon name="calendar" className="h-5 w-5 shrink-0 text-[#ff7657]" /><div className="grid min-w-0 flex-1 grid-cols-2 gap-2"><label className="min-w-0"><small className="block text-[10px] font-bold uppercase tracking-widest text-[#244b48]/45">Check in</small><input aria-label="Check in date" className="w-full min-w-0 bg-transparent text-xs font-semibold outline-none" min={dateString(new Date())} value={criteria.checkIn} onChange={(event) => { const nextCheckIn = event.target.value; const nextCheckOut = criteria.checkOut > nextCheckIn ? criteria.checkOut : addDaysToDate(nextCheckIn, 1); update({ checkIn: nextCheckIn, checkOut: nextCheckOut }) }} type="date" /></label><label className="min-w-0"><small className="block text-[10px] font-bold uppercase tracking-widest text-[#244b48]/45">Check out</small><input aria-label="Check out date" className="w-full min-w-0 bg-transparent text-xs font-semibold outline-none" min={addDaysToDate(criteria.checkIn, 1)} value={criteria.checkOut} onChange={(event) => update({ checkOut: event.target.value })} type="date" /></label></div></div>
    <label className="flex min-w-0 items-center gap-3 bg-white px-5 py-3.5"><Icon name="users" className="h-5 w-5 shrink-0 text-[#ff7657]" /><span className="min-w-0 flex-1"><small className="block text-[10px] font-bold uppercase tracking-widest text-[#244b48]/45">Guests & rooms</small><select aria-label="Choose guests and rooms" className="w-full bg-transparent text-sm font-semibold outline-none" value={`${criteria.guests},${criteria.rooms}`} onChange={(event) => { const [guests, rooms] = event.target.value.split(',').map(Number); update({ guests, rooms }) }}><option value="1,1">1 guest, 1 room</option><option value="2,1">2 guests, 1 room</option><option value="3,1">3 guests, 1 room</option><option value="4,2">4 guests, 2 rooms</option><option value="5,2">5 guests, 2 rooms</option><option value="6,3">6 guests, 3 rooms</option></select></span></label>
    <button className="m-2 flex items-center justify-center gap-2 rounded-xl bg-[#ffd85e] px-7 py-4 font-bold transition hover:bg-[#ffcf38] lg:rounded-full" onClick={search}><Icon name="search" /> Search</button>
  </div>
}

function Header({ page, go }: { page: Page; go: (page: Page) => void }) {
  const [open, setOpen] = useState(false)
  const links: [string, Page][] = [['Find a stay', 'search'], ['Saved stays', 'saved'], ['Offers', 'offers'], ['My bookings', 'bookings'], ['Contact', 'contact']]
  return <header className="sticky top-0 z-40 border-b border-[#244b48]/10 bg-[#fffaf0]/90 backdrop-blur-xl">
    <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10">
      <button className="flex items-center gap-2" onClick={() => go('home')}><span className="grid h-9 w-9 place-items-center rounded-full bg-[#ff7657] text-white"><Icon name="sun" /></span><span className="font-serif text-2xl tracking-tight">Grandstay <i>Hotels</i></span></button>
      <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">{links.map(([label, target]) => <button className={page === target ? 'text-[#ff7657]' : 'hover:text-[#ff7657]'} key={target} onClick={() => go(target)}>{label}</button>)}</nav>
      <div className="hidden items-center gap-3 md:flex"><button className="px-3 text-sm font-semibold" onClick={() => go('auth')}>Log in</button><button className="rounded-full bg-[#244b48] px-5 py-2.5 text-sm font-bold text-white" onClick={() => go('auth')}>Register</button></div>
      <button aria-label={open ? 'Close navigation' : 'Open navigation'} className="rounded-full border border-[#244b48]/20 p-2 md:hidden" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button>
    </div>
    {open && <nav className="flex flex-col gap-3 border-t border-[#244b48]/10 bg-[#fffaf0] p-5 md:hidden">{links.map(([label, target]) => <button className="rounded-xl p-2 text-left font-semibold" key={target} onClick={() => { go(target); setOpen(false) }}>{label}</button>)}<button className="rounded-full bg-[#244b48] px-5 py-3 font-bold text-white" onClick={() => { go('auth'); setOpen(false) }}>Log in or register</button></nav>}
  </header>
}

function HotelCards({ go, hotels, savedIds, onToggleSave, city = 'All', sort = 'recommended', onSelectHotel }: { go: (page: Page) => void; hotels: Hotel[]; savedIds: string[]; onToggleSave: (hotelId: string) => void; city?: string; sort?: string; onSelectHotel?: (hotel: Hotel) => void }) {
  const visible = hotels.filter((hotel) => hotel.active && hotel.image && hotel.rooms.length > 0 && (city === 'All' || city === 'All destinations' || hotel.city === city)).sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'rating' ? b.rating - a.rating : 0)
  return <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">{visible.map((hotel) => { const isSaved = savedIds.includes(hotel.id); return <article className="group" key={hotel.id}>
    <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[1.6rem] bg-[#e9e1d4]"><img alt={hotel.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" src={hotel.image} /><span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">{hotel.tag}</span><button aria-label={isSaved ? `Remove ${hotel.name} from saved hotels` : `Save ${hotel.name}`} className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full shadow-sm backdrop-blur ${isSaved ? 'bg-[#ff7657] text-white' : 'bg-white/90'}`} onClick={() => onToggleSave(hotel.id)}><Icon name="heart" className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} /></button></div>
    <button className="w-full text-left" onClick={() => { onSelectHotel?.(hotel); go('hotel') }}><div className="flex gap-3 justify-between"><h3 className="font-serif text-xl leading-tight">{hotel.name}</h3><span className="flex shrink-0 items-center gap-1 text-sm font-bold"><Icon name="star" className="h-3.5 w-3.5 fill-[#ffd85e] stroke-[#d7a900]" />{hotel.rating}</span></div><p className="mt-1 text-sm text-[#244b48]/55">{hotel.city} · 2.4 km from centre</p><p className="mt-3 text-sm"><b className="text-base">₹{hotel.price.toLocaleString('en-IN')}</b> / night <span className="text-[#244b48]/40">+ taxes</span></p></button>
  </article>})}</div>
}

function PageTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <div className="mx-auto max-w-3xl py-12 text-center md:py-16"><p className="mb-3 text-xs font-bold uppercase tracking-[.24em] text-[#ff7657]">{eyebrow}</p><h1 className="font-serif text-4xl leading-none tracking-tight md:text-6xl">{title}</h1>{copy && <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-[#244b48]/65">{copy}</p>}</div>
}

function Home({ go, onSearch, onSelectHotel, onToggleSave, savedIds, hotels, destinations }: { go: (page: Page) => void; onSearch: (criteria: SearchCriteria) => void; onSelectHotel: (hotel: Hotel) => void; onToggleSave: (id: string) => void; savedIds: string[]; hotels: Hotel[]; destinations: string[] }) {
  return <><section className="mx-auto max-w-[1440px] px-3 pb-12 md:px-7"><div className="relative min-h-[660px] overflow-hidden rounded-[2rem] md:rounded-[3rem]"><img alt="Grandstay summer pool" className="absolute inset-0 h-full w-full object-cover" src={photos.hero} /><div className="absolute inset-0 bg-gradient-to-b from-[#0f251f]/15 via-transparent to-[#0f251f]/70" />
    <div className="relative flex min-h-[660px] flex-col items-center justify-end px-4 pb-5 text-center text-white md:px-10 md:pb-10"><div className="mb-auto mt-24 max-w-4xl"><p className="mb-5 text-xs font-bold uppercase tracking-[.28em]">Summer stays, made easy</p><h1 className="font-serif text-5xl leading-[.95] tracking-[-.045em] [text-shadow:0_3px_24px_rgb(0_0_0_/_35%)] sm:text-6xl md:text-8xl">Find your easy place.<br /><span className="italic">Stay a little longer.</span></h1></div><SearchBar go={go} onSearch={onSearch} destinations={destinations} /></div>
  </div></section>
  <section className="border-b border-[#244b48]/10"><div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-6 px-5 py-7 text-center md:grid-cols-4"><div><b className="text-lg">4.8/5</b><p className="text-xs text-[#244b48]/50">Guest rating</p></div><div><b className="text-lg">Free</b><p className="text-xs text-[#244b48]/50">Cancellation options</p></div><div><b className="text-lg">24/7</b><p className="text-xs text-[#244b48]/50">Guest support</p></div><div><b className="text-lg">Secure</b><p className="text-xs text-[#244b48]/50">Payments</p></div></div></section>
  <section className="mx-auto max-w-[1360px] px-5 py-12 md:px-10 md:py-20"><div className="mb-9 flex items-end justify-between"><div><p className="mb-3 text-xs font-bold uppercase tracking-[.22em] text-[#ff7657]">Popular this summer</p><h2 className="font-serif text-4xl tracking-tight md:text-6xl">Sunny side stays</h2></div><button className="flex items-center gap-2 border-b border-[#244b48] pb-1 text-sm font-bold" onClick={() => go('search')}>View all <Icon name="arrow" className="h-4 w-4" /></button></div>{hotels.some((hotel) => hotel.active && hotel.image && hotel.rooms.length > 0) ? <HotelCards go={go} hotels={hotels} savedIds={savedIds} onToggleSave={onToggleSave} onSelectHotel={onSelectHotel} /> : <p className="rounded-3xl bg-white p-8 text-center">New stays are being added. Check back soon.</p>}</section>
  <section className="mx-auto max-w-[1360px] px-5 pb-20 md:px-10"><div className="grid overflow-hidden rounded-[2.5rem] bg-[#bfe8e2] md:grid-cols-2"><div className="flex flex-col justify-center p-8 md:p-16"><p className="mb-4 text-xs font-bold uppercase tracking-[.22em] text-[#e45438]">Stay slow</p><h2 className="font-serif text-4xl leading-none md:text-6xl">Your out-of-office<br /><i>looks good on you.</i></h2><p className="mt-6 max-w-md text-[#244b48]/65">Thoughtful rooms, fresh breakfasts, blue pools and nowhere you need to be.</p><button className="mt-8 flex w-fit items-center gap-2 rounded-full bg-[#244b48] px-6 py-3.5 text-sm font-bold text-white" onClick={() => go('offers')}>Explore summer offers <Icon name="arrow" className="h-4 w-4" /></button></div><img alt="Summer hotel deck" className="h-full min-h-[400px] w-full object-cover" src={photos.beach} /></div></section></>
}

function SearchPage({ go, criteria, onSearch, onSelectHotel, onToggleSave, savedIds, hotels, destinations, amenities }: { go: (page: Page) => void; criteria: SearchCriteria; onSearch: (criteria: SearchCriteria) => void; onSelectHotel: (hotel: Hotel) => void; onToggleSave: (id: string) => void; savedIds: string[]; hotels: Hotel[]; destinations: string[]; amenities: Amenity[] }) {
  const [city, setCity] = useState(criteria.city === 'All destinations' ? 'All' : criteria.city)
  const [sort, setSort] = useState('recommended')
  const [maxPrice, setMaxPrice] = useState('any')
  const [selectedAmenity, setSelectedAmenity] = useState('any')
  useEffect(() => setCity(criteria.city === 'All destinations' ? 'All' : criteria.city), [criteria.city])
  const visibleHotels = hotels.filter((hotel) => hotel.active && hotel.image && hotel.rooms.length > 0 && (city === 'All' || hotel.city === city) && (maxPrice === 'any' || hotel.price <= Number(maxPrice)) && (selectedAmenity === 'any' || hotel.amenities.includes(selectedAmenity)))
  const count = visibleHotels.length
  return <div className="mx-auto max-w-[1360px] px-5 pb-20 md:px-10"><PageTitle eyebrow="Find your Grandstay" title="Hotels by city" copy="Beach towns, heritage streets and laid-back city escapes, all with the Grandstay feeling." /><div className="mb-8"><SearchBar initialCriteria={{ ...criteria, city }} destinations={destinations} onSearch={(next) => { onSearch(next); setCity(next.city === 'All destinations' ? 'All' : next.city) }} /></div><div className="mb-8 space-y-5 border-b border-[#244b48]/10 pb-6"><div className="flex flex-wrap gap-2">{['All', ...destinations].map((item) => <button className={`rounded-full px-4 py-2 text-sm font-bold transition ${city === item ? 'bg-[#244b48] text-white' : 'bg-white hover:bg-[#bfe8e2]'}`} onClick={() => { setCity(item); onSearch({ ...criteria, city: item === 'All' ? 'All destinations' : item }) }} key={item}>{item}</button>)}</div><div className="flex flex-wrap items-center gap-3"><span className="mr-auto text-sm text-[#244b48]/50">{count} matching stays</span><label className="flex items-center gap-2 text-sm"><span className="text-[#244b48]/55">Price</span><select aria-label="Maximum price per night" className="rounded-full border border-[#244b48]/15 bg-white px-3 py-2 font-semibold outline-none" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}><option value="any">Any price</option><option value="10000">Up to ₹10,000</option><option value="15000">Up to ₹15,000</option><option value="20000">Up to ₹20,000</option></select></label><label className="flex items-center gap-2 text-sm"><span className="text-[#244b48]/55">Amenity</span><select aria-label="Filter by amenity" className="max-w-48 rounded-full border border-[#244b48]/15 bg-white px-3 py-2 font-semibold outline-none" value={selectedAmenity} onChange={(event) => setSelectedAmenity(event.target.value)}><option value="any">Any feature</option>{amenities.map((amenity) => <option key={amenity.id} value={amenity.id}>{amenity.name}</option>)}</select></label><label className="flex items-center gap-2 text-sm"><span className="text-[#244b48]/55">Sort</span><select aria-label="Sort stays" className="rounded-full border border-[#244b48]/15 bg-white px-3 py-2 font-semibold outline-none" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="price">Lowest price</option><option value="rating">Guest rating</option></select></label></div></div>{count > 0 ? <HotelCards city={city} go={go} hotels={visibleHotels} savedIds={savedIds} onToggleSave={onToggleSave} onSelectHotel={onSelectHotel} sort={sort} /> : <div className="rounded-3xl bg-white px-6 py-16 text-center"><h2 className="font-serif text-3xl">No stays match those filters</h2><p className="mt-2 text-sm text-[#244b48]/60">Try adjusting the destination, price or amenities.</p><button className="mt-5 rounded-full bg-[#244b48] px-5 py-3 text-sm font-bold text-white" onClick={() => { setCity('All'); setMaxPrice('any'); setSelectedAmenity('any'); onSearch({ ...criteria, city: 'All destinations' }) }}>Clear filters</button></div>}</div>
}

function SavedPage({ go, hotels, savedIds, onToggleSave, onSelectHotel }: { go: (page: Page) => void; hotels: Hotel[]; savedIds: string[]; onToggleSave: (id: string) => void; onSelectHotel: (hotel: Hotel) => void }) {
  const savedHotels = hotels.filter((hotel) => savedIds.includes(hotel.id) && hotel.active)
  return <div className="mx-auto max-w-[1360px] px-5 pb-20 md:px-10"><PageTitle eyebrow="Your shortlist" title="Saved stays" copy="Keep the places you love close while you plan your next getaway." />{savedHotels.length ? <HotelCards go={go} hotels={savedHotels} savedIds={savedIds} onToggleSave={onToggleSave} onSelectHotel={onSelectHotel} /> : <div className="rounded-3xl bg-white px-6 py-16 text-center"><h2 className="font-serif text-3xl">Your shortlist is empty</h2><p className="mt-2 text-sm text-[#244b48]/60">Tap the heart on a stay to save it here.</p><button className="mt-5 rounded-full bg-[#244b48] px-5 py-3 text-sm font-bold text-white" onClick={() => go('search')}>Explore stays</button></div>}</div>
}

function HotelPage({ go, hotel, amenities }: { go: (page: Page) => void; hotel: Hotel; amenities: Amenity[] }) {
  const gallery = hotel.images.length ? hotel.images : [hotel.image]
  const startingPrice = hotel.rooms.length ? Math.min(...hotel.rooms.map((room) => room.price)) : hotel.price
  const featuredAmenities = amenities.filter((amenity) => hotel.amenities.includes(amenity.id))
  return <div className="mx-auto max-w-[1360px] px-5 pb-24 md:px-10"><div className="py-8 md:py-10"><p className="text-sm text-[#244b48]/55">{hotel.city} / {hotel.name}</p><div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><h1 className="font-serif text-4xl md:text-6xl">{hotel.name}</h1><p className="mt-2 flex items-center gap-2 text-sm"><Icon name="star" className="h-4 w-4 fill-[#ffd85e]" /> {hotel.rating} · {hotel.city}</p></div><button className="rounded-full bg-[#ff7657] px-6 py-3 font-bold text-white" onClick={() => go('rooms')}>Book your stay</button></div></div><div className="grid h-[300px] grid-cols-2 gap-2 overflow-hidden rounded-[2rem] sm:h-[380px] md:h-[520px] md:grid-cols-4 md:gap-3">{gallery.slice(0, 4).map((image, index) => <img alt={`${hotel.name} photo ${index + 1}`} className={`${index === 0 ? 'col-span-2 md:row-span-2' : index > 1 ? 'hidden md:block' : ''} h-full w-full object-cover`} key={`${image}-${index}`} src={image} />)}</div><div className="grid gap-10 py-10 md:grid-cols-[1fr_340px] md:py-12"><div><h2 className="font-serif text-3xl">A stay made for slowing down.</h2><p className="mt-4 max-w-2xl leading-relaxed text-[#244b48]/65">{hotel.description}</p><div className="mt-8 flex flex-wrap gap-3">{featuredAmenities.map((amenity) => <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold" key={amenity.id}>{amenity.name}</span>)}</div><button className="mt-8 font-bold text-[#e45438]" onClick={() => go('amenities')}>See all amenities →</button></div><aside className="rounded-3xl bg-white p-6 shadow-sm"><p className="text-sm text-[#244b48]/55">Rooms from</p><p className="mt-1 font-serif text-3xl">₹{startingPrice.toLocaleString('en-IN')} <small className="font-sans text-sm">/ night</small></p><p className="mt-2 text-xs text-[#244b48]/45">Browse current room types, prices and flexible rates.</p><button className="mt-5 w-full rounded-full bg-[#244b48] py-3.5 font-bold text-white" onClick={() => go('rooms')}>View rooms & tariffs</button></aside></div><div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-[#244b48]/10 bg-white p-4 shadow-2xl md:hidden"><div><p className="text-xs text-[#244b48]/50">From</p><b>₹{startingPrice.toLocaleString('en-IN')} / night</b></div><button className="rounded-full bg-[#ff7657] px-5 py-3 font-bold text-white" onClick={() => go('rooms')}>View rooms</button></div></div>
}

function RoomsPage({ go, hotel, criteria, onSelectRoom }: { go: (page: Page) => void; hotel: Hotel; criteria: SearchCriteria; onSelectRoom: (room: Room) => void }) {
  const rooms = hotel.rooms
  return <div className="mx-auto max-w-[1200px] px-5 pb-20 md:px-10"><PageTitle eyebrow={`${hotel.city} · ${getNightCount(criteria)} nights`} title="Pick your kind of calm" copy={`Choose a room at ${hotel.name}. Flexible rates include breakfast, Wi-Fi and pool access.`} /><div className="space-y-5">{rooms.map((room) => <article className="grid overflow-hidden rounded-3xl bg-white md:grid-cols-[300px_1fr_auto]" key={room.name}><img alt={room.name} className="h-56 w-full object-cover md:h-full" src={room.image} /><div className="p-6"><h2 className="font-serif text-3xl">{room.name}</h2><p className="mt-2 text-sm text-[#244b48]/60">{room.copy}</p><p className="mt-5 text-sm text-[#244b48]/60">Free cancellation until 7 days before arrival</p></div><div className="flex flex-row items-center justify-between p-6 md:flex-col md:items-end md:justify-center"><div className="text-right"><b className="text-xl">₹{room.price.toLocaleString('en-IN')}</b><p className="text-xs text-[#244b48]/50">per night + taxes</p></div><button className="mt-4 rounded-full bg-[#ff7657] px-5 py-3 text-sm font-bold text-white" onClick={() => { onSelectRoom(room); go('booking') }}>Select room</button></div></article>)}</div></div>
}

function AmenitiesPage({ go, hotel, amenities }: { go: (page: Page) => void; hotel: Hotel; amenities: Amenity[] }) {
  const hotelAmenities = amenities.filter((amenity) => hotel.amenities.includes(amenity.id))
  return <div className="mx-auto max-w-[1100px] px-5 pb-20 md:px-10"><PageTitle eyebrow={hotel.name} title="Amenities for easy days" copy={`The comforts and extras available during your stay in ${hotel.city}.`} />{hotelAmenities.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{hotelAmenities.map((amenity) => <div className="rounded-3xl bg-white p-7" key={amenity.id}><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#bfe8e2]"><Icon name={amenity.category === 'Wellness' ? 'spa' : amenity.category === 'Dining' ? 'sun' : amenity.category === 'Experiences' ? 'map' : 'check'} /></span><p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[#ff7657]">{amenity.category}</p><h2 className="mt-2 font-serif text-2xl">{amenity.name}</h2><p className="mt-2 text-sm text-[#244b48]/55">{amenity.description}</p></div>)}</div> : <p className="rounded-3xl bg-white p-8 text-center text-[#244b48]/60">This hotel has not listed its amenities yet.</p>}<div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-3xl bg-[#bfe8e2] p-7 sm:flex-row sm:items-center"><div><h2 className="font-serif text-2xl">Ready to plan your stay?</h2><p className="mt-1 text-sm text-[#244b48]/65">Explore rooms and find the right fit for your trip.</p></div><button className="rounded-full bg-[#244b48] px-5 py-3 text-sm font-bold text-white" onClick={() => go('rooms')}>Browse rooms</button></div></div>
}

function AdminPage({ hotels, onAddHotel, onToggleHotel, onSelectHotel }: { hotels: Hotel[]; onAddHotel: (hotel: Hotel) => void; onToggleHotel: (id: string) => void; onSelectHotel: (id: string) => void }) {
  const [notice, setNotice] = useState('')
  const addHotel = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name')).trim()
    const city = String(form.get('city')).trim()
    const image = String(form.get('image')).trim()
    if (hotels.some((hotel) => hotel.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setNotice(`A hotel named ${name} already exists. Use a distinct property name.`)
      return
    }
    const newHotel = createHotel(name, city, Number(form.get('price')), 4.8, image, String(form.get('tag')).trim() || 'New opening')
    newHotel.description = String(form.get('description')).trim()
    onAddHotel(newHotel)
    event.currentTarget.reset()
    setNotice(`${name} is now published and available to guests and the manager.`)
  }
  return <div className="mx-auto max-w-[1240px] px-5 pb-20 md:px-10">
    <PageTitle eyebrow="Operations · Admin" title="Hotel inventory" copy="Add and publish stays, monitor the catalog, and hand over full property management to the manager workspace." />
    <div className="mb-8 grid gap-4 sm:grid-cols-3"><div className="rounded-3xl bg-white p-6"><p className="text-sm text-[#244b48]/55">Total properties</p><b className="mt-2 block font-serif text-4xl">{hotels.length}</b></div><div className="rounded-3xl bg-white p-6"><p className="text-sm text-[#244b48]/55">Published</p><b className="mt-2 block font-serif text-4xl">{hotels.filter((hotel) => hotel.active).length}</b></div><div className="rounded-3xl bg-white p-6"><p className="text-sm text-[#244b48]/55">Destinations</p><b className="mt-2 block font-serif text-4xl">{new Set(hotels.map((hotel) => hotel.city)).size}</b></div></div>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <section className="rounded-3xl bg-white p-6 md:p-8"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#ff7657]">Catalog</p><h2 className="mt-1 font-serif text-3xl">All hotels</h2></div><span className="rounded-full bg-[#bfe8e2] px-3 py-1 text-xs font-bold">{hotels.length} properties</span></div>
        <div className="space-y-3">{hotels.map((hotel) => <article className="flex flex-col gap-4 rounded-2xl border border-[#244b48]/10 p-4 sm:flex-row sm:items-center" key={hotel.id}><img alt="" className="h-24 w-full rounded-xl object-cover sm:w-32" src={hotel.image} /><div className="min-w-0 flex-1"><h3 className="font-serif text-xl">{hotel.name}</h3><p className="text-sm text-[#244b48]/55">{hotel.city} · from ₹{hotel.price.toLocaleString('en-IN')} · {hotel.rooms.length} room types</p><span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${hotel.active ? 'bg-[#d9f4d8] text-[#28623a]' : 'bg-[#f6e6df] text-[#a3402c]'}`}>{hotel.active ? 'Published' : 'Hidden'}</span></div><div className="flex gap-2"><button className="rounded-full border border-[#244b48]/15 px-4 py-2 text-xs font-bold" onClick={() => onSelectHotel(hotel.id)}>Manage</button><button className="rounded-full bg-[#244b48] px-4 py-2 text-xs font-bold text-white" onClick={() => onToggleHotel(hotel.id)}>{hotel.active ? 'Unpublish' : 'Publish'}</button></div></article>)}</div>
      </section>
      <form className="space-y-4 rounded-3xl bg-[#bfe8e2] p-6 md:p-8" onSubmit={addHotel}><p className="text-xs font-bold uppercase tracking-widest text-[#e45438]">Quick publish</p><h2 className="font-serif text-3xl">Add a hotel</h2><p className="text-sm text-[#244b48]/65">New properties appear immediately in guest search and manager controls.</p>
        <Field label="Hotel name" name="name" placeholder="Grandstay Blue Lagoon" required />
        <div className="grid grid-cols-2 gap-3"><Field label="City" name="city" placeholder="Jaipur" required /><Field label="Starting price (₹)" minValue={1} name="price" placeholder="8500" type="number" required /></div>
        <Field label="Listing tag" name="tag" placeholder="Heritage stay" />
        <Field label="Cover image URL" name="image" placeholder="https://images.unsplash.com/..." type="url" required />
        <label className="block"><span className="mb-2 block text-sm font-bold">Short description</span><textarea className="min-h-24 w-full rounded-2xl border border-[#244b48]/15 bg-white px-4 py-3 outline-none" name="description" placeholder="Describe the stay and what makes it special." required /></label>
        <button className="w-full rounded-full bg-[#244b48] py-3.5 font-bold text-white">Publish hotel</button>
        {notice && <p aria-live="polite" className="text-sm font-semibold text-[#28623a]">{notice}</p>}
      </form>
    </div>
    <p className="mt-6 text-xs text-[#244b48]/50">Demo mode: catalog changes are saved in this browser only. Connect a shared backend before using this as a multi-user admin system.</p>
  </div>
}

function ManagerPage({ hotels, amenities, onUpdateHotel, onAddAmenity, onDeleteAmenity }: { hotels: Hotel[]; amenities: Amenity[]; onUpdateHotel: (id: string, changes: Partial<Hotel>) => void; onAddAmenity: (amenity: Amenity) => void; onDeleteAmenity: (id: string) => void }) {
  const [hotelId, setHotelId] = useState(hotels[0]?.id ?? '')
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState<'property' | 'amenities'>('property')
  const hotel = hotels.find((item) => item.id === hotelId) ?? hotels[0]
  const updateHotel = (changes: Partial<Hotel>) => hotel && onUpdateHotel(hotel.id, changes)
  const addRoom = () => {
    if (!hotel) return
    updateHotel({ rooms: [...hotel.rooms, { name: 'New room', price: hotel.price, copy: 'Add a room description', image: hotel.image }] })
    setNotice('Room type added. Changes are saved automatically.')
  }
  const addAmenity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name')).trim()
    if (amenities.some((amenity) => amenity.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setNotice(`“${name}” is already in the amenity catalog.`)
      return
    }
    const id = `amenity-${crypto.randomUUID()}`
    onAddAmenity({ id, name, category: String(form.get('category')).trim() || 'Essentials', description: String(form.get('description')).trim() })
    event.currentTarget.reset()
    setNotice(`${name} added to the shared amenity catalog. Assign it to properties below.`)
  }
  if (!hotel) return <div className="mx-auto max-w-4xl px-5 py-20 text-center"><PageTitle eyebrow="Operations · Manager" title="No hotels to manage" copy="Add and publish a hotel in the admin workspace first." /></div>
  return <div className="mx-auto max-w-[1240px] px-5 pb-20 md:px-10">
    <PageTitle eyebrow="Operations · Manager" title="Property workspace" copy="Edit every published property, set room rates and imagery, and curate a reusable amenity catalog." />
    <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-[#244b48] p-5 text-white sm:flex-row sm:items-center"><div><p className="text-xs uppercase tracking-widest text-white/55">Managing property</p><p className="mt-1 font-serif text-2xl">{hotel.name}</p></div><select aria-label="Choose property to manage" className="rounded-full bg-white px-4 py-3 text-sm font-bold text-[#244b48]" value={hotel.id} onChange={(event) => setHotelId(event.target.value)}>{hotels.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.city}</option>)}</select></div>
    <div className="mb-6 flex gap-2"><button className={`rounded-full px-5 py-2.5 text-sm font-bold ${tab === 'property' ? 'bg-[#244b48] text-white' : 'bg-white'}`} onClick={() => setTab('property')}>Property & room settings</button><button className={`rounded-full px-5 py-2.5 text-sm font-bold ${tab === 'amenities' ? 'bg-[#244b48] text-white' : 'bg-white'}`} onClick={() => setTab('amenities')}>Amenity catalog</button></div>
    {tab === 'property' ? <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
      <section className="space-y-4 rounded-3xl bg-white p-6 md:p-8"><div><p className="text-xs font-bold uppercase tracking-widest text-[#ff7657]">Property details</p><h2 className="mt-1 font-serif text-3xl">Listing settings</h2></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Hotel name" value={hotel.name} onChange={(value) => updateHotel({ name: value })} /><Field label="City" value={hotel.city} onChange={(value) => updateHotel({ city: value })} /><Field label="Starting price (₹)" minValue={1} type="number" value={String(hotel.price)} onChange={(value) => updateHotel({ price: Math.max(1, Number(value) || 1) })} /><Field label="Listing badge" value={hotel.tag} onChange={(value) => updateHotel({ tag: value })} /><Field label="Guest rating" minValue={0} maxValue={5} type="number" value={String(hotel.rating)} onChange={(value) => updateHotel({ rating: Math.min(5, Math.max(0, Number(value) || 0)) })} /></div>
        <label className="block"><span className="mb-2 block text-sm font-bold">Description</span><textarea className="min-h-28 w-full rounded-2xl border border-[#244b48]/15 bg-[#fffaf0] p-4" value={hotel.description} onChange={(event) => updateHotel({ description: event.target.value })} /></label>
        <label className="block"><span className="mb-2 block text-sm font-bold">Image gallery · one URL per line</span><textarea className="min-h-28 w-full rounded-2xl border border-[#244b48]/15 bg-[#fffaf0] p-4 text-sm" value={hotel.images.join('\n')} onChange={(event) => { const images = event.target.value.split('\n').map((image) => image.trim()).filter(Boolean); updateHotel({ images, image: images[0] ?? '', ...(images.length ? {} : { active: false }) }) }} /></label>
        {!hotel.image && <p className="text-sm text-[#a3402c]">Add at least one image URL to show this stay to guests.</p>}
        <label className="flex items-center gap-3 rounded-2xl bg-[#f3f5ef] p-4"><input checked={hotel.active} onChange={(event) => { if (event.target.checked && (!hotel.image || !hotel.rooms.length || !hotel.rooms.some((room) => room.name.trim() && room.price > 0))) { setNotice('A published hotel needs a cover image and at least one named, priced room.'); return } setNotice(''); updateHotel({ active: event.target.checked }) }} type="checkbox" /><span><b className="block text-sm">Published in guest search</b><small className="text-[#244b48]/55">A visible hotel needs an image and a priced room.</small></span></label>
        {notice && <p aria-live="polite" className="text-sm font-semibold text-[#a3402c]">{notice}</p>}
      </section>
      <section className="space-y-4 rounded-3xl bg-white p-6 md:p-8"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#ff7657]">Inventory</p><h2 className="mt-1 font-serif text-3xl">Room types & rates</h2></div><button className="rounded-full bg-[#244b48] px-4 py-2.5 text-xs font-bold text-white" onClick={addRoom}>Add room</button></div>
        {hotel.rooms.map((room, index) => <article className="space-y-3 rounded-2xl border border-[#244b48]/10 p-4" key={`${hotel.id}-${index}`}><div className="flex items-center justify-between"><b className="text-sm">{room.name || 'New room'}</b><button aria-label={`Remove ${room.name || 'room'} room type`} className="text-sm font-bold text-[#a3402c]" onClick={() => updateHotel({ rooms: hotel.rooms.filter((_, roomIndex) => roomIndex !== index), ...(hotel.rooms.length === 1 ? { active: false } : {}) })}>Remove</button></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Room name" value={room.name} onChange={(value) => updateHotel({ rooms: hotel.rooms.map((item, roomIndex) => roomIndex === index ? { ...item, name: value } : item) })} /><Field label="Price per night (₹)" minValue={1} type="number" value={String(room.price)} onChange={(value) => updateHotel({ rooms: hotel.rooms.map((item, roomIndex) => roomIndex === index ? { ...item, price: Math.max(1, Number(value) || 1) } : item) })} /><Field label="Room details" value={room.copy} onChange={(value) => updateHotel({ rooms: hotel.rooms.map((item, roomIndex) => roomIndex === index ? { ...item, copy: value } : item) })} /><Field label="Room image URL" type="url" value={room.image} onChange={(value) => updateHotel({ rooms: hotel.rooms.map((item, roomIndex) => roomIndex === index ? { ...item, image: value } : item) })} /></div></article>)}
        {!hotel.rooms.length && <p className="rounded-2xl bg-[#fffaf0] p-5 text-sm text-[#244b48]/55">No room types yet. Add a room to make this hotel bookable.</p>}
      </section>
      <section className="rounded-3xl bg-white p-6 md:col-span-2 md:p-8"><div><p className="text-xs font-bold uppercase tracking-widest text-[#ff7657]">Guest-facing features</p><h2 className="mt-1 font-serif text-3xl">Amenities at {hotel.name}</h2><p className="mt-2 text-sm text-[#244b48]/55">Selected amenities appear on the hotel page and its amenity list.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{amenities.map((amenity) => <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#244b48]/10 p-4" key={amenity.id}><input checked={hotel.amenities.includes(amenity.id)} onChange={(event) => updateHotel({ amenities: event.target.checked ? [...new Set([...hotel.amenities, amenity.id])] : hotel.amenities.filter((id) => id !== amenity.id) })} type="checkbox" /><span><b className="block text-sm">{amenity.name}</b><small className="text-[#244b48]/50">{amenity.category}</small></span></label>)}</div></section>
    </div> : <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
      <section className="rounded-3xl bg-white p-6 md:p-8"><p className="text-xs font-bold uppercase tracking-widest text-[#ff7657]">Shared amenity catalog</p><h2 className="mt-1 font-serif text-3xl">Manage features</h2><p className="mb-5 mt-2 text-sm text-[#244b48]/55">Amenities can be assigned to any property from the Property tab.</p><div className="space-y-3">{amenities.map((amenity) => <article className="flex items-center justify-between gap-4 rounded-2xl border border-[#244b48]/10 p-4" key={amenity.id}><div><h3 className="font-bold">{amenity.name}</h3><p className="text-sm text-[#244b48]/55">{amenity.description} · {amenity.category}</p></div><button className="text-xs font-bold text-[#a3402c]" onClick={() => onDeleteAmenity(amenity.id)}>Remove</button></article>)}</div></section>
      <form className="space-y-4 rounded-3xl bg-[#bfe8e2] p-6 md:p-8" onSubmit={addAmenity}><p className="text-xs font-bold uppercase tracking-widest text-[#e45438]">New guest feature</p><h2 className="font-serif text-3xl">Add an amenity</h2><Field label="Amenity name" name="name" placeholder="Rooftop restaurant" required /><Field label="Category" name="category" placeholder="Dining" required /><label className="block"><span className="mb-2 block text-sm font-bold">Guest-facing description</span><textarea className="min-h-24 w-full rounded-2xl border border-[#244b48]/15 bg-white px-4 py-3 outline-none" name="description" placeholder="What can guests expect?" required /></label><button className="w-full rounded-full bg-[#244b48] py-3.5 font-bold text-white">Add to catalog</button>{notice && <p aria-live="polite" className="text-sm font-semibold text-[#28623a]">{notice}</p>}</form>
    </div>}
    <p className="mt-6 text-xs text-[#244b48]/50">Manager changes instantly update guest listings. Demo data is stored in this browser, not shared across devices.</p>
  </div>
}

function BookingPage({ go, hotel, room, criteria, onContinue }: { go: (page: Page) => void; hotel: Hotel; room: Room; criteria: SearchCriteria; onContinue: (guest: GuestDetails) => void }) {
  return <div className="mx-auto max-w-[1100px] px-5 pb-20 md:px-10"><PageTitle eyebrow="Almost there" title="Complete your booking" copy="Your dates and room are held while you complete this demo checkout." /><div className="grid gap-6 md:grid-cols-[1fr_380px]"><form className="space-y-5 rounded-3xl bg-white p-7" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); onContinue({ name: `${form.get('firstName')} ${form.get('lastName')}`, email: String(form.get('email')), phone: String(form.get('phone')) }); go('payment') }}><h2 className="font-serif text-2xl">Guest details</h2><div className="grid gap-4 sm:grid-cols-2"><Field label="First name" name="firstName" placeholder="Aarav" required /><Field label="Last name" name="lastName" placeholder="Mehta" required /><Field label="Email" name="email" placeholder="aarav@example.com" type="email" required /><Field label="Phone" name="phone" placeholder="+91 98765 43210" type="tel" required /></div><label className="block"><span className="mb-2 block text-sm font-bold">Special requests <span className="font-normal text-[#244b48]/45">(optional)</span></span><textarea className="min-h-28 w-full rounded-2xl border border-[#244b48]/15 bg-[#fffaf0] p-4 outline-none" placeholder="Tell us what would make your stay special…" /></label><button className="w-full rounded-full bg-[#ff7657] py-3.5 font-bold text-white">Continue to payment</button></form><BookingSummary hotel={hotel} room={room} criteria={criteria} /></div></div>
}

function Field({ label, placeholder, type = 'text', name, required = false, minLength, minValue, maxValue, value, onChange }: { label: string; placeholder?: string; type?: string; name?: string; required?: boolean; minLength?: number; minValue?: number; maxValue?: number; value?: string; onChange?: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><input autoComplete={name === 'email' ? 'email' : name === 'phone' ? 'tel' : name === 'lastName' ? 'family-name' : name?.toLowerCase().includes('name') ? 'given-name' : undefined} className="w-full rounded-2xl border border-[#244b48]/15 bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#ff7657]" max={maxValue} min={minValue ?? (type === 'number' ? 0 : undefined)} minLength={minLength} name={name} onChange={onChange ? (event) => onChange(event.target.value) : undefined} placeholder={placeholder} required={required} type={type} value={value} /></label>
}

function BookingSummary({ hotel, room, criteria }: { hotel: Hotel; room: Room; criteria: SearchCriteria }) {
  const subtotal = room.price * getNightCount(criteria) * criteria.rooms
  const taxes = Math.round(subtotal * 0.12)
  return <aside className="h-fit rounded-3xl bg-[#244b48] p-6 text-white"><img alt={hotel.name} className="mb-5 aspect-[16/9] w-full rounded-2xl object-cover" src={hotel.image} /><h2 className="font-serif text-2xl">{hotel.name}</h2><p className="mt-1 text-sm text-white/55">{room.name} · {getNightCount(criteria)} nights</p><div className="my-5 border-t border-white/15" /><div className="space-y-3 text-sm"><p className="flex justify-between gap-4"><span>{formatStayDate(criteria.checkIn)} – {formatStayDate(criteria.checkOut)}</span><span>{criteria.guests} guests</span></p><p className="flex justify-between"><span>Room total</span><span>₹{subtotal.toLocaleString('en-IN')}</span></p><p className="flex justify-between"><span>Taxes & fees</span><span>₹{taxes.toLocaleString('en-IN')}</span></p><p className="flex justify-between border-t border-white/15 pt-4 text-base font-bold"><span>Total</span><span>₹{(subtotal + taxes).toLocaleString('en-IN')}</span></p></div></aside>
}

function BookingsPage({ go, booking, onCancel, onViewHotel }: { go: (page: Page) => void; booking: Booking | null; onCancel: () => void; onViewHotel: () => void }) {
  return <div className="mx-auto max-w-[1000px] px-5 pb-20 md:px-10"><PageTitle eyebrow="Your trips" title="My bookings" copy="Everything for your upcoming and past Grandstays, all in one place." />{booking ? <div className="overflow-hidden rounded-3xl bg-white"><div className="grid md:grid-cols-[300px_1fr]"><img alt={booking.hotelName} className="h-64 w-full object-cover md:h-full" src={booking.image} /><div className="p-7"><div className="flex items-center justify-between"><span className={`rounded-full px-3 py-1 text-xs font-bold ${booking.status === 'Confirmed' ? 'bg-[#d9f4d8] text-[#28623a]' : 'bg-[#f6e6df] text-[#a3402c]'}`}>{booking.status}</span><span className="text-xs text-[#244b48]/45">{booking.code}</span></div><h2 className="mt-5 font-serif text-3xl">{booking.hotelName}</h2><p className="mt-2 text-sm text-[#244b48]/55">{formatStayDate(booking.checkIn)} – {formatStayDate(booking.checkOut)} · {booking.roomName} · {booking.guests} guests · {booking.city}</p><p className="mt-4 font-bold">₹{booking.total.toLocaleString('en-IN')} <span className="font-normal text-[#244b48]/50">including taxes</span></p><div className="mt-6 flex flex-wrap gap-3"><button className="rounded-full bg-[#244b48] px-5 py-2.5 text-sm font-bold text-white" onClick={onViewHotel}>View hotel</button>{booking.status === 'Confirmed' && <button className="rounded-full border border-[#244b48]/20 px-5 py-2.5 text-sm font-bold" onClick={onCancel}>Cancel booking</button>}</div></div></div></div> : <div className="rounded-3xl bg-white px-6 py-16 text-center"><h2 className="font-serif text-3xl">No bookings yet</h2><p className="mt-2 text-sm text-[#244b48]/60">Your next easy escape is waiting to be found.</p><button className="mt-5 rounded-full bg-[#244b48] px-5 py-3 text-sm font-bold text-white" onClick={() => go('search')}>Find a stay</button></div>}</div>
}

function PaymentPage({ go, hotel, room, criteria, onConfirm }: { go: (page: Page) => void; hotel: Hotel; room: Room; criteria: SearchCriteria; onConfirm: () => boolean }) {
  const [paid, setPaid] = useState(false)
  if (paid) return <div className="mx-auto max-w-xl px-5 py-24 text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#bfe8e2]"><Icon name="check" className="h-10 w-10" /></span><h1 className="mt-6 font-serif text-5xl">Your stay is confirmed!</h1><p className="mt-4 text-[#244b48]/60">Your booking details are ready. You can review or cancel the stay from My bookings.</p><button className="mt-8 rounded-full bg-[#244b48] px-6 py-3 font-bold text-white" onClick={() => go('bookings')}>View my booking</button></div>
  return <div className="mx-auto max-w-[1100px] px-5 pb-20 md:px-10"><PageTitle eyebrow="Secure checkout" title="Payment" copy="This interactive preview does not charge a card or store payment details." /><div className="grid gap-6 md:grid-cols-[1fr_380px]"><form className="rounded-3xl bg-white p-7" onSubmit={(event) => { event.preventDefault(); if (onConfirm()) setPaid(true) }}><div className="mb-6 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#bfe8e2]"><Icon name="card" /></span><div><h2 className="font-serif text-2xl">Payment method</h2><p className="text-xs text-[#244b48]/50">Choose how you would like to settle your stay.</p></div></div><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#244b48]/15 p-4"><input className="mt-1 accent-[#244b48]" defaultChecked name="paymentMethod" type="radio" value="property" /><span><b className="block text-sm">Pay at the property</b><span className="mt-1 block text-xs text-[#244b48]/55">No payment is collected during this preview checkout.</span></span></label><label className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#244b48]/15 p-4"><input className="mt-1 accent-[#244b48]" name="paymentMethod" type="radio" value="card" /><span><b className="block text-sm">Card at check-in</b><span className="mt-1 block text-xs text-[#244b48]/55">We will not ask for or store card details online.</span></span></label><button className="mt-6 w-full rounded-full bg-[#ff7657] py-3.5 font-bold text-white">Confirm reservation · ₹{getBookingTotal(room, criteria).toLocaleString('en-IN')}</button></form><BookingSummary hotel={hotel} room={room} criteria={criteria} /></div></div>
}

function OffersPage({ go }: { go: (page: Page) => void }) {
  const offers = [['Stay 4, pay for 3', 'One more sunset, on us.', photos.beach], ['Monsoon mood', 'Save 20% on slow, rainy escapes.', photos.terrace], ['Breakfast & bubbles', 'Wake up to our best morning spread.', photos.patio]]
  return <div className="mx-auto max-w-[1200px] px-5 pb-20 md:px-10"><PageTitle eyebrow="A little extra" title="Grandstay offers" copy="Seasonal escapes and thoughtful extras for even better holidays." /><div className="grid gap-6 md:grid-cols-3">{offers.map(([title, copy, image]) => <article className="overflow-hidden rounded-3xl bg-white" key={title}><img alt={title} className="aspect-[4/3] w-full object-cover" src={image} /><div className="p-6"><h2 className="font-serif text-3xl">{title}</h2><p className="mt-2 text-[#244b48]/55">{copy}</p><button className="mt-5 flex items-center gap-2 text-sm font-bold text-[#e45438]" onClick={() => go('search')}>Explore offer <Icon name="arrow" className="h-4 w-4" /></button></div></article>)}</div></div>
}

function ContactPage() {
  const [sent, setSent] = useState(false)
  return <div className="mx-auto max-w-[1100px] px-5 pb-20 md:px-10"><PageTitle eyebrow="Here to help" title="Talk to a human" copy="Questions, changes or just looking for a recommendation? Our stay team is around every day." /><div className="grid gap-6 md:grid-cols-2"><div className="rounded-3xl bg-[#bfe8e2] p-8"><h2 className="font-serif text-3xl">Guest support</h2><p className="mt-3 text-[#244b48]/60">Daily, 8am–10pm IST</p><a className="mt-8 flex items-center gap-3 font-bold" href="tel:+918045678900"><Icon name="phone" /> +91 80 4567 8900</a><a className="mt-4 flex items-center gap-3 font-bold" href="mailto:hello@grandstayhotels.com"><Icon name="mail" /> hello@grandstayhotels.com</a></div><form className="space-y-4 rounded-3xl bg-white p-8" onSubmit={(event) => { event.preventDefault(); setSent(true); event.currentTarget.reset() }}><Field label="Your name" name="name" placeholder="Your name" required /><Field label="Email" name="email" placeholder="you@example.com" type="email" required /><label className="block"><span className="mb-2 block text-sm font-bold">How can we help?</span><textarea className="min-h-28 w-full rounded-2xl border border-[#244b48]/15 bg-[#fffaf0] p-4 outline-none" name="message" required /></label><button className="rounded-full bg-[#244b48] px-6 py-3 font-bold text-white">Send message</button>{sent && <p aria-live="polite" className="text-sm font-semibold text-[#28623a]">This contact form is a demo. Please use the email or phone above to reach support.</p>}</form></div></div>
}

function AuthPage({ go }: { go: (page: Page) => void }) {
  const [register, setRegister] = useState(false)
  const [message, setMessage] = useState('')
  return <div className="grid min-h-[calc(100vh-74px)] md:grid-cols-2"><div className="relative hidden md:block"><img alt="Grandstay pool" className="absolute inset-0 h-full w-full object-cover" src={photos.resort} /><div className="absolute inset-0 bg-[#244b48]/25" /><p className="absolute bottom-12 left-12 max-w-md font-serif text-5xl leading-none text-white">Good stays start with a little sunshine.</p></div><div className="flex items-center justify-center px-5 py-16"><form className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm" onSubmit={(event) => { event.preventDefault(); setMessage('Account sign-in is not connected in this preview. You can still browse and book as a guest.') }}><p className="text-xs font-bold uppercase tracking-[.22em] text-[#ff7657]">{register ? 'Join Grandstay' : 'Welcome back'}</p><h1 className="mt-3 font-serif text-4xl">{register ? 'Create your account' : 'Log in to your stays'}</h1><div className="mt-7 space-y-4">{register && <Field label="Full name" name="fullName" placeholder="Your name" required />}<Field label="Email" name="email" placeholder="you@example.com" type="email" required /><Field label="Password" name="password" placeholder="At least 8 characters" type="password" required minLength={8} /></div><button className="mt-6 w-full rounded-full bg-[#244b48] py-3.5 font-bold text-white">{register ? 'Create account' : 'Log in'}</button>{message && <p aria-live="polite" className="mt-4 text-center text-sm text-[#a3402c]">{message}</p>}<p className="mt-5 text-center text-sm text-[#244b48]/60">{register ? 'Already have an account?' : 'New to Grandstay?'} <button className="font-bold text-[#e45438]" type="button" onClick={() => { setRegister(!register); setMessage('') }}>{register ? 'Log in' : 'Register'}</button></p><button className="mt-5 w-full text-center text-sm font-semibold underline" type="button" onClick={() => go('home')}>Continue browsing as a guest</button></form></div></div>
}

function Footer({ go }: { go: (page: Page) => void }) {
  return <footer className="bg-[#244b48] text-white"><div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-10"><div><p className="font-serif text-3xl">Grandstay <i>Hotels</i></p><p className="mt-3 max-w-xs text-sm text-white/55">Chill stays, warm welcomes and summer feelings all year round.</p></div><div><p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#ffd85e]">Explore</p><div className="grid gap-2 text-sm text-white/65"><button className="text-left" onClick={() => go('search')}>Find hotels</button><button className="text-left" onClick={() => go('saved')}>Saved stays</button><button className="text-left" onClick={() => go('offers')}>Offers</button><button className="text-left" onClick={() => go('bookings')}>My bookings</button></div></div><div><p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#ffd85e]">Grandstay</p><div className="grid gap-2 text-sm text-white/65"><button className="text-left" onClick={() => go('contact')}>Contact us</button><span>Privacy</span><span>Terms</span></div></div><div><p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#ffd85e]">Operations</p><div className="grid gap-2 text-sm text-white/65"><button className="text-left" onClick={() => go('admin')}>Admin dashboard</button><button className="text-left" onClick={() => go('manager')}>Manager workspace</button></div></div></div><div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/40">© 2026 Grandstay Hotels. Stay easy.</div></footer>
}

export default function App() {
  const pageNames: Page[] = ['home', 'search', 'hotel', 'rooms', 'amenities', 'booking', 'bookings', 'payment', 'offers', 'contact', 'auth', 'admin', 'manager', 'saved']
  const readPage = (): Page => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '')
    if (pageNames.includes(path as Page)) return path as Page
    const hash = window.location.hash.slice(1)
    return pageNames.includes(hash as Page) ? hash as Page : 'home'
  }
  const [page, setPage] = useState<Page>(readPage)
  const [hotels, setHotels] = useState<Hotel[]>(() => loadStored('grandstay-hotels', defaultHotels))
  const [amenities, setAmenities] = useState<Amenity[]>(() => loadStored('grandstay-amenities', defaultAmenities))
  const [savedIds, setSavedIds] = useState<string[]>(() => loadStored('grandstay-favorites', []))
  const [criteria, setCriteria] = useState<SearchCriteria>(defaultSearchCriteria)
  const [selectedHotelId, setSelectedHotelId] = useState(defaultHotels[0].id)
  const selectedHotel = hotels.find((hotel) => hotel.id === selectedHotelId) ?? hotels[0]
  const [selectedRoom, setSelectedRoom] = useState<Room>(defaultHotels[0].rooms[0])
  const [guestDetails, setGuestDetails] = useState<GuestDetails | null>(null)
  const [booking, setBooking] = useState<Booking | null>(() => loadStored('grandstay-booking', null))
  const destinations = [...new Set(hotels.filter((hotel) => hotel.active && hotel.image && hotel.rooms.length > 0).map((hotel) => hotel.city))].sort()
  const go = (next: Page) => { setPage(next); window.history.pushState({ page: next }, '', `/${next}`); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  useEffect(() => { const pop = () => setPage(readPage()); window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop) }, [])
  useEffect(() => saveStored('grandstay-hotels', hotels), [hotels])
  useEffect(() => saveStored('grandstay-amenities', amenities), [amenities])
  useEffect(() => saveStored('grandstay-favorites', savedIds), [savedIds])
  useEffect(() => saveStored('grandstay-booking', booking), [booking])
  useEffect(() => {
    const syncCatalog = (event: StorageEvent) => {
      if (event.key === 'grandstay-hotels') setHotels(loadStored('grandstay-hotels', defaultHotels))
      if (event.key === 'grandstay-amenities') setAmenities(loadStored('grandstay-amenities', defaultAmenities))
      if (event.key === 'grandstay-favorites') setSavedIds(loadStored('grandstay-favorites', []))
      if (event.key === 'grandstay-booking') setBooking(loadStored<Booking | null>('grandstay-booking', null))
    }
    window.addEventListener('storage', syncCatalog)
    return () => window.removeEventListener('storage', syncCatalog)
  }, [])
  const updateHotel = (id: string, changes: Partial<Hotel>) => setHotels((current) => current.map((hotel) => hotel.id === id ? { ...hotel, ...changes } : hotel))
  const addHotel = (hotel: Hotel) => { setHotels((current) => [...current, hotel]); setSelectedHotelId(hotel.id) }
  const addAmenity = (amenity: Amenity) => setAmenities((current) => [...current, amenity])
  const toggleFavorite = (hotelId: string) => setSavedIds((current) => current.includes(hotelId) ? current.filter((id) => id !== hotelId) : [...current, hotelId])
  const deleteAmenity = (id: string) => {
    setAmenities((current) => current.filter((amenity) => amenity.id !== id))
    setHotels((current) => current.map((hotel) => ({ ...hotel, amenities: hotel.amenities.filter((amenityId) => amenityId !== id) })))
  }
  const completeBooking = () => {
    if (!guestDetails) { go('booking'); return false }
    setBooking({ code: `GS${Date.now().toString().slice(-6)}`, hotelName: selectedHotel.name, city: selectedHotel.city, image: selectedHotel.image, roomName: selectedRoom.name, checkIn: criteria.checkIn, checkOut: criteria.checkOut, guests: criteria.guests, total: getBookingTotal(selectedRoom, criteria), status: 'Confirmed' })
    return true
  }
  const pages: Record<Page, React.ReactNode> = {
    home: <Home go={go} hotels={hotels} destinations={destinations} savedIds={savedIds} onToggleSave={toggleFavorite} onSearch={setCriteria} onSelectHotel={(hotel) => { setSelectedHotelId(hotel.id); if (hotel.rooms[0]) setSelectedRoom(hotel.rooms[0]) }} />,
    search: <SearchPage go={go} hotels={hotels} destinations={destinations} amenities={amenities} savedIds={savedIds} onToggleSave={toggleFavorite} criteria={criteria} onSearch={setCriteria} onSelectHotel={(hotel) => { setSelectedHotelId(hotel.id); if (hotel.rooms[0]) setSelectedRoom(hotel.rooms[0]) }} />,
    hotel: <HotelPage go={go} hotel={selectedHotel} amenities={amenities} />,
    rooms: <RoomsPage go={go} hotel={selectedHotel} criteria={criteria} onSelectRoom={setSelectedRoom} />,
    amenities: <AmenitiesPage go={go} hotel={selectedHotel} amenities={amenities} />,
    booking: <BookingPage go={go} hotel={selectedHotel} room={selectedRoom} criteria={criteria} onContinue={setGuestDetails} />,
    bookings: <BookingsPage go={go} booking={booking} onCancel={() => setBooking((current) => current ? { ...current, status: 'Cancelled' } : null)} onViewHotel={() => { const bookedHotel = hotels.find((hotel) => hotel.name === booking?.hotelName); if (bookedHotel) setSelectedHotelId(bookedHotel.id); go('hotel') }} />,
    payment: <PaymentPage go={go} hotel={selectedHotel} room={selectedRoom} criteria={criteria} onConfirm={completeBooking} />,
    offers: <OffersPage go={go} />,
    contact: <ContactPage />,
    auth: <AuthPage go={go} />,
    admin: <AdminPage hotels={hotels} onAddHotel={addHotel} onToggleHotel={(id) => updateHotel(id, { active: !hotels.find((hotel) => hotel.id === id)?.active })} onSelectHotel={(id) => { setSelectedHotelId(id); go('manager') }} />,
    manager: <ManagerPage hotels={hotels} amenities={amenities} onUpdateHotel={updateHotel} onAddAmenity={addAmenity} onDeleteAmenity={deleteAmenity} />,
    saved: <SavedPage go={go} hotels={hotels} savedIds={savedIds} onToggleSave={toggleFavorite} onSelectHotel={(hotel) => { setSelectedHotelId(hotel.id); if (hotel.rooms[0]) setSelectedRoom(hotel.rooms[0]) }} />,
  }
  return <main className="min-h-screen bg-[#fffaf0] text-[#244b48]"><Header page={page} go={go} />{pages[page]}{page !== 'auth' && <Footer go={go} />}</main>
}
