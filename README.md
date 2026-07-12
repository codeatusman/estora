# React Native Full Course 2026 — Build Estora (Full Stack Real Estate App for iOS & Android)

### 📺 Watch the full tutorial: (https://youtu.be/O-ZQmXoeFdM)

![Estora Banner](./assets/images/thumbnail.png)

---

## 🛠 Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Framework  | React Native + Expo           |
| Styling    | NativeWind (Tailwind CSS)     |
| Auth       | Clerk                         |
| Backend    | Supabase (Database + Storage) |
| Navigation | Expo Router                   |
| State      | Zustand                       |
| Maps       | OpenStreetMap + WebView       |

---

## 🏢 Industry Adoption & Why React Native

React Native is a production-grade framework trusted by some of the world's most demanding engineering teams:

| Company       | App(s)                                 |
| ------------- | -------------------------------------- |
| **Meta**      | Facebook, Facebook Ads Manager         |
| **Instagram** | Instagram (entire mobile app)          |
| **Shopify**   | Shopify Mobile, Shop                   |
| **Microsoft** | Xbox Game Pass, Microsoft Teams mobile |
| **Coinbase**  | Coinbase mobile app                    |
| **Discord**   | Discord mobile                         |
| **Walmart**   | Walmart app (rewritten from native)    |
| **Bloomberg** | Bloomberg mobile                       |

These are not hobby projects — they serve hundreds of millions of users under extreme performance and reliability constraints.

**If you already know JavaScript, React Native is the shortest path to mobile.**

- No new language to learn. Swift, Kotlin, and Objective-C each require months to reach productivity. React Native runs on the JavaScript you already know.
- React concepts transfer directly. If you understand components, props, state, hooks, and `useEffect`, you already understand 80 % of React Native. The mental model is identical.
- One codebase, two platforms. A single repository ships to both iOS and Android with platform-specific polish available when you need it.
- The ecosystem is the web ecosystem. npm packages, TypeScript, ESLint, Prettier, Zustand, React Query — everything you use in a React web project works here too.
- Expo(framework) removes the native toolchain friction. No Xcode project file juggling or Gradle configuration headaches for the majority of apps. `npx expo start` and you are running on a real device in under a minute.

For a JavaScript developer, there is no faster path from web to production-grade mobile.

---

## ⚖️ React Native vs React — What Changes

If you are coming from React for the web, the logic and component model are identical. What changes is the set of primitives — instead of HTML elements, you use React Native's built-in components.

| Concept             | React (Web)                      | React Native                              | Notes                                                                             |
| ------------------- | -------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| **Container / div** | `<div>`                          | `<View>`                                  | The fundamental layout block. Uses Flexbox by default.                            |
| **Text**            | `<p>`, `<h1>` – `<h6>`, `<span>` | `<Text>`                                  | Every string must be inside `<Text>`. No bare text nodes.                         |
| **Image**           | `<img src="…">`                  | `<Image source={{ uri: '…' }} />`         | Requires explicit `width` and `height` or a flex style.                           |
| **Button**          | `<button>`                       | `<TouchableOpacity>` / `<Pressable>`      | Gives full control over the pressed appearance. `<Button>` exists but is minimal. |
| **Scrollable list** | `<ul>` + CSS overflow            | `<ScrollView>` / `<FlatList>`             | `FlatList` is preferred for long lists — it virtualises rows for performance.     |
| **Text input**      | `<input type="text">`            | `<TextInput>`                             | `onChangeText` instead of `onChange`. No synthetic event object needed.           |
| **Click / tap**     | `onClick`                        | `onPress`                                 | Works for `TouchableOpacity`, `Pressable`, and most interactive components.       |
| **Styling**         | CSS classes / CSS-in-JS          | `StyleSheet.create({})` or NativeWind     | No cascade. No `class` attribute. Styles are plain JavaScript objects.            |
| **Navigation**      | React Router / Next.js           | Expo Router (file-based, same convention) | Same file-based concept as Next.js App Router.                                    |
| **Modal**           | `<dialog>` / CSS overlay         | `<Modal>`                                 | Built-in component with `visible` prop and `animationType`.                       |
| **Safe area**       | Not needed (browser handles it)  | `<SafeAreaView>`                          | Prevents content from sitting under the notch or home indicator.                  |
| **Platform check**  | `navigator.userAgent`            | `Platform.OS === 'ios'`                   | `Platform.select({})` lets you return different values per platform inline.       |
| **Async storage**   | `localStorage`                   | `AsyncStorage` / `expo-secure-store`      | All device storage is asynchronous. No synchronous equivalent of `localStorage`.  |

