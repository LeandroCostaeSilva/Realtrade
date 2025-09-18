# 🔧 Correção das Regras de Segurança do Firestore

## ❌ Problema Identificado

O erro "Missing or insufficient permissions" indica que as **regras de segurança do Firestore** estão bloqueando o acesso à coleção `quotation_history`.

### Erro no Console:
```
FirebaseError: Missing or insufficient permissions.
```

## ✅ Solução: Configurar Regras do Firestore

### Passo 1: Acessar o Firebase Console
1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto: **realmoedas**
3. No menu lateral, clique em **"Firestore Database"**
4. Clique na aba **"Rules"** (Regras)

### Passo 2: Configurar as Regras

Substitua as regras atuais por uma das opções abaixo:

#### Opção 1: Acesso Público (Recomendado para este projeto)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita na coleção quotation_history
    match /quotation_history/{document} {
      allow read, write: if true;
    }
  }
}
```

#### Opção 2: Apenas Leitura Pública + Escrita Limitada
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura pública e apenas criação de novos documentos
    match /quotation_history/{document} {
      allow read: if true;
      allow create: if true;
    }
  }
}
```

### Passo 3: Publicar as Regras
1. Cole uma das regras acima no editor
2. Clique em **"Publish"** (Publicar)
3. Aguarde 1-2 minutos para a propagação

## 🔒 Considerações de Segurança

### Por que essas regras são seguras para este projeto:
- ✅ Aplicação de cotações não contém dados sensíveis
- ✅ Dados são apenas histórico de consultas públicas
- ✅ Não há informações pessoais ou financeiras
- ✅ API externa já é pública (economia.awesomeapi.com.br)

### Alternativas mais seguras (futuro):
- Implementar autenticação anônima do Firebase
- Usar Cloud Functions para operações de escrita
- Adicionar rate limiting nas regras

## 🧪 Como Testar

Após configurar as regras:
1. Aguarde 2 minutos
2. Acesse: https://leandrocostasilva.github.io/Realtrade/
3. Faça uma consulta de cotação
4. Verifique se o histórico aparece
5. Console não deve mais mostrar erros de permissão

## 📋 Status
- [x] Problema identificado: Regras do Firestore
- [ ] Regras configuradas no Firebase Console
- [ ] Teste realizado com sucesso

---

**Nota**: Este é o problema principal que impede o funcionamento do Firebase. O domínio já foi autorizado corretamente.