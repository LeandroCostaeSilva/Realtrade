import React, { useState, useEffect } from 'react';
import { getQuotationHistory } from '../services/historyService';

const QuotationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await getQuotationHistory(20);
      setHistory(historyData);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar histórico: ' + err.message);
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    
    let date;
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleString('pt-BR');
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return parseFloat(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 4
    });
  };

  const formatPercentage = (value) => {
    if (!value) return 'N/A';
    const num = parseFloat(value);
    const color = num >= 0 ? '#10b981' : '#ef4444';
    return (
      <span style={{ color }}>
        {num >= 0 ? '+' : ''}{num.toFixed(2)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        background: '#f8fafc',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <div style={{ 
          display: 'inline-block',
          width: '20px',
          height: '20px',
          border: '2px solid #e2e8f0',
          borderTop: '2px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '10px', color: '#64748b' }}>
          Carregando histórico...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
        <button 
          onClick={loadHistory}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{ margin: '20px 0' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#1f2937',
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>
          📊 Histórico de Consultas
        </h3>
        <button 
          onClick={loadHistory}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          🔄 Atualizar
        </button>
      </div>

      {history.length === 0 ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ color: '#64748b', margin: 0 }}>
            Nenhuma consulta encontrada no histórico.
          </p>
        </div>
      ) : (
        <div style={{ 
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto'
          }}>
            {history.map((item, index) => (
              <div 
                key={item.id || index}
                style={{ 
                  padding: '16px',
                  borderBottom: index < history.length - 1 ? '1px solid #f1f5f9' : 'none',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#1f2937',
                    fontSize: '14px'
                  }}>
                    {item.name || item.code}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#64748b',
                    marginTop: '2px'
                  }}>
                    {item.code}
                  </div>
                </div>

                <div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {formatCurrency(item.bid)}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#64748b'
                  }}>
                    Compra
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {formatPercentage(item.pctChange)}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#64748b'
                  }}>
                    Variação
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#64748b'
                  }}>
                    {formatDate(item.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default QuotationHistory;