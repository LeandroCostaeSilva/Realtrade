# Correção da Integração Firebase com GitHub Pages

## Problema Identificado
O site perdeu a conexão com Firebase após o deploy no GitHub Pages porque o domínio `leandrocostasilva.github.io` não está autorizado no Firebase Console.

## Solução: Adicionar Domínio Autorizado no Firebase Console

### Passo 1: Acessar o Firebase Console
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto "realmoedas"

### Passo 2: Configurar Domínios Autorizados
1. No menu lateral, clique em **Authentication**
2. Clique na aba **Settings** (Configurações)
3. Role para baixo até encontrar a seção **Authorized domains** (Domínios autorizados)
4. Clique em **Add domain** (Adicionar domínio)
5. Adicione o domínio: `leandrocostasilva.github.io`
6. Clique em **Add** (Adicionar)

### Passo 3: Verificar Configuração
Após adicionar o domínio, aguarde alguns minutos para a propagação e teste o site novamente.

## Domínios que devem estar autorizados:
- `localhost` (para desenvolvimento local)
- `leandrocostasilva.github.io` (para produção no GitHub Pages)
- `realmoedas.firebaseapp.com` (domínio padrão do Firebase)

## Observações Importantes
- O Firebase bloqueia requisições de domínios não autorizados por questões de segurança
- Esta é uma configuração obrigatória para aplicações web que usam Firebase Authentication ou Firestore
- O problema não está no código, mas sim na configuração do projeto no Firebase Console

## Teste após a correção
Após adicionar o domínio autorizado:
1. Acesse https://leandrocostasilva.github.io/Realtrade/
2. Abra o console do navegador (F12)
3. Teste uma consulta de cotação
4. Verifique se não há mais erros de CORS ou domínio não autorizado

## Código já está correto
O código da aplicação está funcionando corretamente:
- ✅ Configuração do Firebase está correta
- ✅ Tratamento de erros implementado
- ✅ Fallback para API externa funcionando
- ✅ Modo simplificado ativo quando Firebase não está disponível

Apenas a configuração do domínio autorizado no Firebase Console precisa ser ajustada.