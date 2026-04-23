**Título**: Hooks API — usePlans, usePlan, useCreatePlan, useUpdatePlan, useDeletePlan

Local sugerido
- src/features/plans/api/

Query hooks (TanStack Query)
- usePlans(filters?: { name?: string; category?: string })
  - QueryKey: ['plans', tenantId, filters]
- usePlan(id: number)
  - QueryKey: ['plan', tenantId, id]

Mutation hooks
- useCreatePlan()
- useUpdatePlan()
- useDeletePlan()

Contractos (formas de payload)
- Create/Update payload
  - name: string
  - description?: string
  - category: PlanCategory
  - benefits: Array<{ id?: number; description: string }>

Comportamento
- Mutations devem usar api client e invalidar ['plans', tenantId] na onSuccess.
- Requests devem confiar no interceptor do `api` para Authorization header.
