import Foundation

enum APIError: Error {
    case invalidURL
    case networkError(Error)
    case invalidResponse
    case decodingError(Error)
    case serverError(Int)
    case unauthorized
    case rateLimited
}

class APIClient {
    static let shared = APIClient()
    private let session: URLSession
    private let baseURL: URL
    
    private init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 300
        configuration.waitsForConnectivity = true
        
        session = URLSession(configuration: configuration)
        baseURL = URL(string: Environment.apiURL)!
    }
    
    func request<T: Decodable>(
        endpoint: Endpoint,
        completion: @escaping (Result<T, APIError>) -> Void
    ) {
        guard let request = endpoint.urlRequest(baseURL: baseURL) else {
            completion(.failure(.invalidURL))
            return
        }
        
        let task = session.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(.invalidResponse))
                return
            }
            
            switch httpResponse.statusCode {
            case 200...299:
                guard let data = data else {
                    completion(.failure(.invalidResponse))
                    return
                }
                
                do {
                    let decoded = try JSONDecoder().decode(T.self, from: data)
                    completion(.success(decoded))
                } catch {
                    completion(.failure(.decodingError(error)))
                }
                
            case 401:
                completion(.failure(.unauthorized))
            case 429:
                completion(.failure(.rateLimited))
            default:
                completion(.failure(.serverError(httpResponse.statusCode)))
            }
        }
        
        task.resume()
    }
}