# 💰 RealTrade - Cotações em Tempo Real

Aplicação full-stack para consulta de cotações de moedas em tempo real, utilizando a API AwesomeAPI.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Interface de usuário
- **Vite** - Build tool e dev server
- **Axios** - Cliente HTTP para requisições
- **Firebase** - Banco de dados para histórico

### Backend
- **Python 3.8+** - Linguagem de programação
- **Flask** - Framework web
- **Flask-CORS** - Habilitação de CORS
- **Requests** - Cliente HTTP para API externa

### API Externa
- **AwesomeAPI** - Cotações de moedas em tempo real

## 📋 Pré-requisitos

- Node.js 16+ e npm
- Python 3.8+
- Conta no Firebase (para banco de dados)

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
cd "c:\Users\Leandro\OneDrive\Área de Trabalho\realtrade"
```

### 2. Configuração do Frontend

```bash
# Instalar dependências
npm install
```

#### Configuração do Firebase
1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative o Firestore Database
4. Obtenha as credenciais do projeto
5. Substitua as credenciais no arquivo `src/App.jsx`:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-project-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
}
```

### 3. Configuração do Backend

```bash
# Navegar para o diretório do backend
cd backend

# Criar ambiente virtual (recomendado)
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

## 🚀 Executando a Aplicação

### 1. Iniciar o Backend
```bash
# No diretório backend
python app.py
```
O backend estará disponível em: `http://localhost:5000`

### 2. Iniciar o Frontend
```bash
# No diretório raiz do projeto
npm run dev
```
O frontend estará disponível em: `http://localhost:3000`

## 📊 Funcionalidades

### ✅ Implementadas
- [x] Interface React com seletor de moedas
- [x] Backend Python com Flask
- [x] Integração com AwesomeAPI
- [x] Exibição de cotações em tempo real
- [x] Tabela formatada com dados JSON
- [x] Integração com Firebase
- [x] Histórico de consultas
- [x] Design responsivo e moderno
- [x] Tratamento de erros
- [x] Loading states

### 🎯 Moedas Suportadas
- USD-BRL (Dólar/Real)
- EUR-BRL (Euro/Real)
- GBP-BRL (Libra/Real)
- ARS-BRL (Peso Argentino/Real)
- CAD-BRL (Dólar Canadense/Real)
- AUD-BRL (Dólar Australiano/Real)
- JPY-BRL (Iene/Real)
- CHF-BRL (Franco Suíço/Real)
- CNY-BRL (Yuan/Real)
- BTC-BRL (Bitcoin/Real)
- ETH-BRL (Ethereum/Real)
- E muitas outras...

## 🔗 Endpoints da API

### Backend Local
- `GET /api/currency/<pair>` - Buscar cotação específica
- `GET /api/available-currencies` - Listar moedas disponíveis
- `POST /api/multiple-currencies` - Buscar múltiplas cotações
- `GET /api/health` - Status da API

### API Externa (AwesomeAPI)
- `GET https://economia.awesomeapi.com.br/json/last/:moedas`
- `GET https://economia.awesomeapi.com.br/xml/available`

## 📱 Como Usar

1. **Selecionar Moeda**: Escolha o par de moedas no dropdown
2. **Buscar Cotação**: Clique em "Buscar Cotação"
3. **Visualizar Dados**: Veja as informações em cards e tabela
4. **Histórico**: Consulte o histórico de buscas anteriores

## 🎨 Interface

A aplicação possui:
- **Design Moderno**: Gradientes e sombras suaves
- **Responsivo**: Funciona em desktop e mobile
- **Cards Informativos**: Dados organizados visualmente
- **Tabela Detalhada**: Todos os dados da API
- **Indicadores Visuais**: Cores para variações positivas/negativas

## 🔧 Estrutura do Projeto

```
realtrade/
├── src/
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Ponto de entrada React
│   └── index.css        # Estilos globais
├── backend/
│   ├── app.py           # Servidor Flask
│   └── requirements.txt # Dependências Python
├── package.json         # Dependências Node.js
├── vite.config.js       # Configuração Vite
├── index.html           # HTML principal
└── README.md            # Este arquivo
```

## 🐛 Solução de Problemas

### Erro de CORS
- Verifique se o Flask-CORS está instalado
- Confirme se o backend está rodando na porta 5000

### Erro do Firebase
- Verifique as credenciais no `src/App.jsx`
- Confirme se o Firestore está ativado no projeto

### API não responde
- Verifique sua conexão com a internet
- Teste a API diretamente: `https://economia.awesomeapi.com.br/json/last/USD-BRL`

## 📄 Licença

Este projeto é de uso educacional e demonstrativo.

## 🤝 Contribuição

Sinta-se à vontade para contribuir com melhorias!

---

**Desenvolvido com ❤️ para demonstrar integração full-stack com APIs externas**