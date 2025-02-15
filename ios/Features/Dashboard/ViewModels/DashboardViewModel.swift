import Foundation
import Combine

class DashboardViewModel {
    @Published private(set) var thumbnails: [Thumbnail] = []
    @Published private(set) var isLoading = false
    @Published private(set) var error: Error?
    
    private let thumbnailService: ThumbnailService
    private var cancellables = Set<AnyCancellable>()
    
    init(thumbnailService: ThumbnailService = ThumbnailService()) {
        self.thumbnailService = thumbnailService
    }
    
    func loadThumbnails() {
        isLoading = true
        
        thumbnailService.fetchThumbnails()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.error = error
                    }
                },
                receiveValue: { [weak self] thumbnails in
                    self?.thumbnails = thumbnails
                }
            )
            .store(in: &cancellables)
    }
    
    func deleteThumbnail(_ thumbnail: Thumbnail) {
        thumbnailService.deleteThumbnail(thumbnail.id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.error = error
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.thumbnails.removeAll { $0.id == thumbnail.id }
                }
            )
            .store(in: &cancellables)
    }
}