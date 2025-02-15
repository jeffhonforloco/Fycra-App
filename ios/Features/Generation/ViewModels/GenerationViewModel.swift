import Foundation
import Combine
import UIKit

class GenerationViewModel {
    @Published private(set) var isGenerating = false
    @Published private(set) var progress: Float = 0
    @Published private(set) var error: Error?
    @Published private(set) var generatedThumbnail: Thumbnail?
    
    private let generationService: GenerationService
    private var cancellables = Set<AnyCancellable>()
    
    init(generationService: GenerationService = GenerationService()) {
        self.generationService = generationService
    }
    
    func generateThumbnail(
        title: String,
        style: ThumbnailStyle,
        backgroundImage: UIImage? = nil
    ) {
        isGenerating = true
        progress = 0
        
        generationService.generateThumbnail(
            title: title,
            style: style,
            backgroundImage: backgroundImage
        )
        .receive(on: DispatchQueue.main)
        .sink(
            receiveCompletion: { [weak self] completion in
                self?.isGenerating = false
                if case .failure(let error) = completion {
                    self?.error = error
                }
            },
            receiveValue: { [weak self] thumbnail in
                self?.generatedThumbnail = thumbnail
                self?.progress = 1.0
            }
        )
        .store(in: &cancellables)
    }
}