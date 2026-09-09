# CashTrack Frontend

Personal finance dashboard — track wallets, transactions, categories, budgets, attachments, and savings goals.

## Stack

- **Next.js 16** (App Router) + TypeScript + React 19
- **Tailwind CSS 4** + shadcn/ui
- **TanStack React Query** (server data) + Zustand (auth, persisted)
- **Axios** (JWT refresh-token interceptor)
- **react-hook-form** + **zod** (forms)
- **framer-motion** (animations)
- **date-fns** (date utilities)

## Development

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

## Project Structure

```
src/
  app/(auth)/          login, register, forgot-password
  app/(dashboard)/     dashboard, budgets, wallets, transactions,
                       savings-goals, categories, attachments, recurring
  services/            API service factories (api.ts, wallet.ts, etc.)
  hooks/               React Query hooks per domain
  features/            Form components (transaction-form, wallet-form, etc.)
  components/          Charts, common UI, layout, ui/
  types/               Shared TypeScript interfaces
  store/               Auth Zustand store (persisted)
  utils/               format, date, errors
```

## Changelog

### 2025-09-09 — Kontribusi + Target Tabungan Digabung

**Ringkasan:** Kontribusi tabungan tidak lagi terpisah — semuanya dikelola di dalam halaman Target Tabungan.

- **Tipe (`types/index.ts`):**
  - `SavingsGoal` sekarang menyertakan field `contributions: SavingsContribution[]`
  - `SavingsContribution` dipindahkan ke atas; field `savingsGoal` tetap (untuk grouping di API response)

- **Service (`services/saving.ts`):**
  - Konsolidasikan semua endpoint kontribusi ke `savingService`
  - `listContributions()` — fetch flat list dari `/savings-contributions`
  - `createContribution(goalPublicId, input)` — POST ke `/savings-contributions` dengan `savingsGoalPublicId` di body
  - `deleteContribution(publicId)` — DELETE ke `/savings-contributions/{id}`
  - **Hapus:** `services/savings-contribution.ts`

- **Hooks (`hooks/useSavingsGoals.ts`):**
  - `useSavingsGoals` fetch goals + kontribusi paralel (`Promise.all`), lalu merge contributions ke tiap goal berdasarkan `savingsGoal.publicId`
  - Tambah `useCreateSavingsContribution` & `useDeleteSavingsContribution`
  - Optimistic update di `useCreateSavingsGoal` sudah diselaraskan ke format `SavingsGoal[]`
  - **Hapus:** `hooks/useSavingsContributions.ts`

- **Form (`features/savings-goals/savings-contribution-form.tsx`):**
  - `goalPublicId` prop opsional — ketika ada, pakai hidden input (untuk per-card button); ketika kosong, tampilkan dropdown pemilihan tujuan
  - **Hapus:** `features/savings-contributions/` directory

- **Halaman (`app/(dashboard)/savings-goals/page.tsx`):**
  - Setiap goal card punya chevron expand/collapse untuk melihat kontribusi
  - Panel kontribusi terhubung langsung di bawah card (border-t, animasi spring)
  - Panel berisi: card "Aktifitas Kontribusi" (heatmap GitHub-style), header riwayat + tombol "Tambah Kontribusi", dan tabel riwayat dengan animasi stagger
  - Header halaman punya dua button: "Tambah Target" (primary) dan "Tambah Kontribusi" (outline, dengan dropdown tujuan)
  - Spring animation (`stiffness: 300, damping: 24`) untuk transisi modern
  - `maxHeight`-based expand yang reliable (mengganti `height: "auto"`)
  - **Hapus:** `app/(dashboard)/savings-contributions/` directory

- **Sidebar (`components/layout/sidebar.tsx`):**
  - Nav "Kontribusi Tabungan" dihapus
  - "Target Tabungan" ganti jadi "Target & Kontribusi Tabungan"

- **Dashboard (`app/(dashboard)/dashboard/page.tsx`):**
  - Hapus budget card (per-budget tracking sekarang hanya tersedia di halaman `/budgets`)
  - Hapus semua import dan state terkait budget card

- **Halaman Budgets (`app/(dashboard)/budgets/page.tsx`):**
  - Tetap pakai `useBudgetSpent` untuk per-budget tracking yang akurat

### 2025-09-09 — Budget Card Di Dashboard Diperbaiki

- **Dashboard (`app/(dashboard)/dashboard/page.tsx`):**
  - Ganti `spent={dashboard.spentThisMonth}` (global) dengan `spentFor(budget)` (per-budget filter by category, wallet, period)
  - Tambahkan button edit (Pencil) dan hapus (Trash2) di setiap budget card
  - Tambahkan dialog edit budget yang memakai `<BudgetForm budget={editingBudget}>`
  - Badge "Melebihi" merah muncul otomatis ketika over budget
  - Text "Sisa" di bawah progress bar

- **Dashboard (`app/(dashboard)/dashboard/page.tsx`):**
  - Hapus budget card dari dashboard (karena tracking tidak efisien di sini)
  - Budget tracking tetap berjalan di halaman `/budgets`

### Files Unstruck

Berikut file yang tidak terkait task utama tetapi disertakan dalam commit:
- `src/components/charts/contribution-heatmap.tsx` — GitHub-style heatmap komponen
- `src/app/(dashboard)/attachments/` — manajemen lampiran
- `src/features/attachments/` — form lampiran
- `src/hooks/useAttachments.ts` — hook lampiran
- `src/services/attachment.ts` — service lampiran
