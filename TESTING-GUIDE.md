# 🧪 Guia de Testes - Frontend Navigation Integration

**Data:** 10 de Outubro de 2025  
**Status:** ✅ Servidor rodando em http://localhost:8081

---

## 🎯 Funcionalidades para Testar

### 1. **AppHeader com Ícones** 🎨

**Localização:** Topo de todas as telas principais

**O que testar:**
- [ ] Header aparece com título "FoodConnect"
- [ ] Ícone de busca (lupa) visível no lado direito
- [ ] Ícone de notificações (sino) visível no lado direito
- [ ] Badge de notificações mostra contagem (se houver não lidas)
- [ ] Header se adapta ao tema (cores corretas)

**Como testar:**
1. Abra a tela Feed
2. Observe o header no topo
3. Verifique se os ícones estão alinhados corretamente

---

### 2. **Navegação para Busca** 🔍

**Localização:** Ícone de lupa no header

**O que testar:**
- [ ] Clicar no ícone de lupa abre a SearchScreen
- [ ] SearchScreen aparece como modal (animação de baixo para cima)
- [ ] Campo de busca funciona
- [ ] Filtros (All, Pessoas, Posts, Restaurantes) funcionam
- [ ] Resultados aparecem ao digitar
- [ ] Pode fechar a tela (botão X ou swipe)

**Como testar:**
1. Na tela Feed, clique no ícone de lupa (header)
2. Digite algo no campo de busca
3. Teste os filtros
4. Observe os resultados
5. Feche a tela

---

### 3. **Navegação para Notificações** 🔔

**Localização:** Ícone de sino no header

**O que testar:**
- [ ] Clicar no ícone de sino abre NotificationsScreen
- [ ] Badge mostra contagem de não lidas
- [ ] Lista de notificações aparece
- [ ] Pode marcar como lida (clique em uma notificação)
- [ ] Botão "Marcar todas como lidas" funciona
- [ ] Pull to refresh funciona
- [ ] Navegação para conteúdo relacionado funciona

**Como testar:**
1. Na tela Feed, clique no ícone de sino (header)
2. Observe a lista de notificações
3. Clique em "Marcar todas como lidas"
4. Teste o pull to refresh
5. Clique em uma notificação para navegar

---

### 4. **Navegação para Comentários** 💬

**Localização:** Ícone de comentário em cada post

**O que testar:**
- [ ] Clicar no ícone de comentário abre CommentsScreen
- [ ] CommentsScreen mostra o post selecionado
- [ ] Lista de comentários aparece
- [ ] Campo de adicionar comentário funciona
- [ ] Pode enviar novo comentário
- [ ] Pode voltar para o feed

**Como testar:**
1. Na tela Feed, role até encontrar um post
2. Clique no ícone de comentário (abaixo da imagem)
3. Observe a tela de comentários
4. Digite um comentário
5. Envie o comentário
6. Volte ao feed

---

### 5. **Navegação para Conquistas** 🏆

**Localização:** Botão de troféu no ProfileScreen

**O que testar:**
- [ ] Na tela Profile, botão de troféu aparece
- [ ] Clicar no troféu abre AchievementsScreen
- [ ] Conquistas desbloqueadas aparecem com gradiente colorido
- [ ] Conquistas bloqueadas aparecem em cinza
- [ ] Barras de progresso funcionam
- [ ] Estatísticas do usuário aparecem no topo
- [ ] Botão "Verificar novas conquistas" funciona

**Como testar:**
1. Navegue para a tab "Perfil" (ícone de pessoa)
2. Observe os botões de ação
3. Clique no ícone de troféu (entre "Editar Perfil" e "Configurações")
4. Observe as conquistas
5. Role a lista
6. Clique em "Verificar novas conquistas"

---

### 6. **Stories no Feed** 📸

**Localização:** Topo da FeedScreen (scroll horizontal)

**O que testar:**
- [ ] Stories aparecem no topo do feed
- [ ] Scroll horizontal funciona
- [ ] Avatar do usuário aparece
- [ ] Ícone de "+" para criar story aparece
- [ ] Clicar em um story abre visualização

**Como testar:**
1. Na tela Feed, observe o topo (abaixo do header)
2. Deslize horizontalmente nos stories
3. Clique em um story
4. Observe a animação

---

### 7. **Filtros de Posts** 🍔

**Localização:** Abaixo dos Stories na FeedScreen

