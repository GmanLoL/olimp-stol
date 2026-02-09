# api/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError('Username обязателен')
        
        email = self.normalize_email(email) if email else None
        user = self.model(username=username, email=email, **extra_fields)
        
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """Модель для таблицы users с вашей структурой"""
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True, db_index=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, default='student')
    full_name = models.CharField(max_length=100, blank=True, null=True)
    class_field = models.CharField(max_length=50, blank=True, null=True, db_column='class')  # 'class' - зарезервированное слово
    allergies = models.TextField(blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    
    # Django auth поля (их может не быть в вашей таблице, но нужны для Django)
    # Если этих полей нет в таблице, Django создаст их при миграции
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)
    
    # Для совместимости с остальным кодом
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['email']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'user'
        verbose_name_plural = 'users'
    
    def __str__(self):
        return self.username
    
    def get_full_name(self):
        return self.full_name or f"{self.first_name or ''} {self.last_name or ''}".strip()
    
    def get_short_name(self):
        return self.username
    
    # Свойства для совместимости с существующим кодом
    @property
    def student_id(self):
        return self.username
    
    @property
    def phone(self):
        return None
    
    @property
    def balance(self):
        return 0.00


class MenuItem(models.Model):
    """Модель для таблицы dishes"""
    CATEGORY_CHOICES = [
        ('Завтрак', 'Завтрак'),
        ('Обед', 'Обед'),
        ('Ужин', 'Ужин'),
        ('Напитки', 'Напитки'),
    ]
    
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    spicy = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dishes'  # Ваша существующая таблица
    
    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews:
            return sum([review.rating for review in reviews]) / len(reviews)
        return 0
    
    def __str__(self):
        return self.name
class NutritionInfo(models.Model):
    menu_item = models.OneToOneField(MenuItem, on_delete=models.CASCADE, related_name='nutrition')
    protein = models.CharField(max_length=50)
    fats = models.CharField(max_length=50)
    carbs = models.CharField(max_length=50)
    calories = models.IntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'nutrition_info'  # Если таблица есть
    
    def __str__(self):
        return f"Nutrition for {self.menu_item.name}"

class Ingredient(models.Model):
    nutrition = models.ForeignKey(NutritionInfo, on_delete=models.CASCADE, related_name='ingredients')
    name = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'ingredients'  # Если таблица есть
    
    def __str__(self):
        return self.name

class Allergen(models.Model):
    nutrition = models.ForeignKey(NutritionInfo, on_delete=models.CASCADE, related_name='allergens')
    name = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'allergens'  # Если таблица есть
    
    def __str__(self):
        return self.name

class Review(models.Model):
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'  # Ваша существующая таблица
        unique_together = ['menu_item', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {self.menu_item.name}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'В ожидании'),
        ('preparing', 'Готовится'),
        ('ready', 'Готово'),
        ('completed', 'Завершено'),
        ('cancelled', 'Отменено'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'  # Если таблица есть
    
    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'order_items'  # Если таблица есть
    
    def __str__(self):
        return f"{self.menu_item.name} x{self.quantity}"