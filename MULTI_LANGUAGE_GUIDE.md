# 🌍 Guia Multi-Idioma

## Idiomas Disponíveis

- 🇵🇹 **Português** (padrão)
- 🇬🇧 **English**
- 🇫🇷 **Français**  
- 🇪🇸 **Español**

## Como Usar

### Para Utilizadores

1. Clique no botão com ícone de globo no sidebar (desktop) ou topo (mobile)
2. Selecione o idioma desejado
3. A interface muda instantaneamente
4. A preferência é guardada automaticamente

### Para Desenvolvedores

#### Estrutura

```
frontend/src/
├── i18n.js                    # Configuração i18next
├── locales/
│   ├── pt.json                # Português
│   ├── en.json                # Inglês
│   ├── fr.json                # Francês
│   └── es.json                # Espanhol
└── components/
    └── LanguageSelector.js    # Seletor de idioma
```

#### Adicionar Traduções

**1. Nos arquivos JSON:**

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "settings": "Settings"
  },
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

**2. Nos componentes React:**

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.dashboard')}</h1>
      <button>{t('buttons.save')}</button>
    </div>
  );
}
```

#### Adicionar Novo Idioma

1. Criar arquivo `/locales/[codigo].json` (ex: `de.json` para alemão)
2. Copiar estrutura de `pt.json` e traduzir
3. Adicionar em `i18n.js`:

```javascript
import de from './locales/de.json';

resources: {
  // ... existing
  de: { translation: de }
}
```

4. Adicionar em `LanguageSelector.js`:

```javascript
const languages = [
  // ... existing
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
];
```

## Páginas Já Traduzidas

✅ AdminLayout (navegação, sidebar)
✅ Títulos e labels principais

## Páginas Para Traduzir

As páginas mantêm o conteúdo em português por enquanto, mas a estrutura está pronta.
Para traduzir uma página:

1. Adicionar traduções aos 4 arquivos JSON
2. Importar `useTranslation` no componente
3. Substituir textos hardcoded por `t('chave.traducao')`

### Exemplo:

**Antes:**
```jsx
<h1>Gestão de Reservas</h1>
```

**Depois:**
```jsx
const { t } = useTranslation();
<h1>{t('reservations.title')}</h1>
```

## Deteção Automática

O sistema deteta automaticamente o idioma do browser do utilizador na primeira visita.

## Persistência

A escolha do idioma é guardada no `localStorage` e mantém-se entre sessões.

## Bibliotecas Utilizadas

- **react-i18next** v16.5.4
- **i18next** v25.8.13
- **i18next-browser-languagedetector** v8.2.1

## Notas

- Placeholder inicial: Sistema tem traduções para navegação e estrutura principal
- Conteúdo das páginas: Pode ser expandido gradualmente
- Fallback: Se tradução não existe, mostra a chave (ex: `nav.dashboard`)