**O que testar:**
- [ ] Filtros aparecem (Tudo, Comida, Bebidas, Social)
- [ ] Filtro selecionado muda de cor
- [ ] Posts filtram ao clicar
- [ ] Animação de transição suave

**Como testar:**
1. Na tela Feed, role até os botões de filtro
2. Clique em "Comida"
3. Observe os posts mudarem
4. Teste os outros filtros

---

### 8. **Like em Posts** ❤️

**Localização:** Ícone de coração em cada post

**O que testar:**
- [ ] Clicar no coração dá like
- [ ] Ícone muda de cor (vermelho)
- [ ] Contador de likes atualiza
- [ ] Animação de like aparece
- [ ] Double tap na imagem também dá like

**Como testar:**
1. Na tela Feed, encontre um post
2. Clique no ícone de coração
3. Dê double tap na imagem do post
4. Observe as animações

---

### 9. **Navegação por Tabs** 📱

**Localização:** Bottom Tab Bar

**O que testar:**
- [ ] 5 tabs visíveis (Home, Buscar, Carrinho, Pedidos, Perfil)
- [ ] Tab selecionada muda de cor
- [ ] Ícones mudam (preenchidos quando selecionados)
- [ ] Navegação suave entre tabs
- [ ] Conteúdo de cada tab carrega corretamente

**Como testar:**
1. Observe a barra inferior
2. Clique em cada tab
3. Observe a mudança de ícone e cor
4. Verifique se o conteúdo carrega

---

### 10. **Performance e Responsividade** ⚡

**O que testar:**
- [ ] App não trava ou congela
- [ ] Scroll suave em listas
- [ ] Imagens carregam rapidamente
- [ ] Transições de navegação fluidas
- [ ] Sem lag ao clicar em botões
- [ ] WebSocket conecta automaticamente

**Como testar:**
1. Use o app por 5 minutos
2. Navegue entre várias telas rapidamente
3. Role feeds longos
4. Observe a fluidez geral

---

## 🐛 Problemas Conhecidos

### Avisos (Não bloqueadores):
- ⚠️ Expo version 54.0.12 vs 54.0.13 (diferença menor, não impacta)
- ⚠️ Alguns dados são mockados (notificações, achievements)

### A implementar:
- 🔄 Deep linking para notificações push
- 🔄 Persistência de estado ao recarregar
- 🔄 Cache de imagens offline
- 🔄 Animações customizadas de transição

---

## 📊 Checklist de Teste Completo

### Frontend:
- [ ] Header aparece corretamente
- [ ] Navegação para Busca funciona
- [ ] Navegação para Notificações funciona
- [ ] Badge de notificações atualiza
- [ ] Navegação para Comentários funciona
- [ ] Navegação para Conquistas funciona
- [ ] Stories aparecem e funcionam
- [ ] Filtros de posts funcionam
- [ ] Likes funcionam com animação
- [ ] Tabs funcionam corretamente

### Backend:
- [ ] API responde (http://localhost:3000)
- [ ] WebSocket conecta
- [ ] Endpoints de posts funcionam
- [ ] Endpoints de notificações funcionam
- [ ] Endpoints de comentários funcionam
- [ ] Autenticação funciona

### Performance:
- [ ] App carrega em menos de 3 segundos
- [ ] Scroll suave (60 FPS)
- [ ] Transições fluidas
- [ ] Sem memory leaks

---

## 🚀 Como Testar

### No Navegador (Web):
1. Abra: http://localhost:8081
2. Login: Use credenciais de teste
3. Teste todas as funcionalidades acima

### No Android:
1. Instale Expo Go no celular
2. Escaneie o QR code no terminal
3. App abrirá automaticamente

### No iOS:
1. Abra a câmera do iPhone
2. Escaneie o QR code no terminal
3. Toque na notificação para abrir

### No Emulador:
1. No terminal, pressione 'a' para Android ou 'i' para iOS
2. Emulador abrirá automaticamente

---

## 📝 Reportar Bugs

Se encontrar bugs, anote:
1. **Tela:** Onde aconteceu?
2. **Ação:** O que você fez?
3. **Esperado:** O que deveria acontecer?
4. **Atual:** O que realmente aconteceu?
5. **Console:** Copie erros do console (F12)

---

## ✅ Status dos Testes

**Data do último teste:** Aguardando  
**Testador:** -  
**Plataforma:** -  
**Resultado:** -  

---

**Servidor rodando em:** http://localhost:8081  
**Backend rodando em:** http://localhost:3000  
**Documentação:** FRONTEND-NAVIGATION-INTEGRATION.md
