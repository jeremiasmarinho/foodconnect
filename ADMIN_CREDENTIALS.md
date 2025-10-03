# Credenciais do Sistema FoodConnect

## 👤 Usuário Administrador

### Credenciais de Acesso

- **Email**: `admin@foodconnect.com`
- **Senha**: `FoodConnect2024!`
- **Nome**: `Administrator`
- **Username**: `admin`
- **Tipo**: `Admin`

### Permissões

- ✅ Acesso total ao sistema
- ✅ Gerenciamento de usuários
- ✅ Gerenciamento de restaurantes
- ✅ Visualização de relatórios
- ✅ Configurações do sistema

---

## 🔧 Como Usar

### Login via API

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@foodconnect.com",
  "password": "FoodConnect2024!"
}
```

### Login via Frontend

1. Acesse a tela de login
2. Digite: `admin@foodconnect.com`
3. Senha: `FoodConnect2024!`
4. Clique em "Entrar"

---

## 📝 Notas Importantes

- **Criado em**: 03/10/2025
- **Ambiente**: Desenvolvimento
- **Status**: Ativo
- **Última atualização**: 03/10/2025

### ⚠️ Segurança

- Esta senha deve ser alterada em produção
- Use credenciais mais seguras em ambiente real
- Mantenha este arquivo fora do controle de versão

---

## 🚀 Comandos Úteis

### Criar usuário admin via seed

```bash
cd backend
npm run seed:admin
```

### Verificar usuário no banco

```bash
# Via Prisma Studio
npx prisma studio

# Via SQL direto
SELECT * FROM users WHERE email = 'admin@foodconnect.com';
```

---

## 📊 Outros Usuários de Teste

### Usuário Regular

- **Email**: `user@foodconnect.com`
- **Senha**: `User123!`
- **Tipo**: `User`

### Usuário Restaurante

- **Email**: `restaurant@foodconnect.com`
- **Senha**: `Restaurant123!`
- **Tipo**: `Restaurant`

---

_Documento gerado automaticamente - FoodConnect © 2025_
