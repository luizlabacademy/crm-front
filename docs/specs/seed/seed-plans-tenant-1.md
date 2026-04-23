**Título**: Seed — Popular tenant_id = 1 com planos iniciais

Objetivo
- Popular a base com os dados atualmente mockados na página /plans, garantindo que tenant_id = 1 contenha exemplos para staging/demo.

SQL exemplo
```sql
INSERT INTO settings_saas_plan (tenant_id, name, description, category)
VALUES
(1, 'Starter', 'Plano inicial para pequenos negócios', 'PROFESSIONAL_AUTONOMOUS'),
(1, 'Business', 'Recursos para empresas', 'BUSINESS')
ON CONFLICT DO NOTHING;

-- Assumindo que os IDs resultantes são conhecidos ou recuperados por subquery
INSERT INTO settings_saas_plan_benefits (plan_id, description)
SELECT p.id, b.desc FROM (
  VALUES
    ('Starter','Relatórios básicos'),
    ('Starter','Suporte por e-mail'),
    ('Business','Relatórios avançados'),
    ('Business','Suporte prioritário'),
    ('Business','Integrações API')
) AS b(name, desc)
JOIN settings_saas_plan p ON p.name = b.name AND p.tenant_id = 1;
```

Observações
- Preferir script em `scripts/seed.mjs` se o projeto já automatiza seeds (seguir padrão do repo).
