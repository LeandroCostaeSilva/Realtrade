import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { saveQuotationHistory } from './services/historyService'
import QuotationHistory from './components/QuotationHistory'

// Flag para controlar se o Firebase está disponível
let firebaseAvailable = true

// Função para verificar se o Firebase está disponível
const checkFirebaseAvailability = async () => {
  try {
    // Tentar importar e inicializar Firebase
    const { db } = await import('./firebase')
    firebaseAvailable = true
    console.info('🔥 Firebase conectado com sucesso!')
    return true
  } catch (error) {
    firebaseAvailable = false
    console.warn('🔥 Firebase/Firestore não está disponível. Funcionando sem histórico.', error)
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
  // Verificar disponibilidade do Firebase na inicialização
  useEffect(() => {
    checkFirebaseAvailability()
  }, [])

  const fetchCurrencyData = async () => {
    setLoading(true)
    setError('')
    
    try {
      let data
      
      // Tentar backend local primeiro, se falhar usar API externa
      try {
        // Tentar backend local
        const localApiUrl = `http://localhost:5000/api/currency/${selectedCurrency}`
        const localResponse = await axios.get(localApiUrl, { timeout: 2000 })
        data = localResponse.data
        console.log('✅ Usando backend local')
      } catch (localError) {
        console.warn('⚠️ Backend local não disponível, usando API externa:', localError.message)
        
        // Fallback para API externa
        const apiUrl = `https://economia.awesomeapi.com.br/json/last/${selectedCurrency}`
        const response = await axios.get(apiUrl)
        
        // A API retorna um objeto com a chave sendo o par de moedas
        const currencyKey = selectedCurrency.replace('-', '')
        
        if (response.data[currencyKey]) {
          const currencyInfo = response.data[currencyKey]
          data = {
            code: currencyInfo.code,
            codein: currencyInfo.codein,
            name: currencyInfo.name,
            high: currencyInfo.high,
            low: currencyInfo.low,
            varBid: currencyInfo.varBid,
            pctChange: currencyInfo.pctChange,
            bid: currencyInfo.bid,
            ask: currencyInfo.ask,
            timestamp: currencyInfo.timestamp,
            create_date: currencyInfo.create_date
          }
          console.log('✅ Usando API externa')
        } else {
          throw new Error('Par de moedas não encontrado na API')
        }
      }
      
      setCurrencyData(data)
      
      // Tentar salvar consulta no Firebase (apenas se disponível)
      if (firebaseAvailable) {
        try {
          await saveQuotationHistory({
            code: data.code,
            name: data.name,
            bid: data.bid,
            ask: data.ask,
            varBid: data.varBid,
            pctChange: data.pctChange,
            high: data.high,
            low: data.low
          })
          console.log('✅ Cotação salva no histórico com sucesso!')
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
      // Para valores muito pequenos (menores que 0.01), usar mais casas decimais
      if (numValue < 0.01 && numValue > 0) {
        return numValue.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 6,
          maximumFractionDigits: 6
        })
      }
      return numValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    }
    
    // Para outras moedas, também verificar valores pequenos
    if (numValue < 0.01 && numValue > 0) {
      return numValue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 6,
        maximumFractionDigits: 6
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

      {!firebaseAvailable && (
        <div className="info-banner">
          <p>📋 <strong>Modo Simplificado:</strong> Firebase não disponível. A aplicação funciona com cotações em tempo real via API externa.</p>
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

            {/* Tabela responsiva para desktop e tablets */}
            <div className="table-container">
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

            {/* Layout de cards para mobile */}
            <div className="currency-cards">
              <div className="currency-card">
                <div className="currency-card-row">
                  <span className="currency-card-label">Compra (Bid)</span>
                  <span className="currency-card-value">{formatCurrency(currencyData.bid, selectedCurrency)}</span>
                </div>
                <div className="currency-card-row">
                  <span className="currency-card-label">Descrição</span>
                  <span className="currency-card-value">Valor de compra da moeda</span>
                </div>
              </div>

              <div className="currency-card">
                <div className="currency-card-row">
                  <span className="currency-card-label">Venda (Ask)</span>
                  <span className="currency-card-value">{formatCurrency(currencyData.ask, selectedCurrency)}</span>
                </div>
                <div className="currency-card-row">
                  <span className="currency-card-label">Descrição</span>
                  <span className="currency-card-value">Valor de venda da moeda</span>
                </div>
              </div>

              <div className="currency-card">
                <div className="currency-card-row">
                  <span className="currency-card-label">Variação</span>
                  <span className="currency-card-value" style={{
                    color: parseFloat(currencyData.pctChange) >= 0 ? '#28a745' : '#dc3545'
                  }}>
                    {currencyData.pctChange}%
                  </span>
                </div>
                <div className="currency-card-row">
                  <span className="currency-card-label">Descrição</span>
                  <span className="currency-card-value">Variação percentual</span>
                </div>
              </div>

              <div className="currency-card">
                <div className="currency-card-row">
                  <span className="currency-card-label">Máxima</span>
                  <span className="currency-card-value">{formatCurrency(currencyData.high, selectedCurrency)}</span>
                </div>
                <div className="currency-card-row">
                  <span className="currency-card-label">Descrição</span>
                  <span className="currency-card-value">Valor máximo do dia</span>
                </div>
              </div>

              <div className="currency-card">
                <div className="currency-card-row">
                  <span className="currency-card-label">Mínima</span>
                  <span className="currency-card-value">{formatCurrency(currencyData.low, selectedCurrency)}</span>
                </div>
                <div className="currency-card-row">
                  <span className="currency-card-label">Descrição</span>
                  <span className="currency-card-value">Valor mínimo do dia</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Componente de Histórico do Firebase */}
        {firebaseAvailable && <QuotationHistory />}
      </div>
    </div>
  )
}

export default App