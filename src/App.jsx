import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, orderBy, query, limit } from 'firebase/firestore'

// Configuração do Firebase - Projeto 'realmoedas'
const firebaseConfig = {
  apiKey: "AIzaSyCw40QpKPbnceBxYnfNYO3XkPU_DEKjUWU",
  authDomain: "realmoedas.firebaseapp.com",
  projectId: "realmoedas",
  storageBucket: "realmoedas.firebasestorage.app",
  messagingSenderId: "76105891653",
  appId: "1:76105891653:web:fe9c819eacb31ece5a882c"
}

// Inicializar Firebase apenas em desenvolvimento
let app = null
let db = null

// Flag para controlar se o Firebase está disponível
let firebaseAvailable = false

// Função para verificar se o Firebase está disponível
const checkFirebaseAvailability = async () => {
  // Desabilitar Firebase completamente em produção (GitHub Pages)
  if (import.meta.env.PROD) {
    firebaseAvailable = false
    console.info('🔥 Firebase desabilitado em produção. Funcionando apenas com API externa.')
    return false
  }

  try {
    // Inicializar Firebase apenas em desenvolvimento
    if (!app) {
      app = initializeApp(firebaseConfig)
      db = getFirestore(app)
    }
    
    // Tenta uma operação simples para verificar conectividade
    await getDocs(query(collection(db, 'test'), limit(1)))
    firebaseAvailable = true
    console.info('🔥 Firebase conectado com sucesso!')
    return true
  } catch (error) {
    firebaseAvailable = false
    console.warn('🔥 Firebase/Firestore não está disponível. Funcionando sem histórico.')
    return false
  }
}

// Mapeamento das moedas disponíveis baseado na API
const availableCurrencies = {
  'USD-BRL': 'Dólar Americano/Real Brasileiro',
  'EUR-BRL': 'Euro/Real Brasileiro',
  'GBP-BRL': 'Libra Esterlina/Real Brasileiro',
  'ARS-BRL': 'Peso Argentino/Real Brasileiro',
  'CAD-BRL': 'Dólar Canadense/Real Brasileiro',
  'AUD-BRL': 'Dólar Australiano/Real Brasileiro',
  'JPY-BRL': 'Iene Japonês/Real Brasileiro',
  'CHF-BRL': 'Franco Suíço/Real Brasileiro',
  'CNY-BRL': 'Yuan Chinês/Real Brasileiro',
  'BTC-BRL': 'Bitcoin/Real Brasileiro',
  'ETH-BRL': 'Ethereum/Real Brasileiro',
  'EUR-USD': 'Euro/Dólar Americano',
  'GBP-USD': 'Libra Esterlina/Dólar Americano',
  'USD-JPY': 'Dólar Americano/Iene Japonês',
  'USD-CHF': 'Dólar Americano/Franco Suíço'
}

