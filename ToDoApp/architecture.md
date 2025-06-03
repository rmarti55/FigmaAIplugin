# 🧱 To-Do App Architecture

## 🛠️ Stack Overview

| Layer         | Tech                        |
|---------------|-----------------------------|
| Framework     | Next.js (App Router)        |
| UI            | Tailwind CSS + Shadcn/UI    |
| State         | Zustand                     |
| Text Editor   | TipTap (rich text)          |
| Auth + DB     | Supabase                    |
| Drag & Drop   | DnD Kit                     |
| Hosting       | Vercel                      |

---

## 📁 File + Folder Structure

```text
/app
├── layout.tsx
├── page.tsx
└── list/
    └── [id]/
        └── page.tsx

/components
├── ui/
/components/card
    └── TodoCard.tsx
/components/list
    ├── TodoList.tsx
    ├── TodoItem.tsx
    └── DoneList.tsx
/components/layout
    └── ResponsiveGrid.tsx

/lib
├── supabase.ts
├── api.ts
├── auth.ts
├── state.ts
├── utils.ts
└── local-storage.ts

/hooks
└── useListEditor.ts

/public

/styles
```
---

## 🧠 State Management: Zustand

```ts
// /lib/state.ts

import { create } from 'zustand'

export interface TodoItem {
  id: string
  text: string
  done: boolean
  createdAt: string
  order_index: number
}

export interface TodoList {
  id: string
  title: string
  createdAt: string
  items: TodoItem[]
}

type Store = {
  lists: TodoList[]
  setLists: (lists: TodoList[]) => void
  addList: (title: string) => void
  updateList: (id: string, updated: Partial<TodoList>) => void
  deleteList: (id: string) => void
  reorderLists: (updatedOrder: TodoList[]) => void
}

export const useTodoStore = create<Store>((set) => ({
  lists: [],
  setLists: (lists) => set({ lists }),
  addList: (title) => { /* ... */ },
  updateList: (id, updated) => { /* ... */ },
  deleteList: (id) => { /* ... */ },
  reorderLists: (updatedOrder) => { /* ... */ },
}))
```

## ☁️ Supabase Schema (supabase_schema.sql)

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- To-Do Lists table
create table if not exists public.todo_lists (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  title       text        not null,
  created_at  timestamptz not null default now()
);

-- To-Do Items table
create table if not exists public.todo_items (
  id           uuid        primary key default uuid_generate_v4(),
  list_id      uuid        not null references public.todo_lists(id) on delete cascade,
  text         text        not null,
  done         boolean     not null default false,
  order_index  integer     not null default 0,
  created_at   timestamptz not null default now()
);

-- Enable Row-Level Security
alter table public.todo_lists enable row level security;
alter table public.todo_items enable row level security;

-- Policies: only owner may manage their data
create policy "Lists: owner only" on public.todo_lists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Items: owner only" on public.todo_items
  for all
  using (
    auth.uid() = (select user_id from public.todo_lists where id = list_id)
  )
  with check (
    auth.uid() = (select user_id from public.todo_lists where id = list_id)
  );
```

## 🔌 Supabase Client

```ts
// /lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## 🔐 Auth-Protected Layout System

### `/app/layout.tsx`

```tsx
// Server Component
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import './globals.css'
import { ReactNode } from 'react'

export const metadata = { title: 'My To-Do App' }

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/signin')
  }

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
```

### `/app/signin/page.tsx`

```tsx
// Client Component
'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) router.replace('/')
    })
  }, [router])

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email })
    if (error) alert(error.message)
    else alert('Check your email for the magic link.')
  }

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="w-full max-w-xs space-y-4">
        <h1 className="text-xl font-semibold">Sign In</h1>
        <input
          type="email"
          placeholder="you@example.com"
          className="w-full rounded border px-3 py-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button
          onClick={handleSignIn}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Send Magic Link
        </button>
      </div>
    </main>
  )
}
```

## 🔁 Sync Strategy

1. **On Login**  
   - Fetch `todo_lists` & `todo_items` → populate Zustand.
2. **On Mutations**  
   - Optimistically update Zustand → persist via Supabase API.
3. **Error Handling**  
   - Roll back local changes if Supabase call fails.

---

## 📦 Component Responsibilities

- **`/components/card/TodoCard.tsx`**  
  Title, `createdAt`, drag handle, click to open.

- **`/components/list/TodoList.tsx`**  
  Renders items with TipTap, DnD Kit for reorder, checkboxes.

- **`/components/list/DoneList.tsx`**  
  Collapsible completed items section.

- **`/components/layout/ResponsiveGrid.tsx`**  
  Grid on desktop, scroll list on mobile.

---

## ✨ Features Summary

- Minimal, distraction-free UI  
- Rich-text to-do items  
- Drag-and-drop ordering  
- Persistent storage & auth via Supabase  
- Card-based grid & mobile list

## 🚀 Deployment (Vercel)

1. Push to GitHub  
2. Connect to Vercel  
3. Set env vars:  
   - `NEXT_PUBLIC_SUPABASE_URL`  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
4. Enable Supabase Auth & RLS  
5. Deploy