The component swap is the only real hurdle. Once that mapping is in your head, everything else — state, effects, context, data fetching, routing — works exactly as it does in React.

---

## ✅ Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A [Clerk](https://clerk.com) account
- A [Supabase](https://supabase.com) account
- iOS Simulator (Mac only) or Android Emulator

---

## 🚀 Get Started

### 1. Clone and install

```bash
git clone https://github.com/codeatusman/estora.git
cd estora
npm install
```

### 2. Environment variables

Create a `.env` file in the root:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.

### 3. Start the app

```bash
npx expo start -c
```

For native builds (needed after changing `app.json`):

```bash
npx expo prebuild --clean
npx expo run:ios      # Mac only
npx expo run:android
```

---

## 📁 Project Structure

```
estora/
├── app/
│   ├── (auth)/          # Sign in / Sign up screens
│   ├── (root)/
│   │   ├── (tabs)/      # Home, Explore, Favorites, Profile, Add Listing
│   │   └── property/    # Property detail + Map screens
│   └── _layout.tsx      # Root layout
├── assets/
│   └── images/
├── components/          # FeaturedCard, PropertyCard, FilterModal
├── constants/           # filters.ts — property type, bedroom, price options
├── hooks/               # useSavedProperty, useSupabase, useUserSync
├── lib/                 # supabase.ts, utils.ts
├── services/            # properties.ts, saved.ts — reusable Supabase helpers
├── store/               # filterStore.ts, userStore.ts
├── types/               # index.ts — shared interfaces
└── .env                 # Never commit this!
```

---

## 🗄 Supabase Setup

Run all SQL below in order inside your Supabase SQL editor.

### Users Table

```sql
create table users (
  id uuid default gen_random_uuid() primary key,
  clerk_id text unique not null,
  email text not null,
  first_name text,
  last_name text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamp with time zone default now()
);
```

### User RLS Policies

```sql
alter table users enable row level security;

create policy "Users can insert own row"
on users for insert
with check (clerk_id = auth.jwt()->>'sub');

create policy "Users can read own row"
on users for select
using (clerk_id = auth.jwt()->>'sub');

create policy "Users can update own row"
on users for update
using (clerk_id = auth.jwt()->>'sub');
```

### Properties Table

```sql
create table properties (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price numeric not null,
  type text not null, -- e.g. 'apartment' | 'house' | 'villa' | 'studio' | 'townhouse' | 'penthouse' | 'plot'
  bedrooms int not null default 1,
  bathrooms int not null default 1,
  area_sqft int,
  address text not null,
  city text not null,
  latitude float,
  longitude float,
  images text[] default '{}',
  is_featured boolean default false,
  is_sold boolean default false,
  created_at timestamp with time zone default now()
);

alter table properties enable row level security;

create policy "Properties are publicly readable"
on properties for select
using (true);
```

### Saved Properties Table

```sql
create table saved_properties (
  id uuid default gen_random_uuid() primary key,
  user_clerk_id text not null references users(clerk_id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_clerk_id, property_id)
);

alter table saved_properties enable row level security;

create policy "Users can read own saved properties"
on saved_properties for select
using (user_clerk_id = auth.jwt()->>'sub');

create policy "Users can insert saved properties"
on saved_properties for insert
with check (user_clerk_id = auth.jwt()->>'sub');

create policy "Users can delete own saved properties"
on saved_properties for delete
using (user_clerk_id = auth.jwt()->>'sub');
```

### Storage Bucket

```sql
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true);

create policy "Public can read property images"
on storage.objects for select
using (bucket_id = 'property-images');
```

### Admin RLS Policies

```sql
alter table users
add column if not exists is_admin boolean default false;

create policy "Admin can insert properties"
on properties for insert
with check (
  exists (
    select 1 from users
    where clerk_id = auth.jwt()->>'sub'
    and is_admin = true
  )
);

create policy "Admin can update properties"
on properties for update
using (
  exists (
    select 1 from users
    where clerk_id = auth.jwt()->>'sub'
    and is_admin = true
  )
);

create policy "Admin can delete properties"
on properties for delete
using (
  exists (
    select 1 from users
    where clerk_id = auth.jwt()->>'sub'
    and is_admin = true
  )
);

create policy "Admin can upload property images"
on storage.objects for insert
with check (
  bucket_id = 'property-images'
  and exists (
    select 1 from users
    where clerk_id = auth.jwt()->>'sub'
    and is_admin = true
  )
);
```

### Make yourself an admin

After signing up, run this in Supabase SQL editor (replace with your Clerk user ID):

```sql
update users set is_admin = true where clerk_id = 'user_xxxxxxxxxxxxxxxx';
```

---

### 🌱 Seed Properties

All seed images are Unsplash photos of homes, apartments, villas, interiors, vacant land, or commercial buildings — matched to each listing type.

```sql
insert into properties (
  title, description, price, type, bedrooms, bathrooms,
  area_sqft, address, city, latitude, longitude, images, is_featured
) values

-- ── Featured Properties ──────────────────────────────────────────────────

(
  'DHA Phase 6 Grand Villa',
  'A magnificent villa nestled in the heart of DHA Lahore with a private heated pool, landscaped garden, Italian marble flooring, and a fully integrated smart home system. Ideal for families seeking premium living with top-tier security.',
  95000000,
  'villa',
  5, 4, 5200,
  'Street 14, Phase 6, DHA',
  'Lahore',
  31.4726, 74.4085,
  ARRAY[
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
  ],
  true
),

(
  'Clifton Skyline Penthouse',
  'Breathtaking full-floor penthouse on the 30th floor of a landmark Clifton tower. Enjoy sweeping views of the Arabian Sea from your private rooftop terrace, entertain in the open-plan living area, and unwind in the spa-inspired bathrooms.',
  145000000,
  'penthouse',
  4, 4, 3800,
  'Block 5, Clifton',
  'Karachi',
  24.8138, 67.0300,
  ARRAY[
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800'
  ],
  true
),

(
  'Bahria Town Luxury Apartment',
  'Spacious 3-bedroom apartment on a high floor in Bahria Town Islamabad. Floor-to-ceiling windows frame the lush Margalla Hills, while the premium interiors include a modular kitchen, home theatre setup, and covered parking for two cars.',
  26000000,
  'apartment',
  3, 2, 1900,
  'Bahria Town, Phase 7, Tower A',
  'Islamabad',
  33.5296, 73.1340,
  ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
  ],
  true
),

(
  'Gulberg Prestige Townhouse',
  'A beautifully designed corner townhouse just off MM Alam Road. Three floors of contemporary living with a rooftop terrace, two parking spaces, and walking distance to Lahore''s finest dining and retail.',
  42000000,
  'townhouse',
  4, 3, 3100,
  'Gulberg III, MM Alam Road',
  'Lahore',
  31.5204, 74.3587,
  ARRAY[
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
    'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=800',
    'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800'
  ],
  true
),

-- ── Regular Properties ───────────────────────────────────────────────────

(
  'F-10 Margalla View Apartment',
  'Well-maintained 2-bedroom apartment in a gated F-10 high-rise with backup generator, 24/7 security, and sweeping Margalla Hills views from the balcony. Great connectivity to the Blue Area and Islamabad Expressway.',
  19500000,
  'apartment',
  2, 2, 1250,
  'F-10 Markaz, Block 5',
  'Islamabad',
  33.6844, 73.0479,
  ARRAY[
    'https://images.unsplash.com/photo-1690731987727-ab5daed3620b?w=800',
    'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800'
  ],
  false
),

(
  'Sea View Defence Apartment',
  'Premium 3-bedroom sea-facing apartment in DHA Phase 8 Karachi. Features Italian kitchen, imported fixtures, home automation, and exclusive access to a residents-only beach club. The sunrise views are unmatched.',
  72000000,
  'apartment',
  3, 3, 2200,
  'DHA Phase 8, Sea View Apartments',
  'Karachi',
  24.7861, 67.0595,
  ARRAY[
    'https://images.unsplash.com/photo-1754931356138-1dfd8250e01c?w=800',
    'https://images.unsplash.com/photo-1651108066220-f61c22fc281f?w=800'
  ],
  false
),

(
  'Hayatabad Corner Villa',
  'Double-storey villa on a premium corner plot in Phase 6, Hayatabad. Features a large manicured lawn, double garage, 6 bedrooms, servant quarters, and a covered patio perfect for outdoor entertaining.',
  34000000,
  'villa',
  6, 4, 4200,
  'Phase 6, Sector F, Hayatabad',
  'Peshawar',
  33.9884, 71.4788,
  ARRAY[
    'https://images.unsplash.com/photo-1681465766418-6474cfdcbb3c?w=800',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'
  ],
  false
),

(
  'Cantt Luxury Townhouse',
  'Upscale townhouse in Lahore Cantonment''s most sought-after pocket. Soaring double-height ceilings, bespoke joinery, heated towel rails, a roof deck, and access to a gated compound with round-the-clock guards.',
  48000000,
  'townhouse',
  4, 4, 3400,
  'Sarwar Road, Cantt',
  'Lahore',
  31.5497, 74.3436,
  ARRAY[
    'https://images.unsplash.com/photo-1556630279-0ecfac70eaf2?w=800',
    'https://images.unsplash.com/photo-1679364297777-1db77b6199be?w=800'
  ],
  false
),

(
  'Johar Town Investment Plot',
  'Investor-ready residential plot in a prime Johar Town location. All utility connections available — WAPDA, gas, and water. Corner plot with an extra metre of width. Ideal for immediate construction or land banking.',
  16500000,
  'plot',
  0, 0, 2700,
  'Block J-3, Johar Town',
  'Lahore',
  31.4697, 74.2728,
  ARRAY[
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    'https://images.unsplash.com/photo-1564013799919-0e6c36600517?w=800'
  ],
  false
),

(
  'Saddar Heritage Penthouse',
  'A truly unique full-floor penthouse atop a renovated colonial-era landmark in Rawalpindi Saddar. Wraparound terrace with 360° city views, period architectural details preserved throughout, and a private lift.',
  62000000,
  'penthouse',
  3, 3, 2800,
  'The Mall Road, Saddar',
  'Rawalpindi',
  33.5978, 73.0503,
  ARRAY[
    'https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=800',
    'https://images.unsplash.com/photo-1622015663319-e97e697503ee?w=800'
  ],
  false
),

(
  'Blue Area Commercial Plot',
  'A rare commercial plot on Jinnah Avenue in the heart of Islamabad''s Blue Area. All NOCs cleared and approved for a multi-storey office or mixed-use tower. Ideal for developers and institutional investors.',
  105000000,
  'plot',
  0, 0, 4500,
  'Jinnah Avenue, Blue Area',
  'Islamabad',
  33.7294, 73.0931,
  ARRAY[
    'https://images.unsplash.com/photo-1528323273322-d81458248d40?w=800',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800'
  ],
  false
),

(
  'Bath Island Elite Villa',
  'An extraordinary double-unit villa in the ultra-exclusive Bath Island enclave of Karachi. Private gated entrance, indoor heated pool, dedicated cinema room, eight bedrooms with en-suites, and a full staff quarters. Rarely available at any price.',
  280000000,
  'villa',
  8, 7, 9500,
  'Bath Island, Clifton',
  'Karachi',
  24.8219, 67.0145,
  ARRAY[
    'https://images.unsplash.com/photo-1717167398817-121e3c283dbb?w=800',
    'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800',
    'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=800'
  ],
  false
);
```

---

## 📬 Contact & Support

For questions or support, email: test.codeatusman@gmail.com

---

## ⭐ If you found this helpful, give the repo a star!

---

## 📱 Project Overview

A full-stack **Real Estate Property Listing App** built with React Native, Expo, and TypeScript. Users can browse properties, save favourites, search with filters, and view property locations on a map.

---

## 🗂️ Folder Structure

```
estora/
├── app/
│   ├── _layout.tsx              ← Root wrapper (Clerk auth setup)
│   ├── global.css               ← App-wide styles
│   ├── +not-found.tsx           ← 404 page
│   ├── (auth)/                  ← Auth route group
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx          ← Login screen
│   │   └── sign-up.tsx          ← Register screen
│   └── (root)/                  ← Protected routes (post-login)
│       ├── _layout.tsx
│       ├── (tabs)/              ← Bottom tab navigation
│       │   ├── _layout.tsx      ← Tab navigator setup
│       │   ├── index.tsx        ← Home screen
│       │   ├── explore.tsx      ← Search & filter screen
│       │   ├── add.tsx          ← Add listing screen (admin)
│       │   ├── favorites.tsx    ← Saved/favourites screen
│       │   └── profile.tsx      ← User profile screen
│       └── property/
│           ├── [id].tsx         ← Property detail (dynamic route)
│           └── map.tsx          ← Full map view
├── components/
│   ├── PropertyCard.tsx         ← List card (image, price, location)
│   ├── FeaturedCard.tsx         ← Featured horizontal card
│   └── FilterModal.tsx          ← Filter bottom sheet
├── constants/
│   └── filters.ts               ← Property type, bedroom, and price filter options
├── hooks/
│   ├── useSupabase.ts           ← Authenticated Supabase client
│   ├── useSavedProperty.ts      ← Save / unsave a property
│   └── useUserSync.ts           ← Syncs Clerk user → Supabase
├── lib/
│   ├── supabase.ts              ← Supabase client setup
│   └── utils.ts                 ← Helper functions (formatPrice…)
├── services/
│   ├── properties.ts            ← fetchProperties, searchProperties
│   └── saved.ts                 ← checkIfPropertySaved, saveProperty, unsaveProperty
├── store/
│   ├── filterStore.ts           ← Search filter state (Zustand)
│   └── userStore.ts             ← User/admin state (Zustand)
├── types/
│   └── index.ts                 ← Shared interfaces & types
├── assets/images/
├── app.json                     ← Expo config
├── tailwind.config.js           ← NativeWind config
└── .env                         ← Secret keys (never commit!)
```

> **Key concept — File = Route**
> `sign-in.tsx` → `/sign-in` · `index.tsx` → Home · `[id].tsx` → `/property/123`
> Parentheses like `(auth)` are **route groups** — they organise files without changing the URL.

---

## 🧩 Components

| Component          | Purpose                                                   |
| ------------------ | --------------------------------------------------------- |
| `PropertyCard.tsx` | Displays a property in a list (image, title, price, city) |
| `FeaturedCard.tsx` | Horizontal card used in the Featured carousel on Home     |
| `FilterModal.tsx`  | Bottom sheet for filtering by type, bedrooms, price range |

---

## 🔑 Types (`types/index.ts`)

Shared domain types used across screens, stores, and constants:

```ts
export type PropertyTypeValue =
  | "apartment"
  | "house"
  | "villa"
  | "studio"
  | "townhouse"
  | "penthouse"
  | "plot"
  | "flat"
  | "condo"
  | "duplex"
  | "townhome"
  | "other";

export type PropertyFilterType = PropertyTypeValue | null;

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: PropertyTypeValue;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  images: string[];
  is_featured: boolean;
  is_sold: boolean;
  created_at: string;
}
```

Filter and listing UI options live in `constants/filters.ts` (`PROPERTY_TYPE_OPTIONS`, `BEDROOM_OPTIONS`, `PRICE_PRESETS`). Store-specific and screen-local types stay co-located in their own files.

---

## 🌐 Global State (`store/`)

### `filterStore.ts`

```ts
const { search, type, bedrooms, minPrice, maxPrice, setSearch, resetFilters } =
  useFilterStore();
```

| Field      | Type                 | Purpose                |
| ---------- | -------------------- | ---------------------- |
| `search`   | `string`             | Text the user typed    |
| `type`     | `PropertyFilterType` | Selected property type |
| `bedrooms` | `number \| null`     | Bedroom count filter   |
| `minPrice` | `number \| null`     | Minimum budget         |
| `maxPrice` | `number \| null`     | Maximum budget         |

### `userStore.ts`

```ts
const { isAdmin, setIsAdmin } = useUserStore();
```

Stores whether the logged-in user has admin privileges (controls "Add Listing" tab visibility and property management actions).

> **Why Zustand instead of props?** Without a global store, you'd pass data through 10+ components just to reach the one that needs it. Zustand makes shared state a single import away.

---

## 🪝 Hooks (`hooks/`)

| Hook                   | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `useSupabase()`        | Returns a Supabase client with the Clerk JWT attached    |
| `useSavedProperty(id)` | Handles toggling save/unsave + loading state             |
| `useUserSync()`        | Syncs Clerk user profile into the `users` Supabase table |

### `useSupabase.ts`

```ts
export function useSupabase() {
  const { getToken } = useAuth();

  const client = useMemo(
    () => createClerkSupabaseClient(() => getToken()),
    [getToken],
  );

  return client;
}
```

Every write/delete operation uses this hook so Supabase RLS can verify the user's identity via their Clerk token.

---

## 📦 Services (`services/`)

Reusable Supabase query helpers — keeps database logic out of screen components.

> **`constants/filters.ts` vs `services/`:** `filters.ts` only holds static filter _options_ (type labels, bedroom choices, price presets) for `FilterModal`. `filterStore` holds what the user _selected_. `services/` runs the actual Supabase queries using those selections.

| File            | Functions                                                      | Purpose                                          |
| --------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| `properties.ts` | `fetchProperties()`, `searchProperties(term, type)`            | Load and filter property listings                |
| `saved.ts`      | `checkIfPropertySaved()`, `saveProperty()`, `unsaveProperty()` | Saved-property CRUD with an auth Supabase client |

```ts
// explore.tsx — filterStore selections passed into the service
import { searchProperties } from "@/services/properties";

const results = await searchProperties({
  search,
  type,
  bedrooms,
  minPrice,
  maxPrice,
});
```

`explore.tsx` and `useSavedProperty` use these services. `FilterModal` still reads options from `constants/filters.ts`.

---

## ⚙️ Root Config Files

| File                 | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `package.json`       | All npm dependencies                              |
| `app.json`           | Expo build config (icon, splash, plugins, scheme) |
| `tsconfig.json`      | TypeScript rules                                  |
| `tailwind.config.js` | NativeWind/Tailwind token config                  |
| `babel.config.js`    | JS transpilation                                  |
| `metro.config.js`    | React Native bundler config                       |

---

## 🔄 App Workflow

### Startup

```
User opens app
  → app/_layout.tsx (sets up Clerk, loads global.css)
  → Checks auth state
      ├─ Not logged in → (auth) routes → sign-in / sign-up
      └─ Logged in     → (root) routes → tabs
```

### Authentication

```
sign-in.tsx → Clerk handles login
  → Stores token securely (expo-secure-store)
  → Redirects to (root)/(tabs)
  → useUserSync() runs → upserts user row in Supabase
```

### Home → Property Detail

```
index.tsx loads
  → Calls supabase directly for featured + recommended listings
  → Renders FeaturedCard (horizontal list) + PropertyCard (vertical list)
  → User taps a card
  → router.push(`/(root)/property/${id}`)
  → [id].tsx fetches full property details from Supabase
  → Renders image carousel, specs, description, map preview
```

### Explore & Filter

```
explore.tsx
  → TextInput updates filterStore.setSearch()
  → useEffect watches [search, type, bedrooms, minPrice, maxPrice]
  → Builds and runs a Supabase query inline (or via services/searchProperties)
  → FilterModal taps → setType / setBedrooms / setMinPrice / setMaxPrice
  → Active filters shown as removable chips below the search bar
```

### Save a Property

```
User taps heart on PropertyCard
  → useSavedProperty.toggleSave()
  → Authenticated Supabase insert into saved_properties (via useSupabase)
  → UI updates instantly
  → favorites.tsx tab loads saved rows joined with property data
```

### Admin — Add Listing

```
add.tsx (only visible if isAdmin = true in userStore)
  → Form: title, description, price, type, beds, baths, area, address, coords
  → Images uploaded to Supabase Storage → URLs stored in images[]
  → Location detected via expo-location or entered manually
  → Submit → authSupabase.from("properties").insert(...)
  → RLS verifies is_admin = true before allowing insert
```

---

## 💾 Data Flow

```
Supabase DB (properties, saved_properties, users)
    │
    ├─→ lib/supabase.ts              Public anon client (read-only listing queries)
    ├─→ hooks/useSupabase.ts          Authenticated client (Clerk JWT for writes)
    │
    ├─→ services/properties.ts        fetchProperties, searchProperties
    ├─→ services/saved.ts             checkIfPropertySaved, saveProperty, unsaveProperty
    │
    ├─→ index.tsx                     Featured + recommended listings
    ├─→ explore.tsx                   Filtered search results
    ├─→ property/[id].tsx             Single property detail
    ├─→ favorites.tsx                 User's saved properties
    ├─→ add.tsx                       Admin property insert + image upload
    │
    ├─→ hooks/useSavedProperty        Save/unsave toggle per property
    ├─→ hooks/useUserSync             Clerk user → Supabase users table
    │
    └─→ Zustand stores
         ├─ filterStore               Active search filters
         └─ userStore                 isAdmin flag
```

Screens talk to Supabase directly in `index.tsx` and `add.tsx`; search and save flows go through `services/`.

---

## 📌 Key Concepts for Beginners

| Concept                  | What it means                                                 |
| ------------------------ | ------------------------------------------------------------- |
| File-based routing       | Each file = a screen. No manual route config needed.          |
| Dynamic routes           | `[id].tsx` becomes `/property/123`, `/property/456`, etc.     |
| Route groups             | `(auth)` organises files without affecting the URL path       |
| Components               | Reusable UI blocks (like functions that return UI)            |
| Hooks                    | Functions that add state or behaviour to components           |
| Zustand store            | Global data shared across any component without prop drilling |
| TypeScript               | JavaScript with type hints — catches bugs before runtime      |
| async/await              | Pauses execution until a database query finishes              |
| RLS (Row Level Security) | Supabase checks who you are before allowing DB operations     |
| JWT                      | Clerk login token — passed to Supabase to prove your identity |

---

## ✅ Feature Checklist

- [x] Email/password authentication (Clerk)
- [x] OTP email verification on signup
- [x] Property listing with image carousel
- [x] Featured properties horizontal scroll
- [x] Full-text search by title and city
- [x] Filter by type, bedrooms, and price range
- [x] Save / unsave properties (with auth)
- [x] Property detail screen with specs and description
- [x] Embedded map preview (OpenStreetMap)
- [x] Full-screen map view
- [x] WhatsApp contact button
- [x] Admin: add listing with image upload
- [x] Admin: mark property as sold
- [x] Admin: delete listing
- [x] Adaptive icon + splash screen (iOS & Android)
- [x] NativeWind dark/cream theme consistent across all screens