function App() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD-BRL')
  const [currencyData, setCurrencyData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  // Carregar histórico do Firebase
  useEffect(() => {
    initializeFirebase()
  }, [])

  const initializeFirebase = async () => {
    const isAvailable = await checkFirebaseAvailability()
    if (isAvailable) {
      loadHistory()
    }
  }

  const loadHistory = async () => {
    if (!firebaseAvailable) return
    
    try {
      const q = query(
        collection(db, 'currency_queries'),
        orderBy('timestamp', 'desc'),
        limit(10)
      )
      const querySnapshot = await getDocs(q)
      const historyData = []
      querySnapshot.forEach((doc) => {
        historyData.push({ id: doc.id, ...doc.data() })
      })
      setHistory(historyData)
    } catch (error) {
      console.error('Erro ao carregar histórico do Firebase:', error)
      firebaseAvailable = false
    }
  }

  const fetchCurrencyData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Para GitHub Pages, usar API externa diretamente
      const apiUrl = import.meta.env.PROD 
        ? `https://api.exchangerate-api.com/v4/latest/${selectedCurrency.split('-')[0]}`
        : `http://localhost:5000/api/currency/${selectedCurrency}`
      
      let data
      
      if (import.meta.env.PROD) {
        // Produção: usar API externa
        const response = await axios.get(apiUrl)
        const rates = response.data.rates
        const targetCurrency = selectedCurrency.split('-')[1]
        
        data = {
          code: selectedCurrency,
          codein: targetCurrency,
          name: availableCurrencies[selectedCurrency],
          high: rates[targetCurrency],
          low: rates[targetCurrency],
          varBid: '0',
          pctChange: '0',
          bid: rates[targetCurrency],
          ask: rates[targetCurrency],
          timestamp: Date.now(),
          create_date: new Date().toISOString()
        }
      } else {
        // Desenvolvimento: usar backend local
        const response = await axios.get(apiUrl)
        data = response.data
      }
      
      setCurrencyData(data)
      
      // Tentar salvar consulta no Firebase (apenas se disponível)
      if (firebaseAvailable) {
        try {
          await addDoc(collection(db, 'currency_queries'), {
            currency: selectedCurrency,
            data: data,
            timestamp: new Date().toISOString()
          })
          
          // Recarregar histórico apenas se salvou com sucesso
          loadHistory()
        } catch (firebaseError) {
          console.error('Erro ao salvar no Firebase:', firebaseError)
          firebaseAvailable = false
        }
      }
      
    } catch (error) {
      console.error('Erro ao buscar cotação:', error)
      setError('Erro ao buscar cotação. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value, currency) => {
    const numValue = parseFloat(value)
    if (currency.includes('BRL')) {
      return numValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    }
    return numValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  return (
    <div className="container">
      <header className="header">
        <h1>💰 RealTrade</h1>
        <p>Cotações de moedas em tempo real</p>
      </header>

      <div className="currency-selector">
        <div className="selector-group">
          <label htmlFor="currency-select">Selecione a moeda:</label>
          <select
            id="currency-select"
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
          >
            {Object.entries(availableCurrencies).map(([code, name]) => (
              <option key={code} value={code}>
                {code} - {name}
              </option>
            ))}
          </select>
          <button
            className="btn-primary"
            onClick={fetchCurrencyData}
            disabled={loading}
          >
            {loading ? 'Buscando...' : 'Buscar Cotação'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {history.length === 0 && (
        <div className="info-banner">
          {import.meta.env.PROD ? (
            <p>📋 <strong>Modo Produção:</strong> Histórico desabilitado. A aplicação funciona apenas com cotações em tempo real via API externa.</p>
          ) : (
            <p>📋 <strong>Histórico:</strong> Para ativar o histórico de consultas, configure o Firestore Database no <a href="https://console.firebase.google.com/project/realmoedas" target="_blank" rel="noopener noreferrer">Console do Firebase</a></p>
          )}
        </div>
      )}

      <div className="results-container">
        {loading && (
          <div className="loading">
            <p>Carregando cotação...</p>
          </div>
        )}

        {currencyData && !loading && (
          <div>
            <h2>Cotação Atual - {selectedCurrency}</h2>
            
            <div className="currency-info">
              <div className="info-card">
                <h3>Valor Atual</h3>
                <p className="value-highlight">
                  {formatCurrency(currencyData.bid, selectedCurrency)}
                </p>
                <p>Compra: {formatCurrency(currencyData.bid, selectedCurrency)}</p>
                <p>Venda: {formatCurrency(currencyData.ask, selectedCurrency)}</p>
              </div>
              
              <div className="info-card">
                <h3>Variação</h3>
                <p className="value-highlight" style={{
                  color: parseFloat(currencyData.pctChange) >= 0 ? '#28a745' : '#dc3545'
                }}>
                  {currencyData.pctChange}%
                </p>
                <p>Variação: {formatCurrency(currencyData.varBid, selectedCurrency)}</p>
                <p>Máxima: {formatCurrency(currencyData.high, selectedCurrency)}</p>
                <p>Mínima: {formatCurrency(currencyData.low, selectedCurrency)}</p>
              </div>
              
              <div className="info-card">
                <h3>Informações</h3>
                <p><strong>Nome:</strong> {currencyData.name}</p>
                <p><strong>Código:</strong> {currencyData.code}</p>
                <p><strong>Atualizado:</strong> {formatDate(currencyData.create_date)}</p>
              </div>
            </div>

            <table className="currency-table">
              <thead>
                <tr>
                  <th>Campo</th>
                  <th>Valor</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Compra (Bid)</td>
                  <td>{formatCurrency(currencyData.bid, selectedCurrency)}</td>
                  <td>Valor de compra da moeda</td>
                </tr>
                <tr>
                  <td>Venda (Ask)</td>
                  <td>{formatCurrency(currencyData.ask, selectedCurrency)}</td>
                  <td>Valor de venda da moeda</td>
                </tr>
                <tr>
                  <td>Variação</td>
                  <td style={{
                    color: parseFloat(currencyData.pctChange) >= 0 ? '#28a745' : '#dc3545'
                  }}>
                    {currencyData.pctChange}%
                  </td>
                  <td>Variação percentual</td>
                </tr>
                <tr>
                  <td>Máxima</td>
                  <td>{formatCurrency(currencyData.high, selectedCurrency)}</td>
                  <td>Valor máximo do dia</td>
                </tr>
                <tr>
                  <td>Mínima</td>
                  <td>{formatCurrency(currencyData.low, selectedCurrency)}</td>
                  <td>Valor mínimo do dia</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {history.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3>Histórico de Consultas</h3>
            <table className="currency-table">
              <thead>
                <tr>
                  <th>Moeda</th>
                  <th>Valor</th>
                  <th>Data da Consulta</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>{item.currency}</td>
                    <td>{formatCurrency(item.data.bid, item.currency)}</td>
                    <td>{formatDate(item.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default App