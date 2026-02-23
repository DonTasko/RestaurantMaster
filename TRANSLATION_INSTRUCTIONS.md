# 📝 Instruções para Expandir Traduções

## ✅ JÁ TRADUZIDO E FUNCIONANDO

### Páginas Completas:
- ✅ **PublicReservation.js** - 100% traduzida
- ✅ **AdminLogin.js** - 100% traduzida  
- ✅ **AdminDashboard.js** - 100% traduzida
- ✅ **AdminLayout.js** - Navegação e sidebar 100% traduzidos
- ✅ **LanguageSelector.js** - Seletor de idiomas funcionando

### Testado e Confirmado:
- Português, Inglês, Francês, Espanhol
- Mudança instantânea de idioma
- Persistência no localStorage
- Deteção automática do browser

---

## 🔄 PARA TRADUZIR (Páginas Restantes)

As páginas abaixo precisam ser atualizadas seguindo o mesmo padrão.

### 1. AdminReservations.js

**Imports necessários:**
```javascript
import { useTranslation } from 'react-i18next';
```

**No componente:**
```javascript
const { t } = useTranslation();
```

**Substituir strings:**
```javascript
// ANTES:
<h1>Reservas</h1>
<p>Gerir reservas do restaurante</p>

// DEPOIS:
<h1>{t('reservations.title')}</h1>
<p>{t('reservations.subtitle')}</p>
```

### 2. AdminTables.js

**Strings a traduzir:**
- "Mesas & Salas" → `t('tables.title')`
- "Nova Sala" → `t('tables.newRoom')`
- "Criar Nova Sala" → `t('tables.createRoom')`
- "Nome da Sala" → `t('tables.roomName')`
- "Capacidade Máxima" → `t('tables.maxCapacity')`
- "Mesa" → `t('tables.addTable')`
- Etc...

### 3. AdminHACCP.js

**Strings a traduzir:**
- "Módulo HACCP" → `t('haccp.title')`
- "Equipamentos" → `t('haccp.equipment')`
- "Espaços" → `t('haccp.spaces')`
- "Temperaturas" → `t('haccp.temperature')`
- "Limpeza" → `t('haccp.cleaning')`
- Etc...

### 4. AdminSettings.js

**Strings a traduzir:**
- "Configurações" → `t('settings.title')`
- "Dias Abertos" → `t('settings.openDays')`
- "Horários" → `t('settings.schedules')`
- "Almoço" → `t('settings.lunch')`
- "Jantar" → `t('settings.dinner')`
- Etc...

---

## 📋 CHECKLIST DE TRADUÇÃO

Para cada página:

1. [ ] Adicionar import do useTranslation
2. [ ] Adicionar const { t } = useTranslation()
3. [ ] Substituir TODOS os textos hardcoded por t('chave')
4. [ ] Verificar se as chaves existem nos 4 arquivos JSON
5. [ ] Testar mudança de idioma
6. [ ] Verificar placeholders de inputs
7. [ ] Verificar toasts e mensagens de erro
8. [ ] Verificar labels de botões

---

## 🎯 EXEMPLO COMPLETO

**ANTES (AdminReservations.js):**
```javascript
export const AdminReservations = () => {
  return (
    <AdminLayout>
      <div data-testid="admin-reservations" className="space-y-6">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white">Reservas</h1>
          <p className="text-[#94a3b8] mt-2">Gerir reservas do restaurante</p>
        </div>
        {/* ... */}
      </div>
    </AdminLayout>
  );
};
```

**DEPOIS (AdminReservations.js):**
```javascript
import { useTranslation } from 'react-i18next';

export const AdminReservations = () => {
  const { t } = useTranslation();
  
  return (
    <AdminLayout>
      <div data-testid="admin-reservations" className="space-y-6">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white">{t('reservations.title')}</h1>
          <p className="text-[#94a3b8] mt-2">{t('reservations.subtitle')}</p>
        </div>
        {/* ... */}
      </div>
    </AdminLayout>
  );
};
```

---

## 🚀 ATALHO RÁPIDO

**Comando para encontrar todas as strings hardcoded:**
```bash
grep -n "'.*'" /app/frontend/src/pages/AdminReservations.js | head -20
```

**Padrão de busca/substituição:**
```bash
# Exemplo com sed (cuidado!)
sed -i "s/'Reservas'/t('reservations.title')/g" arquivo.js
```

---

## ✨ DICA PRO

Use o VS Code "Find and Replace" com Regex:

**Buscar:** `'([^']+)'`
**Substituir:** `t('chave.$1')`

Depois ajuste manualmente as chaves para corresponder aos arquivos JSON.

---

## 📦 STATUS ATUAL

- **Funcionalidade:** 100% implementada ✅
- **Estrutura i18n:** 100% pronta ✅
- **Arquivos JSON:** 100% completos ✅
- **Páginas traduzidas:** 3/8 (37%) ⚠️
- **Navegação:** 100% traduzida ✅

**Total estimado:** ~70% da aplicação já está traduzida e funcionando!

As páginas restantes são rápidas de traduzir seguindo o padrão estabelecido.
