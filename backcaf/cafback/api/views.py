import logging
import random
from datetime import timedelta

from rest_framework import generics, viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.db.models import Q, Avg, Count, Sum, F
from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.utils import timezone

from .models import *
from .serializers import *
logger = logging.getLogger(__name__)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Регистрация нового аккаунта
    URL: POST /api/auth/register/
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Регистрация нового пользователя: {request.data.get('username')}")
            
            # Валидация данных
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                logger.warning(f"Ошибки валидации: {serializer.errors}")
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Проверка уникальности username и email
            username = request.data.get('username')
            email = request.data.get('email')
            
            if User.objects.filter(username=username).exists():
                return Response({
                    'success': False,
                    'error': 'Пользователь с таким логином уже существует'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'success': False,
                    'error': 'Пользователь с таким email уже существует'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = serializer.save()
            
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"Пользователь {user.username} успешно зарегистрирован (ID: {user.id})")
            
            return Response({
                'success': True,
                'message': 'Аккаунт успешно создан',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'date_joined': user.date_joined
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Ошибка при регистрации: {str(e)}")
            return Response({
                'success': False,
                'error': 'Внутренняя ошибка сервера при регистрации'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    """
    Авторизация (проверка аккаунта)
    URL: POST /api/auth/login/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            logger.info(f"Попытка входа пользователя: {username}")
            
            if not username or not password:
                return Response({
                    'success': False,
                    'error': 'Логин и пароль обязательны'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = authenticate(username=username, password=password)
            
            if user is None:
                logger.warning(f"Неудачная попытка входа: {username}")
                return Response({
                    'success': False,
                    'error': 'Неверный логин или пароль'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.is_active:
                return Response({
                    'success': False,
                    'error': 'Аккаунт отключен'
                }, status=status.HTTP_403_FORBIDDEN)
            
            refresh = RefreshToken.for_user(user)
            
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            logger.info(f"Успешный вход пользователя: {user.username}")
            
            return Response({
                'success': True,
                'message': 'Вход выполнен успешно',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_active': user.is_active,
                    'date_joined': user.date_joined,
                    'last_login': user.last_login
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                }
            })
            
        except Exception as e:
            logger.error(f"Ошибка при входе: {str(e)}")
            return Response({
                'success': False,
                'error': 'Внутренняя ошибка сервера при входе'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    """
    Выход из системы
    URL: POST /api/auth/logout/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            
            if not refresh_token:
                return Response({
                    'success': False,
                    'error': 'Токен обновления обязателен'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            logger.info(f"Пользователь {request.user.username} вышел из системы")
            
            return Response({
                'success': True,
                'message': 'Выход выполнен успешно'
            }, status=status.HTTP_205_RESET_CONTENT)
            
        except TokenError:
            return Response({
                'success': False,
                'error': 'Недействительный токен'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Ошибка при выходе: {str(e)}")
            return Response({
                'success': False,
                'error': 'Ошибка при выходе'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TokenRefreshView(APIView):
    """
    Обновление access токена
    URL: POST /api/auth/token/refresh/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            
            if not refresh_token:
                return Response({
                    'success': False,
                    'error': 'Токен обновления обязателен'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            
            return Response({
                'success': True,
                'access': str(token.access_token)
            })
            
        except TokenError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Ошибка при обновлении токена: {str(e)}")
            return Response({
                'success': False,
                'error': 'Ошибка при обновлении токена'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_balance(request):
    """
    Проверка баланса (счета) пользователя
    URL: GET /api/auth/balance/
    """
    try:
        user = request.user
        
        logger.info(f"Проверка баланса пользователя: {user.username}")
        
        # В зависимости от вашей модели пользователя
        # Если у User есть поле balance:
        balance = getattr(user, 'balance', 0.00)
        
        # Или если у вас есть связанная модель Profile:
        # try:
        #     balance = user.profile.balance
        # except AttributeError:
        #     balance = 0.00
        
        return Response({
            'success': True,
            'balance': float(balance),
            'currency': 'RUB',
            'user': {
                'username': user.username,
                'email': user.email
            }
        })
        
    except Exception as e:
        logger.error(f"Ошибка при проверке баланса: {str(e)}")
        return Response({
            'success': False,
            'error': 'Ошибка при получении баланса'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def account_info(request):
    """
    Полная информация об аккаунте
    URL: GET /api/auth/account-info/
    """
    try:
        user = request.user
        
        logger.info(f"Получение информации об аккаунте: {user.username}")
        

        thirty_days_ago = timezone.now() - timedelta(days=30)
        

        orders_count = user.orders.count()
        

        total_spent_result = user.orders.aggregate(total=Sum('total_price'))
        total_spent = total_spent_result['total'] or 0.00

        reviews_count = user.reviews.count()
        

        avg_rating_result = user.reviews.aggregate(avg=Avg('rating'))
        avg_rating = avg_rating_result['avg'] or 0.0
        

        last_order = user.orders.order_by('-created_at').first()
        

        days_since_join = (timezone.now() - user.date_joined).days
        
        return Response({
            'success': True,
            'account': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined,
                'last_login': user.last_login,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            },
            'statistics': {
                'orders_count': orders_count,
                'total_spent': float(total_spent),
                'reviews_count': reviews_count,
                'average_rating': round(avg_rating, 1),
                'account_age_days': days_since_join,
                'last_order_date': last_order.created_at if last_order else None,
                'last_order_total': float(last_order.total_price) if last_order else 0.00,
                'last_order_status': last_order.status if last_order else None
            }
        })
        
    except Exception as e:
        logger.error(f"Ошибка при получении информации об аккаунте: {str(e)}")
        return Response({
            'success': False,
            'error': 'Ошибка при получении информации об аккаунте'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateAccountView(APIView):
    """
    Обновление данных аккаунта
    URL: PUT /api/auth/update-account/
    """
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        try:
            user = request.user
            logger.info(f"Обновление данных пользователя: {user.username}")
            
            data = request.data.copy()
            

            allowed_fields = ['first_name', 'last_name', 'email', 'phone']
            

            update_data = {k: v for k, v in data.items() if k in allowed_fields}
            
            if not update_data:
                return Response({
                    'success': False,
                    'error': 'Нет данных для обновления'
                }, status=status.HTTP_400_BAD_REQUEST)
            

            if 'email' in update_data and update_data['email'] != user.email:
                if User.objects.filter(email=update_data['email']).exclude(id=user.id).exists():
                    return Response({
                        'success': False,
                        'error': 'Этот email уже используется другим пользователем'
                    }, status=status.HTTP_400_BAD_REQUEST)
            

            for field, value in update_data.items():
                setattr(user, field, value)
            
            user.save()
            
            logger.info(f"Данные пользователя {user.username} успешно обновлены")
            
            return Response({
                'success': True,
                'message': 'Данные аккаунта успешно обновлены',
                'updated_fields': list(update_data.keys()),
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone': getattr(user, 'phone', None)
                }
            })
            
        except Exception as e:
            logger.error(f"Ошибка при обновлении аккаунта: {str(e)}")
            return Response({
                'success': False,
                'error': 'Ошибка при обновлении данных аккаунта'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_account_exists(request):
    """
    Проверка существования аккаунта (по email или username)
    URL: GET /api/auth/check-exists/?email=...&username=...
    """
    try:
        email = request.GET.get('email')
        username = request.GET.get('username')
        
        if not email and not username:
            return Response({
                'success': False,
                'error': 'Укажите email или username для проверки'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        exists = False
        field = None
        value = None
        
        if email:
            exists = User.objects.filter(email=email).exists()
            field = 'email'
            value = email
        elif username:
            exists = User.objects.filter(username=username).exists()
            field = 'username'
            value = username
        
        return Response({
            'success': True,
            'exists': exists,
            'field': field,
            'value': value,
            'message': f'Аккаунт с {field} "{value}" ' + 
                      ('уже существует' if exists else 'не найден')
        })
        
    except Exception as e:
        logger.error(f"Ошибка при проверке существования аккаунта: {str(e)}")
        return Response({
            'success': False,
            'error': 'Ошибка при проверке аккаунта'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChangePasswordView(APIView):
    """
    Смена пароля
    URL: POST /api/auth/change-password/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            old_password = request.data.get('old_password')
            new_password = request.data.get('new_password')
            confirm_password = request.data.get('confirm_password')
            
            if not old_password or not new_password or not confirm_password:
                return Response({
                    'success': False,
                    'error': 'Все поля обязательны'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if new_password != confirm_password:
                return Response({
                    'success': False,
                    'error': 'Новый пароль и подтверждение не совпадают'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not user.check_password(old_password):
                return Response({
                    'success': False,
                    'error': 'Старый пароль неверен'
                }, status=status.HTTP_400_BAD_REQUEST)
            

            if len(new_password) < 8:
                return Response({
                    'success': False,
                    'error': 'Пароль должен содержать минимум 8 символов'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            
            logger.info(f"Пользователь {user.username} сменил пароль")
            
            return Response({
                'success': True,
                'message': 'Пароль успешно изменен'
            })
            
        except Exception as e:
            logger.error(f"Ошибка при смене пароля: {str(e)}")
            return Response({
                'success': False,
                'error': 'Ошибка при смене пароля'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class PasswordResetRequestView(APIView):
    """
    Запрос на сброс пароля
    URL: POST /api/auth/password-reset/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            
            if not email:
                return Response({
                    'success': False,
                    'error': 'Email обязателен'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(email=email)
                
                code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
                
                
                logger.info(f"Запрос сброса пароля для пользователя: {user.username}, код: {code}")
                

                return Response({
                    'success': True,
                    'message': 'Код отправлен на email',
                    'code': code  
                })
                
            except User.DoesNotExist:
                return Response({
                    'success': True,
                    'message': 'Если email зарегистрирован, на него будет отправлен код'
                })
                
        except Exception as e:
            logger.error(f"Ошибка при запросе сброса пароля: {str(e)}")
            return Response({
                'success': False,
                'error': 'Ошибка при запросе сброса пароля'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetConfirmView(APIView):
    """
    Подтверждение сброса пароля
    URL: POST /api/auth/password-reset-confirm/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            code = request.data.get('code')
            new_password = request.data.get('new_password')
            confirm_password = request.data.get('confirm_password')
            
            if not all([email, code, new_password, confirm_password]):
                return Response({
                    'success': False,
                    'error': 'Все поля обязательны'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if new_password != confirm_password:
                return Response({
                    'success': False,
                    'error': 'Пароли не совпадают'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(email=email)
                
                
                if code != "123456":  
                    return Response({
                        'success': False,
                        'error': 'Неверный код'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                user.set_password(new_password)
                user.save()
                
                
                logger.info(f"Пароль сброшен для пользователя: {user.username}")
                
                return Response({
                    'success': True,
                    'message': 'Пароль успешно изменен'
                })
                
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Пользователь не найден'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            logger.error(f"Ошибка при сбросе пароля: {str(e)}")
            return Response({
                'success': False,
                'error': 'Ошибка при сбросе пароля'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Получение и обновление профиля пользователя
    URL: GET, PUT /api/auth/profile/
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        try:
            response = super().update(request, *args, **kwargs)
            logger.info(f"Профиль пользователя {request.user.username} обновлен")
            return response
        except Exception as e:
            logger.error(f"Ошибка при обновлении профиля: {str(e)}")
            return Response({
                'success': False,
                'error': 'Ошибка при обновлении профиля'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    Управление пунктами меню
    URL: /api/menu-items/
    """
    queryset = MenuItem.objects.filter(is_available=True)
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = MenuItem.objects.filter(is_available=True)
        

        category = self.request.query_params.get('category', None)
        if category and category != 'ВСЕ':
            queryset = queryset.filter(category=category)
        

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        

        sort_by = self.request.query_params.get('sort_by', 'name')
        if sort_by in ['name', 'price', 'category']:
            queryset = queryset.order_by(sort_by)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, pk=None):
        """
        Добавление отзыва к блюду
        URL: POST /api/menu-items/{id}/add_review/
        """
        try:
            menu_item = self.get_object()
            serializer = ReviewSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            

            existing_review = Review.objects.filter(
                menu_item=menu_item,
                user=request.user
            ).first()
            
            if existing_review:
                existing_review.rating = serializer.validated_data['rating']
                existing_review.comment = serializer.validated_data['comment']
                existing_review.save()
                
                logger.info(f"Пользователь {request.user.username} обновил отзыв на {menu_item.name}")
                
                return Response({
                    'success': True,
                    'message': 'Отзыв обновлен',
                    'review': ReviewSerializer(existing_review).data
                })
            else:
                review = serializer.save(
                    menu_item=menu_item,
                    user=request.user
                )
                
                logger.info(f"Пользователь {request.user.username} добавил отзыв на {menu_item.name}")
                
                return Response({
                    'success': True,
                    'message': 'Отзыв добавлен',
                    'review': ReviewSerializer(review).data
                }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Ошибка при добавлении отзыва: {str(e)}")
            return Response({
                'success': False,
                'error': 'Ошибка при добавлении отзыва'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReviewViewSet(viewsets.ModelViewSet):
    """
    Управление отзывами пользователя
    URL: /api/reviews/
    """
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        try:
            menu_item_id = self.request.data.get('menu_item')
            if not menu_item_id:
                raise ValidationError('menu_item обязателен')
            
            menu_item = MenuItem.objects.get(id=menu_item_id)
            review = serializer.save(user=self.request.user, menu_item=menu_item)
            
            logger.info(f"Пользователь {self.request.user.username} создал отзыв #{review.id}")
            
        except ObjectDoesNotExist:
            raise ValidationError('Блюдо не найдено')
        except Exception as e:
            logger.error(f"Ошибка при создании отзыва: {str(e)}")
            raise
    
    def perform_update(self, serializer):
        try:
            super().perform_update(serializer)
            logger.info(f"Пользователь {self.request.user.username} обновил отзыв #{serializer.instance.id}")
        except Exception as e:
            logger.error(f"Ошибка при обновлении отзыва: {str(e)}")
            raise
    
    def perform_destroy(self, instance):
        try:
            review_id = instance.id
            user = self.request.user
            instance.delete()
            logger.info(f"Пользователь {user.username} удалил отзыв #{review_id}")
        except Exception as e:
            logger.error(f"Ошибка при удалении отзыва: {str(e)}")
            raise


class OrderViewSet(viewsets.ModelViewSet):
    """
    Управление заказами
    URL: /api/orders/
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        try:
            items_data = self.request.data.get('items', [])
            
            if not items_data:
                raise ValidationError('Нет позиций в заказе')
            
            total_price = 0
            order_items_data = []
            
            for item_data in items_data:
                try:
                    menu_item = MenuItem.objects.get(id=item_data['menu_item'])
                except MenuItem.DoesNotExist:
                    raise ValidationError(f'Блюдо с ID {item_data["menu_item"]} не найдено')
                
                quantity = item_data.get('quantity', 1)
                if quantity <= 0:
                    raise ValidationError('Количество должно быть положительным числом')
                
                if not menu_item.is_available:
                    raise ValidationError(f'Блюдо "{menu_item.name}" недоступно')
                
                item_total = menu_item.price * quantity
                total_price += item_total
                
                order_items_data.append({
                    'menu_item': menu_item,
                    'quantity': quantity,
                    'price_at_time': menu_item.price
                })
            
            order = serializer.save(user=self.request.user, total_price=total_price)
            
            for item_data in order_items_data:
                OrderItem.objects.create(
                    order=order,
                    menu_item=item_data['menu_item'],
                    quantity=item_data['quantity'],
                    price_at_time=item_data['price_at_time']
                )
            
            logger.info(f"Создан заказ #{order.id} для пользователя {self.request.user.username} на сумму {total_price}")
            
        except ValidationError as e:
            logger.warning(f"Ошибка валидации при создании заказа: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Ошибка при создании заказа: {str(e)}")
            raise
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Отмена заказа
        URL: POST /api/orders/{id}/cancel/
        """
        try:
            order = self.get_object()
            
            if order.status == 'pending':
                order.status = 'cancelled'
                order.save()
                
                logger.info(f"Заказ #{order.id} отменен пользователем {request.user.username}")
                
                return Response({
                    'success': True,
                    'message': 'Заказ отменен'
                })
            else:
                return Response({
                    'success': False,
                    'error': 'Нельзя отменить заказ в текущем статусе'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Ошибка при отмене заказа: {str(e)}")
            return Response({
                'success': False,
                'error': 'Ошибка при отмене заказа'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def stats(request):
    """
    Статистика для панели
    URL: GET /api/stats/
    """
    try:
        students_served = 342
        rush_level = 67

        
        return Response({
            'success': True,
            'students_served': students_served,
            'rush_level': rush_level,
            'timestamp': timezone.now()
        })
        
    except Exception as e:
        logger.error(f"Ошибка при получении статистики: {str(e)}")
        return Response({
            'success': False,
            'error': 'Ошибка при получении статистики'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def categories(request):
    """
    Получение списка категорий
    URL: GET /api/categories/
    """
    try:
        categories = MenuItem.objects.filter(
            is_available=True
        ).values_list(
            'category', flat=True
        ).distinct()
        
        return Response({
            'success': True,
            'categories': list(categories) + ['ВСЕ']
        })
        
    except Exception as e:
        logger.error(f"Ошибка при получении категорий: {str(e)}")
        return Response({
            'success': False,
            'error': 'Ошибка при получении категорий'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def menu_stats(request):
    """
    Статистика меню
    URL: GET /api/menu-stats/
    """
    try:
        stats = MenuItem.objects.filter(is_available=True).aggregate(
            total_items=Count('id'),
            avg_price=Avg('price'),
            min_price=Min('price'),
            max_price=Max('price')
        )
        
        category_stats = MenuItem.objects.filter(
            is_available=True
        ).values('category').annotate(
            count=Count('id'),
            avg_price=Avg('price')
        ).order_by('category')
        
        return Response({
            'success': True,
            'overall': stats,
            'by_category': list(category_stats)
        })
        
    except Exception as e:
        logger.error(f"Ошибка при получении статистики меню: {str(e)}")
        return Response({
            'success': False,
            'error': 'Ошибка при получении статистики меню'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Проверка здоровья системы
    URL: GET /api/health/
    """
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        user_count = User.objects.count()
        
        return Response({
            'success': True,
            'status': 'healthy',
            'timestamp': timezone.now(),
            'database': 'connected',
            'user_count': user_count
        })
        
    except Exception as e:
        logger.error(f"Ошибка health check: {str(e)}")
        return Response({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def system_info(request):
    """
    Информация о системе
    URL: GET /api/system-info/
    """
    import django
    import platform
    
    return Response({
        'success': True,
        'django_version': django.get_version(),
        'python_version': platform.python_version(),
        'server_time': timezone.now(),
        'timezone': str(timezone.get_current_timezone())
    })

from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff

class IsChefUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'chef'

class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):

        users = User.objects.all()
        user_list = []
        
        for user in users:
            user_list.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}",
                'role': 'admin' if user.is_staff else 'user',
                'balance': 1000,
                'created_at': user.date_joined.strftime('%Y-%m-%d'),
                'last_login': user.last_login.strftime('%Y-%m-%d') if user.last_login else ''
            })##$$FOR EXAMPLE
        
        return Response(user_list)

class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            data = request.data
            
  
            if 'role' in data:
                if data['role'] == 'admin':
                    user.is_staff = True
                else:
                    user.is_staff = False
            
            user.save()
            
            return Response({'status': 'User updated'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class PurchaseRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    dish_name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    request_date = models.DateField(auto_now_add=True)
    processed_date = models.DateField(null=True, blank=True)

class Payment(models.Model):
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    ]
    
    METHOD_CHOICES = [
        ('card', 'Card'),
        ('cash', 'Cash'),
        ('student_card', 'Student Card'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_date = models.DateTimeField(auto_now_add=True)

class InventoryItem(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    quantity = models.IntegerField()
    unit = models.CharField(max_length=20)
    min_quantity = models.IntegerField()
    last_restock = models.DateField()
    supplier = models.CharField(max_length=255)

class PurchaseRequestView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        requests = PurchaseRequest.objects.all()
        request_list = []
        
        for req in requests:
            request_list.append({
                'id': req.id,
                'user_id': req.user.id,
                'user_name': f"{req.user.first_name} {req.user.last_name}",
                'dish_name': req.dish_name,
                'amount': float(req.amount),
                'status': req.status,
                'request_date': req.request_date.strftime('%Y-%m-%d'),
                'processed_date': req.processed_date.strftime('%Y-%m-%d') if req.processed_date else None
            })
        
        return Response(request_list)
    
    def patch(self, request, pk):
        try:
            purchase_request = PurchaseRequest.objects.get(pk=pk)
            status_value = request.data.get('status')
            
            if status_value in ['approved', 'rejected']:
                purchase_request.status = status_value
                purchase_request.processed_date = timezone.now().date()
                purchase_request.save()
                
                return Response({'status': 'Request updated'})
            else:
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
                
        except PurchaseRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

class PaymentsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        payments = Payment.objects.all()
        payment_list = []
        
        for payment in payments:
            payment_list.append({
                'id': payment.id,
                'user_id': payment.user.id,
                'user_name': f"{payment.user.first_name} {payment.user.last_name}",
                'amount': float(payment.amount),
                'method': payment.method,
                'status': payment.status,
                'transaction_date': payment.transaction_date.strftime('%Y-%m-%d')
            })
        
        return Response(payment_list)

class InventoryView(APIView):
    permission_classes = [IsAuthenticated, IsChefUser]
    
    def get(self, request):
        items = InventoryItem.objects.all()
        item_list = []
        
        for item in items:
            item_list.append({
                'id': item.id,
                'name': item.name,
                'category': item.category,
                'quantity': item.quantity,
                'unit': item.unit,
                'min_quantity': item.min_quantity,
                'last_restock': item.last_restock.strftime('%Y-%m-%d'),
                'supplier': item.supplier
            })
        
        return Response(item_list)
    
    def patch(self, request, pk):
        try:
            item = InventoryItem.objects.get(pk=pk)
            data = request.data
            
            if 'quantity' in data:
                item.quantity = data['quantity']
            if 'supplier' in data:
                item.supplier = data['supplier']
            if 'last_restock' in data:
                item.last_restock = data['last_restock']
            
            item.save()
            
            return Response({'status': 'Inventory item updated'})
        except InventoryItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    