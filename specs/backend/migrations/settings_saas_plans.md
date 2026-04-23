**Título**: Migration — settings_saas_plan e settings_saas_plan_benefits

Objetivo
- Criar entidades para persistir planos e benefícios com suporte a multi-tenancy.

DDL (Postgres)
```sql
CREATE TYPE plan_category AS ENUM ('PROFESSIONAL_AUTONOMOUS','BUSINESS');

CREATE TABLE settings_saas_plan (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category plan_category NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_settings_saas_plan_tenant ON settings_saas_plan (tenant_id);

CREATE TABLE settings_saas_plan_benefits (
  id BIGSERIAL PRIMARY KEY,
  plan_id BIGINT NOT NULL REFERENCES settings_saas_plan(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Recomendações
- Adicionar unique constraint (tenant_id, name) se for requerido evitar duplicidade por tenant.
- Garantir cascata ao deletar o plano.
