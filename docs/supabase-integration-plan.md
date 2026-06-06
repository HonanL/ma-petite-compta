# Ma Petite Compta Supabase Integration Plan

This plan prepares cloud persistence without replacing the current localStorage MVP.

## Current localStorage model

The app currently stores three main client-side values:

- `ma-petite-compta-transactions`
  - Array of transactions.
  - Essential fields: `id`, `date`, `kind`, `label`, `amount`, `category`, `paymentMethod`, `partyName`, `note`, `isSample`, `generated`.
  - Amounts are numbers and displayed as FCFA.
  - `generated` contains the accounting explanation, affected accounts, journal lines, statements, and debit/credit check.
- `ma-petite-compta-business-profile`
  - One of: `Assemblage de meubles`, `Nettoyage`, `Livraison`, `Services informatiques`, `Vente en ligne`, `Autre`.
- `ma-petite-compta-language`
  - `fr` or `en`.

JSON backup/import currently exports and restores these same app-level values. That flow should remain available even after cloud sync is added.

## Proposed Supabase schema

Migration file:

- `supabase/migrations/001_initial_cloud_persistence.sql`

Tables:

- `profiles`
  - One row per authenticated user.
  - Stores display name and language preference.
  - `id` references `auth.users(id)`.
- `businesses`
  - One business owned by a user today.
  - Supports future multi-business by allowing many rows per owner.
  - Stores business name, business profile, and currency.
- `business_members`
  - Join table for future multi-user or multi-business access.
  - Today each business can have the owner as a member.
  - Keeps the model ready for shared access later.
- `transactions`
  - Cloud version of the current local transaction model.
  - Stores `local_transaction_id` so localStorage transactions can be uploaded without losing their original local IDs.
  - Stores `generated_accounting` as `jsonb` for now to preserve current behavior.
  - Uses FCFA as the enforced currency.
- `app_settings`
  - Stores user-level settings such as preferred language, default business, and last sync timestamp.

Security:

- Row Level Security is enabled on all tables.
- Users manage only their own profile and app settings.
- Business owners manage their own businesses.
- Business members can read business data.
- Users can insert/update/delete their own transactions within businesses where they are members.

## Migration strategy from localStorage to cloud

The safe migration should happen in stages.

### Stage 1: Preparation only

Done in this step:

- Add Supabase environment variable examples.
- Add SQL migration.
- Document the data model and sync plan.
- Do not change app behavior.
- Keep localStorage as the source of truth.

### Stage 2: Add Supabase clients and auth shell

Install:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Add small helpers:

- `lib/supabase/client.ts` for browser client.
- `lib/supabase/server.ts` for server/client cookie support with App Router.
- Keep all existing localStorage hooks working.
- Add login UI later, but do not require login to use the app.

### Stage 3: Create user bootstrap after login

When a user logs in:

1. Create or update `profiles`.
2. Create `app_settings`.
3. Create a default `businesses` row if the user has none.
4. Add the user as `owner` in `business_members`.
5. Keep localStorage untouched.

### Stage 4: Offer one-time local import

If localStorage has transactions and the user logs in:

1. Show a clear prompt:
   - FR: `Importer vos données locales vers le cloud ?`
   - EN: `Import your local data to the cloud?`
2. If accepted:
   - Upload local transactions to `transactions`.
   - Preserve local IDs in `local_transaction_id`.
   - Use `upsert` on `(business_id, local_transaction_id)` to avoid duplicates.
   - Upload business profile to `businesses.business_profile`.
   - Upload language to `app_settings.preferred_language`.
3. Keep the JSON backup/export feature unchanged.
4. Keep localStorage as fallback until sync is confirmed.

### Stage 5: Dual mode persistence

Support two modes:

- Anonymous user:
  - localStorage only.
  - Current MVP behavior continues.
- Logged-in user:
  - Supabase becomes the cloud source.
  - localStorage can be used as a local cache for offline-friendly UX.
  - Sync writes should update both Supabase and localStorage after success.

### Stage 6: Conflict handling

Start simple:

- Treat cloud data as authoritative after login.
- Preserve `updated_at` for future conflict handling.
- If local and cloud both contain data, ask the user before importing local data.
- Avoid silent overwrites.

## Mapping local transactions to Supabase

| localStorage field | Supabase field |
| --- | --- |
| `id` | `local_transaction_id` |
| `date` | `transaction_date` |
| `kind` | `kind` |
| `label` | `description` |
| `amount` | `amount` |
| `category` | `category` |
| `paymentMethod` | `payment_method` |
| `partyName` | `party_name` |
| `note` | `note` |
| `isSample` | `is_sample` |
| `generated` | `generated_accounting` |

## What should remain local-first

- JSON backup/import should remain available.
- Anonymous usage should remain fully functional.
- Users should not be forced to create an account.
- Existing localStorage users should not lose data.

## Future refactor points

- Extract a persistence adapter:
  - `LocalTransactionStore`
  - `SupabaseTransactionStore`
  - shared API: `list`, `create`, `update`, `delete`, `replace`.
- Move localStorage keys into a small central config.
- Keep accounting calculations in `lib/accounting.ts`.
- Consider recalculating `generated_accounting` on the client from stable transaction fields instead of trusting stored JSON forever.
- Add integration tests around local import and duplicate prevention before enabling cloud writes.
