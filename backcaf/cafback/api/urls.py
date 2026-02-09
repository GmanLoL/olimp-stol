# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'menu-items', views.MenuItemViewSet, basename='menuitem')  # Явно указываем basename
router.register(r'reviews', views.ReviewViewSet, basename='review')
router.register(r'orders', views.OrderViewSet, basename='order')

urlpatterns = [
    # Аутентификация
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', views.TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/balance/', views.check_balance, name='balance'),
    path('api/admin/users/', views.AdminUsersView.as_view(), name='admin-users'),
    path('api/admin/users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('api/admin/purchase-requests/', views.PurchaseRequestView.as_view(), name='purchase-requests'),
    path('api/admin/purchase-requests/<int:pk>/', views.PurchaseRequestView.as_view(), name='purchase-request-detail'),
    path('api/admin/payments/', views.PaymentsView.as_view(), name='payments'),
    path('auth/account-info/', views.account_info, name='account_info'),
    path('auth/update-account/', views.UpdateAccountView.as_view(), name='update_account'),
    path('auth/check-exists/', views.check_account_exists, name='check_exists'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('auth/password-reset/', views.PasswordResetRequestView.as_view(), name='password_reset'),
    path('auth/password-reset-confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/profile/', views.UserProfileView.as_view(), name='profile'),  # Обновленный профиль
    path('api/chef/inventory/', views.InventoryView.as_view(), name='inventory'),
    path('api/chef/inventory/<int:pk>/', views.InventoryView.as_view(), name='inventory-detail'),
    
    # Другие эндпоинты
    path('stats/', views.stats, name='stats'),
    path('categories/', views.categories, name='categories'),
    path('menu-stats/', views.menu_stats, name='menu_stats'),
    path('health/', views.health_check, name='health'),
    path('system-info/', views.system_info, name='system_info'),
    
    # ViewSets
    path('', include(router.urls)),
]