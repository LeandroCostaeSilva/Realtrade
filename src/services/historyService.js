import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp 
} from "firebase/firestore";
import { db } from "../firebase";

// Coleção do histórico no Firestore
const HISTORY_COLLECTION = "quotation_history";

/**
 * Salva uma consulta de cotação no histórico
 * @param {Object} quotationData - Dados da cotação
 * @param {string} quotationData.code - Código da moeda (ex: "USD-BRL")
 * @param {string} quotationData.name - Nome da moeda (ex: "Dólar Americano")
 * @param {number} quotationData.bid - Valor de compra
 * @param {number} quotationData.ask - Valor de venda
 * @param {number} quotationData.varBid - Variação
 * @param {number} quotationData.pctChange - Percentual de mudança
 * @param {string} quotationData.high - Maior valor do dia
 * @param {string} quotationData.low - Menor valor do dia
 */
export const saveQuotationHistory = async (quotationData) => {
  try {
    const historyEntry = {
      ...quotationData,
      timestamp: Timestamp.now(),
      consultedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, HISTORY_COLLECTION), historyEntry);
    console.log("Histórico salvo com ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar histórico: ", error);
    
    // Se for erro de conexão, não propagar o erro para não quebrar a aplicação
    if (error.code === 'unavailable' || error.code === 'deadline-exceeded' || 
        error.message?.includes('ERR_ABORTED') || error.message?.includes('network')) {
      console.warn("Erro de conexão com Firebase - histórico não salvo, mas aplicação continua funcionando");
      return null;
    }
    
    throw error;
  }
};

/**
 * Busca o histórico de consultas
 * @param {number} limitResults - Número máximo de resultados (padrão: 50)
 * @returns {Array} Array com o histórico de consultas
 */
export const getQuotationHistory = async (limitResults = 50) => {
  try {
    const q = query(
      collection(db, HISTORY_COLLECTION),
      orderBy("timestamp", "desc"),
      limit(limitResults)
    );

    const querySnapshot = await getDocs(q);
    const history = [];
    
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return history;
  } catch (error) {
    console.error("Erro ao buscar histórico: ", error);
    
    // Se for erro de conexão, retornar array vazio para não quebrar a aplicação
    if (error.code === 'unavailable' || error.code === 'deadline-exceeded' || 
        error.message?.includes('ERR_ABORTED') || error.message?.includes('network')) {
      console.warn("Erro de conexão com Firebase - retornando histórico vazio");
      return [];
    }
    
    throw error;
  }
};

/**
 * Busca histórico de uma moeda específica
 * @param {string} currencyCode - Código da moeda (ex: "USD-BRL")
 * @param {number} limitResults - Número máximo de resultados (padrão: 20)
 * @returns {Array} Array com o histórico da moeda específica
 */
export const getCurrencyHistory = async (currencyCode, limitResults = 20) => {
  try {
    const q = query(
      collection(db, HISTORY_COLLECTION),
      orderBy("timestamp", "desc"),
      limit(limitResults)
    );

    const querySnapshot = await getDocs(q);
    const history = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.code === currencyCode) {
        history.push({
          id: doc.id,
          ...data
        });
      }
    });

    return history;
  } catch (error) {
    console.error("Erro ao buscar histórico da moeda: ", error);
    
    // Se for erro de conexão, retornar array vazio para não quebrar a aplicação
    if (error.code === 'unavailable' || error.code === 'deadline-exceeded' || 
        error.message?.includes('ERR_ABORTED') || error.message?.includes('network')) {
      console.warn("Erro de conexão com Firebase - retornando histórico vazio para a moeda");
      return [];
    }
    
    throw error;
  }
};