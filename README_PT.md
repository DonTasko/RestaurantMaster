# 🍽️ Sistema de Gestão de Reservas & HACCP para Restaurantes

## ✨ Funcionalidades Principais

### Área Pública (Reservas)
- ✅ Formulário de reserva completo e intuitivo
- ✅ Validação automática de dias e horários disponíveis
- ✅ Bloqueio automático quando capacidade atingida
- ✅ Atribuição inteligente de mesas
- ✅ Confirmação visual da reserva
- ✅ Envio opcional de confirmação por email

### Área Administrativa
- ✅ **Dashboard** - Visão geral com estatísticas em tempo real
- ✅ **Gestão de Reservas** - Listar, filtrar, editar e cancelar
- ✅ **Gestão de Mesas** - Configurar salas e mesas com capacidades
- ✅ **Módulo HACCP Completo**:
  - Registo de temperaturas
  - Checklists de limpeza
  - Receção de mercadorias
  - Controlo de validades
  - Assinatura digital
  - Alertas automáticos
- ✅ **Configurações** - Horários, dias abertos, capacidade

## 🚀 Como Usar

### 1. Primeira Utilização (Criar Conta Admin)
1. Aceda a: `https://table-manager-pro.preview.emergentagent.com/admin/login`
2. Clique em "Primeira vez? Crie uma conta"
3. Preencha: Nome, Email e Password
4. Será redirecionado para o Dashboard

### 2. Configurar o Restaurante
**Passo 1 - Criar Salas:**
1. Vá a "Mesas & Salas"
2. Clique em "Nova Sala"
3. Defina nome e capacidade (ex: "Salão Principal", 50 pessoas)

**Passo 2 - Adicionar Mesas:**
1. Dentro de cada sala, clique "Mesa"
2. Defina número, lotação e se pode juntar com outras

**Passo 3 - Configurar Horários:**
1. Vá a "Configurações"
2. Selecione dias abertos (checkboxes)
3. Defina horários de almoço e jantar
4. Configure capacidade máxima por refeição
5. Clique "Guardar Configurações"

### 3. Gerir Reservas
- As reservas públicas aparecem automaticamente
- Filtre por estado (Confirmada, Pendente, Cancelada)
- Pesquise por nome ou telefone
- Cancele reservas se necessário

### 4. Registos HACCP

**Passo 1 - Configurar Equipamentos e Espaços:**
1. Vá a "HACCP"
2. Clique em "Equipamentos" (canto superior direito)
3. Adicione equipamentos como: "Frigorífico 1", "Congelador 2", "Forno Principal"
4. Clique em "Espaços" 
5. Adicione espaços como: "Cozinha Principal", "Armazém", "WC Masculino", "WC Feminino"

**Passo 2 - Criar Registos:**
1. Escolha o tipo de registo (Temperatura, Limpeza, etc.)
2. **Selecione do dropdown** o equipamento ou espaço (muito mais rápido!)
3. Preencha os campos obrigatórios
4. Assine digitalmente no canvas
5. Clique "Guardar Registo"

**Alertas Automáticos:**
- O sistema verifica automaticamente se faltam registos
- Envia email ao administrador (se configurado)
- Mostra alertas visuais no dashboard

## 📧 Configurar Email (Opcional)

Para ativar confirmações de reserva e alertas por email:

1. Crie conta gratuita em: https://resend.com
2. Obtenha a API Key no Dashboard
3. Edite o ficheiro `/app/backend/.env`:
```
RESEND_API_KEY=re_sua_chave_aqui
SENDER_EMAIL=seu-email@dominio.com
```
4. Reinicie o backend: `sudo supervisorctl restart backend`

> **Nota:** A aplicação funciona normalmente sem configuração de email. As reservas são confirmadas visualmente e os alertas aparecem no sistema.

## 📱 Mobile-First

- Interface otimizada para telemóveis e tablets
- Navegação bottom bar em mobile
- Todas as funcionalidades acessíveis em qualquer dispositivo
- Design dark mode profissional

## 🔐 Segurança

- Autenticação JWT segura
- Passwords encriptadas com bcrypt
- Área administrativa protegida
- Sessões com expiração de 7 dias

## 🎯 Próximos Passos Sugeridos

1. **Relatórios & Analytics** - Gráficos de ocupação ao longo do tempo
2. **WhatsApp Integration** - Confirmações via WhatsApp (Twilio)
3. **Exportação** - PDF e Excel de reservas e registos HACCP
4. **Notificações Push** - Para colaboradores sobre registos pendentes
5. **Multi-restaurante** - Gestão de múltiplos restaurantes numa conta

## 💰 Potencial de Negócio

**Modelo SaaS:**
- 9€/mês - Apenas HACCP
- 19€/mês - Reservas + HACCP
- 29€/mês - Completo + Relatórios

**Diferenciação:**
- Único sistema que junta reservas + HACCP
- Extremamente simples de usar
- Mobile-first (equipa usa no telemóvel)
- Instalação em 5 minutos

## 🛠️ Tecnologias

- **Backend:** FastAPI + MongoDB + Python
- **Frontend:** React + Tailwind CSS + Shadcn UI
- **Auth:** JWT + bcrypt
- **Email:** Resend
- **Deploy:** Kubernetes (Emergent Platform)

---

**URL Pública:** https://table-manager-pro.preview.emergentagent.com
**Login Admin:** https://table-manager-pro.preview.emergentagent.com/admin/login

Desenvolvido com ❤️ para restaurantes modernos.
