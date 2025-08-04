from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Permitir requisições do frontend

# URL base da API AwesomeAPI
BASE_URL = "https://economia.awesomeapi.com.br/json/last"

@app.route('/api/currency/<currency_pair>', methods=['GET'])
def get_currency_quote(currency_pair):
    """
    Busca a cotação de uma moeda específica na API AwesomeAPI
    """
    try:
        # Fazer requisição para a API AwesomeAPI
        url = f"{BASE_URL}/{currency_pair}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            
            # A API retorna um objeto com a chave sendo o par de moedas
            # Exemplo: {"USDBRL": {dados...}}
            currency_key = currency_pair.replace('-', '')
            
            if currency_key in data:
                currency_info = data[currency_key]
                
                # Estruturar os dados de resposta
                result = {
                    'code': currency_info.get('code'),
                    'codein': currency_info.get('codein'),
                    'name': currency_info.get('name'),
                    'high': currency_info.get('high'),
                    'low': currency_info.get('low'),
                    'varBid': currency_info.get('varBid'),
                    'pctChange': currency_info.get('pctChange'),
                    'bid': currency_info.get('bid'),
                    'ask': currency_info.get('ask'),
                    'timestamp': currency_info.get('timestamp'),
                    'create_date': currency_info.get('create_date'),
                    'currency_pair': currency_pair,
                    'fetched_at': datetime.now().isoformat()
                }
                
                return jsonify(result)
            else:
                return jsonify({
                    'error': 'Par de moedas não encontrado',
                    'available_pairs': list(data.keys())
                }), 404
        else:
            return jsonify({
                'error': 'Erro ao buscar cotação na API externa',
                'status_code': response.status_code
            }), response.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': 'Erro de conexão com a API externa',
            'details': str(e)
        }), 500
    except Exception as e:
        return jsonify({
            'error': 'Erro interno do servidor',
            'details': str(e)
        }), 500

@app.route('/api/available-currencies', methods=['GET'])
def get_available_currencies():
    """
    Retorna a lista de moedas disponíveis
    """
    try:
        # Fazer requisição para obter moedas disponíveis
        url = "https://economia.awesomeapi.com.br/xml/available"
        response = requests.get(url)
        
        if response.status_code == 200:
            # A resposta é em XML, mas podemos retornar uma lista pré-definida
            # baseada na documentação da API
            available_currencies = {
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
                'LTC-BRL': 'Litecoin/Real Brasileiro',
                'XRP-BRL': 'XRP/Real Brasileiro',
                'DOGE-BRL': 'Dogecoin/Real Brasileiro',
                'EUR-USD': 'Euro/Dólar Americano',
                'GBP-USD': 'Libra Esterlina/Dólar Americano',
                'USD-JPY': 'Dólar Americano/Iene Japonês',
                'USD-CHF': 'Dólar Americano/Franco Suíço',
                'USD-CAD': 'Dólar Americano/Dólar Canadense'
            }
            
            return jsonify(available_currencies)
        else:
            return jsonify({
                'error': 'Erro ao buscar moedas disponíveis'
            }), 500
            
    except Exception as e:
        return jsonify({
            'error': 'Erro interno do servidor',
            'details': str(e)
        }), 500

@app.route('/api/multiple-currencies', methods=['POST'])
def get_multiple_currencies():
    """
    Busca cotações de múltiplas moedas
    """
    try:
        data = request.get_json()
        currency_pairs = data.get('currencies', [])
        
        if not currency_pairs:
            return jsonify({'error': 'Lista de moedas não fornecida'}), 400
        
        results = {}
        
        for pair in currency_pairs:
            try:
                url = f"{BASE_URL}/{pair}"
                response = requests.get(url)
                
                if response.status_code == 200:
                    currency_data = response.json()
                    currency_key = pair.replace('-', '')
                    
                    if currency_key in currency_data:
                        results[pair] = currency_data[currency_key]
                    else:
                        results[pair] = {'error': 'Par de moedas não encontrado'}
                else:
                    results[pair] = {'error': f'Erro HTTP {response.status_code}'}
                    
            except Exception as e:
                results[pair] = {'error': str(e)}
        
        return jsonify({
            'results': results,
            'fetched_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Erro interno do servidor',
            'details': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Endpoint para verificar se a API está funcionando
    """
    return jsonify({
        'status': 'OK',
        'message': 'API RealTrade funcionando',
        'timestamp': datetime.now().isoformat()
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint não encontrado',
        'available_endpoints': [
            '/api/currency/<currency_pair>',
            '/api/available-currencies',
            '/api/multiple-currencies',
            '/api/health'
        ]
    }), 404

if __name__ == '__main__':
    print("🚀 Iniciando servidor RealTrade Backend...")
    print("📊 API de cotações disponível em: http://localhost:5000")
    print("📋 Endpoints disponíveis:")
    print("   - GET /api/currency/<pair> - Buscar cotação específica")
    print("   - GET /api/available-currencies - Listar moedas disponíveis")
    print("   - POST /api/multiple-currencies - Buscar múltiplas cotações")
    print("   - GET /api/health - Status da API")
    
    app.run(debug=True, host='0.0.0.0', port=5000)