import UIKit

class AppCoordinator: Coordinator {
    private let window: UIWindow
    private var childCoordinators: [Coordinator] = []
    private let navigationController: UINavigationController
    
    init(window: UIWindow) {
        self.window = window
        self.navigationController = UINavigationController()
    }
    
    func start() {
        window.rootViewController = navigationController
        window.makeKeyAndVisible()
        
        showInitialScreen()
    }
    
    private func showInitialScreen() {
        if AuthManager.shared.isAuthenticated {
            showDashboard()
        } else {
            showAuth()
        }
    }
    
    private func showAuth() {
        let coordinator = AuthCoordinator(navigationController: navigationController)
        childCoordinators.append(coordinator)
        coordinator.start()
    }
    
    private func showDashboard() {
        let coordinator = DashboardCoordinator(navigationController: navigationController)
        childCoordinators.append(coordinator)
        coordinator.start()
    }
}