import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate } from 'react-router-dom'

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: string;
  category: string;
  spicy?: boolean;
  nutrition: {
    protein: string;
    fats: string;
    carbs: string;
    ingredients: string[];
    allergens: string[];
  };
  reviews: Review[];
  averageRating: number;
}

// Интерфейс для профиля пользователя
interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  balance: number;
  auto_purchase_enabled: boolean;
  allergies: string[];
  created_at: string;
}

// Список возможных аллергенов
const ALL_ALLERGENS = [
  "глютен",
  "яйцо",
  "молочная продукция",
  "рыба",
  "арахис",
  "орехи",
  "соя",
  "горчица",
  "сельдерей",
  "кунжут",
  "моллюски",
  "ракообразные",
  "люпин",
  "сульфиты"
];

const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Омлет с сыром",
    price: "150р",
    category: "Завтрак",
    nutrition: {
      protein: "12.7г",
      fats: "15.3г",
      carbs: "2.4г",
      ingredients: [
        "яйца",
        "молоко",
        "сыр",
        "масло сливочное",
        "соль",
      ],
      allergens: ["яйцо", "молочная продукция"],
    },
    reviews: [
      {
        id: "1",
        author: "Иван",
        rating: 4,
        comment: "Вкусный омлет, хорошая порция!",
        date: "04.02.2026",
      },
      {
        id: "2",
        author: "Мария",
        rating: 5,
        comment: "Отличный завтрак!",
        date: "03.02.2026",
      },
      {
        id: "3",
        author: "Алекс",
        rating: 3,
        comment: "Немного пересушен",
        date: "02.02.2026",
      },
    ],
    averageRating: 4.0,
  },
  {
    id: "2",
    name: "Каша овсяная",
    price: "90р",
    category: "Завтрак",
    nutrition: {
      protein: "3.2г",
      fats: "4.1г",
      carbs: "27.3г",
      ingredients: [
        "овсяные хлопья",
        "молоко",
        "сахар",
        "масло сливочное",
      ],
      allergens: ["молочная продукция"],
    },
    reviews: [
      {
        id: "4",
        author: "Петр",
        rating: 5,
        comment: "Как у бабушки!",
        date: "04.02.2026",
      },
      {
        id: "5",
        author: "Елена",
        rating: 4,
        comment: "Вкусно и полезно",
        date: "03.02.2026",
      },
    ],
    averageRating: 4.5,
  },
  {
    id: "3",
    name: "Сырники со сметаной",
    price: "140р",
    category: "Завтрак",
    nutrition: {
      protein: "11.2г",
      fats: "8.6г",
      carbs: "32.1г",
      ingredients: [
        "творог",
        "яйцо",
        "мука",
        "сахар",
        "сметана",
      ],
      allergens: ["глютен", "яйцо", "молочная продукция"],
    },
    reviews: [
      {
        id: "6",
        author: "Ольга",
        rating: 5,
        comment: "Самые вкусные сырники!",
        date: "04.02.2026",
      },
      {
        id: "7",
        author: "Дмитрий",
        rating: 5,
        comment: "Обожаю!",
        date: "02.02.2026",
      },
    ],
    averageRating: 5.0,
  },
  {
    id: "4",
    name: "Борщ с мясом",
    price: "180р",
    category: "Обед",
    nutrition: {
      protein: "8.3г",
      fats: "9.5г",
      carbs: "15.6г",
      ingredients: [
        "свёкла",
        "говядина",
        "капуста",
        "морковь",
        "картофель",
        "лук",
        "томатная паста",
      ],
      allergens: [],
    },
    reviews: [
      {
        id: "8",
        author: "Сергей",
        rating: 5,
        comment: "Настоящий борщ!",
        date: "04.02.2026",
      },
      {
        id: "9",
        author: "Наталья",
        rating: 4,
        comment: "Очень вкусный!",
        date: "03.02.2026",
      },
      {
        id: "10",
        author: "Андрей",
        rating: 5,
        comment: "Лучший в городе!",
        date: "01.02.2026",
      },
    ],
    averageRating: 4.7,
  },
  {
    id: "5",
    name: "Котлеты куриные",
    price: "160р",
    category: "Обед",
    nutrition: {
      protein: "18.2г",
      fats: "14.3г",
      carbs: "8.6г",
      ingredients: [
        "куриный фарш",
        "хлеб",
        "яйцо",
        "лук",
        "специи",
      ],
      allergens: ["глютен", "яйцо"],
    },
    reviews: [
      {
        id: "11",
        author: "Виктор",
        rating: 4,
        comment: "Сочные и вкусные!",
        date: "04.02.2026",
      },
      {
        id: "12",
        author: "Светлана",
        rating: 5,
        comment: "Отличные котлеты!",
        date: "03.02.2026",
      },
    ],
    averageRating: 4.5,
  },
  {
    id: "6",
    name: "Рыба запеченая",
    price: "220р",
    category: "Обед",
    nutrition: {
      protein: "22.5г",
      fats: "7.3г",
      carbs: "2.1г",
      ingredients: [
        "филе рыбы",
        "лимон",
        "специи",
        "масло оливковое",
      ],
      allergens: ["рыба"],
    },
    reviews: [
      {
        id: "13",
        author: "Михаил",
        rating: 4,
        comment: "Свежая рыба!",
        date: "04.02.2026",
      },
      {
        id: "14",
        author: "Юлия",
        rating: 5,
        comment: "Очень вкусно!",
        date: "02.02.2026",
      },
    ],
    averageRating: 4.5,
  },
  {
    id: "7",
    name: "Пельмени",
    price: "130р",
    category: "Обед",
    nutrition: {
      protein: "14.1г",
      fats: "8.7г",
      carbs: "28.4г",
      ingredients: ["мясной фарш", "тесто", "лук", "специи"],
      allergens: ["глютен"],
    },
    reviews: [
      {
        id: "15",
        author: "Игорь",
        rating: 5,
        comment: "Домашние, как надо!",
        date: "04.02.2026",
      },
      {
        id: "16",
        author: "Анна",
        rating: 4,
        comment: "Вкусные пельмени!",
        date: "03.02.2026",
      },
    ],
    averageRating: 4.5,
  },
  {
    id: "8",
    name: "Винегрет",
    price: "80р",
    category: "Ужин",
    nutrition: {
      protein: "2.1г",
      fats: "4.2г",
      carbs: "12.7г",
      ingredients: [
        "картофель",
        "свёкла",
        "морковь",
        "огурцы",
        "капуста",
        "масло",
      ],
      allergens: [],
    },
    reviews: [
      {
        id: "17",
        author: "Денис",
        rating: 4,
        comment: "Свежий салат!",
        date: "04.02.2026",
      },
      {
        id: "18",
        author: "Марина",
        rating: 5,
        comment: "Отличный!",
        date: "02.02.2026",
      },
    ],
    averageRating: 4.5,
  },
  {
    id: "9",
    name: "Куриный суп",
    price: "120р",
    category: "Ужин",
    nutrition: {
      protein: "8.1г",
      fats: "3.2г",
      carbs: "18.7г",
      ingredients: [
        "курица",
        "картофель",
        "морковь",
        "лук",
        "вермишель",
      ],
      allergens: ["глютен"],
    },
    reviews: [
      {
        id: "19",
        author: "Александр",
        rating: 5,
        comment: "Легкий и вкусный!",
        date: "04.02.2026",
      },
      {
        id: "20",
        author: "Оксана",
        rating: 4,
        comment: "Хороший суп!",
        date: "03.02.2026",
      },
    ],
    averageRating: 4.5,
  },
  {
    id: "10",
    name: "Гречка с грибами",
    price: "110р",
    category: "Ужин",
    nutrition: {
      protein: "5.4г",
      fats: "4.3г",
      carbs: "32.2г",
      ingredients: [
        "гречка",
        "грибы",
        "лук",
        "морковь",
        "масло",
      ],
      allergens: [],
    },
    reviews: [
      {
        id: "21",
        author: "Татьяна",
        rating: 5,
        comment: "Вкусно и сытно!",
        date: "04.02.2026",
      },
      {
        id: "22",
        author: "Владимир",
        rating: 4,
        comment: "Отличная гречка!",
        date: "01.02.2026",
      },
    ],
    averageRating: 4.5,
  },
  {
    id: "11",
    name: "Компот",
    price: "50р",
    category: "Напитки",
    nutrition: {
      protein: "0.2г",
      fats: "0г",
      carbs: "12.5г",
      ingredients: ["сухофрукты", "сахар", "вода"],
      allergens: [],
    },
    reviews: [
      {
        id: "23",
        author: "Роман",
        rating: 5,
        comment: "Освежающий!",
        date: "04.02.2026",
      },
    ],
    averageRating: 5.0,
  },
  {
    id: "12",
    name: "Чай",
    price: "30р",
    category: "Напитки",
    nutrition: {
      protein: "0г",
      fats: "0г",
      carbs: "0г",
      ingredients: ["чайный лист", "вода"],
      allergens: [],
    },
    reviews: [
      {
        id: "24",
        author: "Ирина",
        rating: 4,
        comment: "Крепкий чай!",
        date: "04.02.2026",
      },
    ],
    averageRating: 4.0,
  },
];

export default function App() {
  const navigate = useNavigate();
  // Состояние входа пользователя
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Проверка при загрузке, есть ли сохраненный вход
  useEffect(() => {
    const savedLogin = localStorage.getItem("isLoggedIn");
    const savedName = localStorage.getItem("userName");
    const savedToken = localStorage.getItem("userToken");
    
    if (savedLogin === "true" && savedName && savedToken) {
      setIsLoggedIn(true);
      setUserName(savedName);
      // Загружаем профиль пользователя
      fetchUserProfile(savedToken);
    }
  }, []);

  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Состояния для формы входа
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Состояния для формы регистрации
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  
  // Состояния для сброса пароля
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  
  // Состояния для профиля
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [autoPurchase, setAutoPurchase] = useState(false);
  const [balance, setBalance] = useState(0);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ВСЕ");
  const [rushLevel, setRushLevel] = useState(67);
  const [studentsServed, setStudentsServed] = useState(342);
  const [glitchElements, setGlitchElements] = useState<number[]>([]);
  const [showMailPopup, setShowMailPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [showZablPopup, setShowZablPopup] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showNewAccPopup, setShowNewAccPopup] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки профиля: ${response.status}`);
      }

      const data = await response.json();
      setUserProfile(data);
      setSelectedAllergies(data.allergies || []);
      setAutoPurchase(data.auto_purchase_enabled || false);
      setBalance(data.balance || 0);
    } catch (error) {
      console.error("Ошибка при загрузке профиля:", error);
    }
  };

  // Функция для сохранения профиля пользователя
  const saveUserProfile = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const profileData = {
        allergies: selectedAllergies,
        auto_purchase_enabled: autoPurchase,
        balance: balance
      };

      const response = await fetch(`${API_BASE_URL}/user/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`Ошибка сохранения профиля: ${response.status}`);
      }

      const data = await response.json();
      setUserProfile(data);
      setProfileSuccess(true);
      
      // Автоматически скрываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setProfileSuccess(false);
      }, 3000);
      
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Неизвестная ошибка");
      console.error("Ошибка при сохранении профиля:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Функция для входа
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const loginData = {
        username: loginUsername,
        password: loginPassword,
      };

      console.log("Отправка данных для входа:", loginData);
      
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setSuccess(true);
      console.log("Успешный вход:", data);
      
      // Сохраняем данные входа в localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", loginUsername);
      if (data.access) {
    localStorage.setItem("userToken", data.access);
      } else if (data.access_token) {
    localStorage.setItem("userToken", data.access_token);
      } else if (data.token) {
    localStorage.setItem("userToken", data.token);
      } else {
    console.error("No token found in response:", data);
    return;
    }
if (data.access) {
  localStorage.setItem("userToken", data.access);
  localStorage.setItem("access_token", data.access);
  if (data.refresh) {
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("refresh_token", data.refresh);
  }
} else if (data.access_token) {
  localStorage.setItem("userToken", data.access_token);
  localStorage.setItem("access", data.access_token);
  if (data.refresh_token) {
    localStorage.setItem("refreshToken", data.refresh_token);
    localStorage.setItem("refresh", data.refresh_token);
  }
}
      // Загружаем профиль пользователя
      await fetchUserProfile(data.access_token || data.token || "demo-token");
      
      // Обновляем состояние
      setIsLoggedIn(true);
      setUserName(loginUsername);
      
      setShowLoginPopup(false);
      
      // Сброс формы
      setLoginUsername("");
      setLoginPassword("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Неизвестная ошибка");
      console.error("Ошибка при входе:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для выхода
  const handleLogout = () => {
    // Удаляем данные из localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userToken");
    
    // Обновляем состояние
    setIsLoggedIn(false);
    setUserName("");
    setUserProfile(null);
    setSelectedAllergies([]);
    setAutoPurchase(false);
    setBalance(0);
    
    triggerGlitch();
  };

  // Функция для открытия профиля
  const handleProfileClick = () => {
    const token = localStorage.getItem("userToken");
    if (token) {
      fetchUserProfile(token);
    }
    setShowProfilePopup(true);
    triggerGlitch();
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRegisterError(null);
    setRegisterSuccess(false);

    // Валидация пароля
    if (registerPassword.length < 6) {
      setRegisterError("Пароль должен содержать минимум 6 символов");
      setIsLoading(false);
      return;
    }

    try {
      const formData = {
        name: registerName,
        email: registerEmail,
        username: registerUsername,
        password: registerPassword,
      };

      console.log("Отправка данных для регистрации:", formData);
      
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Обработка ошибок от сервера
        throw new Error(data.message || data.detail || `Ошибка: ${response.status} ${response.statusText}`);
      }

      // Успешная регистрация
      console.log("Успешная регистрация:", data);
      setRegisterSuccess(true);
      
      // Закрываем попап регистрации и открываем попап успеха
      setTimeout(() => {
        setShowRegisterPopup(false);
        setShowNewAccPopup(true);
      }, 1000);
      
      // Сброс формы
      setRegisterName("");
      setRegisterEmail("");
      setRegisterUsername("");
      setRegisterPassword("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
      setRegisterError(errorMessage);
      console.error("Ошибка при регистрации:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const CheckTwoPass = (pass1: string, pass2: string) => {
    return pass1 === pass2;
  };

  const SwitchToPassword = () => {
    setShowMailPopup(false);
    setShowPasswordPopup(true);
  };

  const SwitchToZabl = () => {
    setShowLoginPopup(false);
    setShowZablPopup(true);
  };

  const SwitchToEmail = () => {
    setShowZablPopup(false);
    setShowMailPopup(true);
  };

  const categories = ["ВСЕ", "Завтрак", "Обед", "Ужин"];

  // Обработчик для сброса пароля (шаг 1 - email)
  const handleResetEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const resetData = { email: resetEmail };
      console.log("Запрос сброса пароля для email:", resetEmail);
      
      // Здесь будет реальный запрос к API
      const response = await fetch(`${API_BASE_URL}/auth/reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetData),
      });
      
      if (response.ok) {
        SwitchToEmail();
      }
    } catch (error) {
      console.error("Ошибка при запросе сброса пароля:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик для сброса пароля (шаг 2 - код)
  const handleResetCodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Проверка кода
    console.log("Проверка кода:", resetCode);
    
    // Если код верный
    SwitchToPassword();
  };

  // Обработчик для сброса пароля (шаг 3 - новый пароль)
  const handleNewPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!CheckTwoPass(newPassword, repeatPassword)) {
      alert("Пароли не совпадают!");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const passwordData = {
        email: resetEmail,
        code: resetCode,
        newPassword: newPassword,
      };
      
      console.log("Установка нового пароля:", passwordData);
      
      // Здесь будет реальный запрос к API
      const response = await fetch(`${API_BASE_URL}/auth/password-update/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });
      
      if (response.ok) {
        setShowPasswordPopup(false);
        alert("Пароль успешно изменен!");
        
        // Сброс всех полей сброса пароля
        setResetEmail("");
        setResetCode("");
        setNewPassword("");
        setRepeatPassword("");
      }
    } catch (error) {
      console.error("Ошибка при смене пароля:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems =
    selectedCategory === "ВСЕ"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const SwithParametrButton = () => {
    setShowLoginPopup(false);
    setShowRegisterPopup(true);
    setRegisterError(null);
  };

  const triggerGlitch = () => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 200);
  };

  // Обработчик изменения выбора аллергии
  const handleAllergyChange = (allergy: string) => {
    setSelectedAllergies(prev => {
      if (prev.includes(allergy)) {
        return prev.filter(a => a !== allergy);
      } else {
        return [...prev, allergy];
      }
    });
  };

  // Simulate fluctuating rush level
  useEffect(() => {
    const interval = setInterval(() => {
      setRushLevel((prev) =>
        Math.max(
          30,
          Math.min(95, prev + (Math.random() - 0.5) * 10),
        ),
      );
      setStudentsServed(
        (prev) => prev + Math.floor(Math.random() * 3),
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Random glitch effect with big cooldown
  useEffect(() => {
    const triggerRandomGlitch = () => {
      // Pick 2-4 random elements to glitch
      const numGlitches = Math.floor(Math.random() * 3) + 2;
      const glitched = Array.from({ length: numGlitches }, () =>
        Math.floor(Math.random() * 100),
      );
      setGlitchElements(glitched);

      setTimeout(() => {
        setGlitchElements([]);
      }, 150);
    };

    // Trigger glitch every 8-15 seconds
    const scheduleNextGlitch = () => {
      const delay = 8000 + Math.random() * 7000;
      return setTimeout(triggerRandomGlitch, delay);
    };

    let timeout = scheduleNextGlitch();

    return () => clearTimeout(timeout);
  }, [glitchElements]);

  return (
    <div className="size-full min-h-screen bg-black text-white overflow-x-hidden">
      {/* Scanline effect */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff00 2px, #00ff00 4px)",
        }}
      />

      {/* Shimmer overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,0,0,0.1) 25%, rgba(0,255,0,0.1) 50%, rgba(255,0,0,0.1) 75%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 3s linear infinite",
        }}
      />

      <style>{`
        @keyframes glow {
          0%, 100% { 
            text-shadow: 0 0 8px currentColor, 0 0 15px currentColor, 0 0 25px currentColor; 
          }
          50% { 
            text-shadow: 0 0 12px currentColor, 0 0 25px currentColor, 0 0 40px currentColor, 0 0 60px currentColor; 
          }
        }
        @keyframes nixie-glow {
          0%, 100% { 
            filter: brightness(1) drop-shadow(0 0 8px currentColor);
          }
          50% { 
            filter: brightness(1.3) drop-shadow(0 0 15px currentColor) drop-shadow(0 0 25px currentColor);
          }
        }
        .glitch-element {
          animation: glitch 0.15s steps(2, end);
        }
        @keyframes glitch {
          0% {
            transform: translate(0);
            filter: hue-rotate(0deg);
          }
          20% {
            transform: translate(-3px, 2px);
            filter: hue-rotate(90deg);
          }
          40% {
            transform: translate(3px, -2px);
            filter: hue-rotate(180deg);
          }
          60% {
            transform: translate(-2px, -3px);
            filter: hue-rotate(270deg);
          }
          80% {
            transform: translate(2px, 3px);
            filter: hue-rotate(360deg);
          }
          100% {
            transform: translate(0);
            filter: hue-rotate(0deg);
          }
        }
      `}</style>

      {/* Header */}
      <header className="relative border-b-4 border-red-600 p-6 bg-black">
        <div
          className={`max-w-7xl mx-auto ${glitchActive ? "animate-pulse" : ""}`}
        >
          <div className="flex justify-between items-start mb-4">
            <h1
              className="text-6xl md:text-8xl tracking-tighter relative shimmer-text"
              style={{
                fontFamily: 'Impact, "Arial Black", sans-serif',
                textShadow:
                  "3px 3px 0px #ff0000, 6px 6px 0px #00ff00",
                transform: "skew(-5deg)",
              }}
              onMouseEnter={triggerGlitch}
            >
              <span className="text-white">СТОЛОВАЯ</span>
              <span className="text-red-600">//</span>
              <span className="text-green-500">ЕДА</span>
            </h1>

            {/* Account Button - изменено в зависимости от состояния входа */}
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleProfileClick}
                  className="border-2 border-green-500 bg-black text-green-500 px-6 py-3 hover:border-red-600 hover:text-red-600 transition-all relative overflow-hidden group"
                  style={{
                    clipPath: "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)",
                    fontFamily: "monospace",
                  }}
                >
                  <span className="relative z-10 tracking-wider text-sm">
                    [{userName.toUpperCase()}]
                  </span>
                  <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
                <button
                  onClick={handleLogout}
                  className="border-2 border-red-600 bg-black text-red-600 px-6 py-3 hover:bg-red-600 hover:text-black transition-all relative overflow-hidden group"
                  style={{
                    clipPath: "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)",
                    fontFamily: "monospace",
                  }}
                >
                  <span className="relative z-10 tracking-wider text-sm">
                    [ВЫХОД]
                  </span>
                  <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
              </div>
            ) : (
              
              <button
                onClick={() => {
                  setShowLoginPopup(true);
                  triggerGlitch();
                }}
                className="border-2 border-green-500 bg-black text-green-500 px-6 py-3 hover:bg-red-600 hover:border-red-600 hover:text-black transition-all relative overflow-hidden group"
                style={{
                  clipPath: "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)",
                  fontFamily: "monospace",
                }}
              >
                <span className="relative z-10 tracking-wider text-sm">
                  [АККАУНТ]
                </span>
                <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>
            )}
<button
  onClick={() => navigate('/admin')}
  className="border-2 border-yellow-500 bg-black text-yellow-500 px-6 py-3 hover:border-blue-500 hover:text-blue-500 transition-all relative overflow-hidden group ml-4"
  style={{
    clipPath: "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)",
    fontFamily: "monospace",
  }}
>
  <span className="relative z-10 tracking-wider text-sm">
    [ТЕСТ_АДМИН]
  </span>
  <div className="absolute inset-0 bg-yellow-500 opacity-0 group-hover:opacity-20 transition-opacity" />
</button>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="px-3 py-1 bg-red-600 text-black transform -skew-x-12">
              <span className="block transform skew-x-12 text-sm">
                ОТКРЫТО 11:00-15:00
              </span>
            </div>
            <div className="px-3 py-1 bg-green-500 text-black transform skew-x-12">
              <span className="block transform -skew-x-12 text-sm">
                ПН-ПТ
              </span>
            </div>
            <div className="text-red-600 text-2xl animate-pulse">
              ◆
            </div>
            <div className="text-green-500 text-sm">
              НАЛИЧНЫЕ//КАРТА//СТУД_БИЛЕТ
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Gas Discharge Indicator Panel */}
        <section className="mb-12">
          <div
            className="border-4 border-green-500 bg-black p-6 relative"
            style={{
              boxShadow:
                "inset 0 0 20px rgba(0,255,0,0.2), 0 0 20px rgba(0,255,0,0.3)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Students Served Counter */}
              <div>
                <div
                  className="text-green-500 text-xs mb-3 tracking-widest"
                  style={{ fontFamily: "monospace" }}
                >
                  [ОБСЛУЖЕНО_СЕГОДНЯ]
                </div>
                <div className="flex gap-3 items-center justify-center">
                  {studentsServed
                    .toString()
                    .padStart(4, "0")
                    .split("")
                    .map((digit, i) => (
                      <div
                        key={i}
                        className="relative bg-gradient-to-b from-zinc-950 to-black rounded-sm overflow-hidden"
                        style={{
                          width: "70px",
                          height: "100px",
                          boxShadow:
                            "inset 0 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(255,0,0,0.4)",
                        }}
                      >
                        {/* Glass reflection effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-20" />

                        {/* Nixie tube glow background */}
                        <div
                          className="absolute inset-0 opacity-30"
                          style={{
                            background:
                              "radial-gradient(ellipse at center, rgba(255,0,0,0.6) 0%, transparent 70%)",
                          }}
                        />

                        {/* The digit itself */}
                        <div
                          className="absolute inset-0 flex items-center justify-center text-6xl"
                          style={{
                            fontFamily:
                              '"Courier New", monospace',
                            color: "#ff3300",
                            textShadow: `
                            0 0 10px #ff0000,
                            0 0 20px #ff0000,
                            0 0 30px #ff0000,
                            0 0 40px #ff3300,
                            0 0 70px #ff3300,
                            0 0 80px #ff3300
                          `,
                            fontWeight: "bold",
                            animation:
                              "nixie-glow 2s ease-in-out infinite",
                            animationDelay: `${i * 0.15}s`,
                          }}
                        >
                          {digit}
                        </div>

                        {/* Pulsing glow overlay */}
                        <div
                          className="absolute inset-0 animate-pulse"
                          style={{
                            background:
                              "radial-gradient(ellipse at center, rgba(255,50,0,0.2) 0%, transparent 60%)",
                            animationDuration: "2s",
                            animationDelay: `${i * 0.15}s`,
                          }}
                        />

                        {/* Tube segments/cathodes */}
                        <div className="absolute inset-0 pointer-events-none opacity-10">
                          <div className="absolute top-2 left-2 right-2 h-px bg-red-600" />
                          <div className="absolute bottom-2 left-2 right-2 h-px bg-red-600" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Rush Level Meter */}
              <div>
                <div
                  className="text-green-500 text-xs mb-3 tracking-widest"
                  style={{ fontFamily: "monospace" }}
                >
                  [УРОВЕНЬ_НАГРУЗКИ]
                </div>
                <div className="relative">
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const isActive =
                        (i / 20) * 100 < rushLevel;
                      const isHigh = i >= 15;
                      const isMedium = i >= 10 && i < 15;
                      return (
                        <div
                          key={i}
                          className={`flex-1 h-12 border border-green-500 transition-all ${isActive
                              ? isHigh
                                ? "bg-red-600"
                                : isMedium
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              : "bg-black"
                            }`}
                          style={{
                            boxShadow: isActive
                              ? `0 0 10px ${isHigh ? "#ff0000" : isMedium ? "#ffff00" : "#00ff00"}`
                              : "none",
                            opacity: isActive ? 1 : 0.3,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div
                    className="text-right text-3xl text-white"
                    style={{ fontFamily: "monospace" }}
                  >
                    {Math.round(rushLevel)}%
                    <span
                      className={`ml-2 text-sm ${rushLevel >= 75
                          ? "text-red-600"
                          : rushLevel >= 50
                            ? "text-yellow-500"
                            : "text-green-500"
                        }`}
                    >
                      {rushLevel >= 75
                        ? "[КРИТИЧНО]"
                        : rushLevel >= 50
                          ? "[УМЕРЕННО]"
                          : "[НОРМАЛЬНО]"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  triggerGlitch();
                }}
                className={`px-5 py-2 border-2 transition-all transform hover:scale-105 relative overflow-hidden ${selectedCategory === cat
                    ? "bg-red-600 border-red-600 text-black"
                    : "bg-black border-green-500 text-green-500 hover:border-red-600 hover:text-red-600"
                  }`}
                style={{
                  clipPath:
                    "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)",
                  fontFamily: "monospace",
                }}
              >
                {cat}
                {selectedCategory === cat && (
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s linear infinite",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Menu Grid */}
        <section>
          <h2
            className="text-4xl mb-6 text-white relative inline-block shimmer-text"
            style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              textShadow: "2px 2px 0px #ff0000",
            }}
          >
            {">"} МЕНЮ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`border-2 border-white bg-black p-5 relative group hover:bg-red-600 hover:border-red-600 transition-all cursor-pointer overflow-hidden ${glitchElements.includes(index + 10) ? "glitch-element" : ""}`}
                style={{
                  transform: `rotate(${index % 3 === 0 ? -1 : index % 3 === 1 ? 1 : 0}deg)`,
                }}
                onMouseEnter={triggerGlitch}
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-green-500 group-hover:text-black tracking-wider">
                      {item.category}
                    </div>
                    {item.spicy && (
                      <span className="text-red-600 group-hover:text-green-500 text-lg">
                        🔥
                      </span>
                    )}
                  </div>
                  <div
                    className="text-xl mb-3 tracking-tight group-hover:text-black"
                    style={{ fontFamily: "Impact, sans-serif" }}
                  >
                    {item.name}
                  </div>
                  <div
                    className="text-2xl text-red-600 group-hover:text-green-500"
                    style={{ fontFamily: "monospace" }}
                  >
                    {item.price}
                  </div>
                </div>
                <div
                  className="absolute inset-0 border-2 border-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ transform: "translate(4px, 4px)" }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Footer Info */}
        <footer className="mt-16 mb-8 border-t-2 border-red-600 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3
                className="text-green-500 mb-3 tracking-wider"
                style={{ fontFamily: "monospace" }}
              >
                [ЛОКАЦИЯ]
              </h3>
              <p className="text-sm">КОРПУС_А</p>
              <p className="text-sm">ЭТАЖ_1</p>
              <p className="text-sm">ГЛАВНЫЙ_ЗАЛ</p>
            </div>
            <div>
              <h3
                className="text-green-500 mb-3 tracking-wider"
                style={{ fontFamily: "monospace" }}
              >
                [ЧАСЫ_РАБОТЫ]
              </h3>
              <p className="text-sm">ЗАВТРАК: 08:00-09:30</p>
              <p className="text-sm">ОБЕД: 11:00-15:00</p>
              <p className="text-sm text-red-600">
                ВЫХОДНЫЕ: ЗАКРЫТО
              </p>
            </div>
            <div>
              <h3
                className="text-green-500 mb-3 tracking-wider"
                style={{ fontFamily: "monospace" }}
              >
                [ПРАВИЛА]
              </h3>
              <p className="text-sm">БЕЗ ОЧЕРЕДИ</p>
              <p className="text-sm">УБЕРИ ЗА СОБОЙ</p>
              <p className="text-sm">УВАЖАЙ ПЕРСОНАЛ</p>
            </div>
          </div>
          <div
            className="mt-8 text-center text-xs text-green-500 tracking-widest"
            style={{ fontFamily: "monospace" }}
          >
            СТОЛОВАЯ//2026//ЕШЬ_ИЛИ_БУДЕШЬ_СЪЕДЕН
          </div>
        </footer>
      </div>

      {/* Nutrition Info Popup */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Popup Window */}
          <div
            className="relative bg-black border-4 border-red-600 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow:
                "0 0 30px rgba(255,0,0,0.5), inset 0 0 20px rgba(255,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Window header */}
            <div className="border-b-4 border-green-500 p-4 bg-gradient-to-r from-black via-zinc-900 to-black relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-green-500 opacity-50" />
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    className="text-3xl text-red-600 mb-1"
                    style={{
                      fontFamily: "Impact, sans-serif",
                      textShadow: "2px 2px 0px #00ff00",
                    }}
                  >
                    {selectedItem.name}
                  </h3>
                  <div
                    className="text-sm text-green-500 tracking-wider"
                    style={{ fontFamily: "monospace" }}
                  >
                    [{selectedItem.category}] //{" "}
                    {selectedItem.price}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-red-600 hover:text-white border-2 border-red-600 hover:bg-red-600 px-3 py-1 transition-all"
                  style={{ fontFamily: "monospace" }}
                >
                  [X]
                </button>
              </div>
            </div>

            {/* Nutrition Content */}
            <div className="p-6">
              {/* Macros Section */}
              <div className="mb-6">
                <h4
                  className="text-green-500 text-sm mb-4 tracking-widest"
                  style={{ fontFamily: "monospace" }}
                >
                  [ПИЩЕВАЯ_ЦЕННОСТЬ]
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border-2 border-green-500 p-4 relative overflow-hidden group hover:border-red-600 transition-colors">
                    <div
                      className="text-xs text-green-500 group-hover:text-red-600 mb-1"
                      style={{ fontFamily: "monospace" }}
                    >
                      БЕЛКИ
                    </div>
                    <div
                      className="text-3xl text-white"
                      style={{
                        fontFamily: "Impact, sans-serif",
                      }}
                    >
                      {selectedItem.nutrition.protein}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 group-hover:bg-red-600 transition-colors" />
                  </div>
                  <div className="border-2 border-green-500 p-4 relative overflow-hidden group hover:border-red-600 transition-colors">
                    <div
                      className="text-xs text-green-500 group-hover:text-red-600 mb-1"
                      style={{ fontFamily: "monospace" }}
                    >
                      ЖИРЫ
                    </div>
                    <div
                      className="text-3xl text-white"
                      style={{
                        fontFamily: "Impact, sans-serif",
                      }}
                    >
                      {selectedItem.nutrition.fats}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 group-hover:bg-red-600 transition-colors" />
                  </div>
                  <div className="border-2 border-green-500 p-4 relative overflow-hidden group hover:border-red-600 transition-colors">
                    <div
                      className="text-xs text-green-500 group-hover:text-red-600 mb-1"
                      style={{ fontFamily: "monospace" }}
                    >
                      УГЛЕВОДЫ
                    </div>
                    <div
                      className="text-3xl text-white"
                      style={{
                        fontFamily: "Impact, sans-serif",
                      }}
                    >
                      {selectedItem.nutrition.carbs}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 group-hover:bg-red-600 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Ingredients Section */}
              <div className="mb-6">
                <h4
                  className="text-green-500 text-sm mb-4 tracking-widest"
                  style={{ fontFamily: "monospace" }}
                >
                  [СОСТАВ]
                </h4>
                <div className="border-2 border-white p-4 bg-black">
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.nutrition.ingredients.map(
                      (ingredient, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-black border border-green-500 text-white text-sm"
                          style={{
                            fontFamily: "monospace",
                            clipPath:
                              "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)",
                          }}
                        >
                          {ingredient}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Allergens Section */}
              <div className="mb-6">
                <h4
                  className="text-red-600 text-sm mb-4 tracking-widest"
                  style={{ fontFamily: "monospace" }}
                >
                  [АЛЛЕРГЕНЫ]
                </h4>
                <div className="border-2 border-red-600 p-4 bg-black relative overflow-hidden">
                  {selectedItem.nutrition.allergens.length >
                    0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.nutrition.allergens.map(
                        (allergen, i) => (
                          <span
                            key={i}
                            className="px-3 py-2 bg-red-600 text-black transform -skew-x-6"
                            style={{
                              fontFamily: "monospace",
                            }}
                          >
                            <span className="block transform skew-x-6">
                              ⚠ {allergen}
                            </span>
                          </span>
                        ),
                      )}
                    </div>
                  ) : (
                    <div
                      className="text-green-500 text-center"
                      style={{ fontFamily: "monospace" }}
                    >
                      НЕТ_АЛЛЕРГЕНОВ
                    </div>
                  )}
                  <div className="absolute top-0 right-0 w-16 h-16 border-l-2 border-b-2 border-red-600 opacity-30" />
                </div>
              </div>

              {/* Reviews Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4
                    className="text-green-500 text-sm tracking-widest"
                    style={{ fontFamily: "monospace" }}
                  >
                    [ОТЗЫВЫ]
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-2xl ${i <
                            Math.floor(
                              selectedItem.averageRating,
                            )
                              ? "text-yellow-500"
                              : i < selectedItem.averageRating
                                ? "text-yellow-500 opacity-50"
                                : "text-gray-600"
                            }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span
                      className="text-white text-xl"
                      style={{ fontFamily: "monospace" }}
                    >
                      {selectedItem.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="border-2 border-green-500 p-4 bg-black space-y-4">
                  {selectedItem.reviews.map((review, i) => (
                    <div
                      key={review.id}
                      className="border-l-2 border-red-600 pl-4 relative"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% 100%, 8px 100%)",
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div
                            className="text-white text-sm"
                            style={{ fontFamily: "monospace" }}
                          >
                            {review.author}
                          </div>
                          <div
                            className="text-green-500 text-xs"
                            style={{ fontFamily: "monospace" }}
                          >
                            {review.date}
                          </div>
                        </div>
                        <div className="flex">
                          {Array.from({ length: 5 }).map(
                            (_, starIndex) => (
                              <span
                                key={starIndex}
                                className={`text-sm ${starIndex < review.rating
                                    ? "text-yellow-500"
                                    : "text-gray-600"
                                  }`}
                              >
                                ★
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {review.comment}
                      </p>
                      {i < selectedItem.reviews.length - 1 && (
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-green-500 opacity-20" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Review Form */}
                <div className="mt-6 border-t-2 border-red-600 pt-6">
                  <h5
                    className="text-red-600 text-sm mb-4 tracking-widest"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {isLoggedIn ? `[ДОБАВИТЬ_ОТЗЫВ_КАК_${userName.toUpperCase()}]` : '[ВОЙДИТЕ_ДЛЯ_ОТЗЫВА]'}
                  </h5>
                  
                  {isLoggedIn ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const rating = Number(formData.get('rating'));
                        const comment = formData.get('comment') as string;

                        // Создаем новый отзыв от имени текущего пользователя
                        const newReview: Review = {
                          id: Date.now().toString(),
                          author: userName,
                          rating: rating,
                          comment: comment,
                          date: new Date().toLocaleDateString('ru-RU')
                        };

                        // Добавляем отзыв в selectedItem
                        if (selectedItem) {
                          const updatedReviews = [...selectedItem.reviews, newReview];
                          const newAverage = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
                          
                          setSelectedItem({
                            ...selectedItem,
                            reviews: updatedReviews,
                            averageRating: parseFloat(newAverage.toFixed(1))
                          });
                        }

                        // Сброс формы
                        e.currentTarget.reset();
                      }}
                      className="space-y-4"
                    >
                      {/* Информация о том, от чьего имени будет отзыв */}
                      <div className="border-2 border-green-500 p-3 bg-black/50">
                        <div className="text-xs text-green-500 mb-1" style={{ fontFamily: 'monospace' }}>
                          [ОТЗЫВ_ОТ_ИМЕНИ]:
                        </div>
                        <div className="text-white text-lg" style={{ fontFamily: 'monospace' }}>
                          {userName}
                        </div>
                        {userProfile?.name && (
                          <div className="text-gray-400 text-sm mt-1">
                            ({userProfile.name})
                          </div>
                        )}
                      </div>

                      {/* Rating Selection */}
                      <div>
                        <label
                          className="block text-green-500 text-xs mb-2 tracking-widest"
                          style={{ fontFamily: 'monospace' }}
                        >
                          [ОЦЕНКА]
                        </label>
                        <div className="relative">
                          <select
                            name="rating"
                            required
                            className="w-full p-3 bg-black border-2 border-green-500 text-white focus:border-red-600 focus:outline-none transition-colors"
                            style={{
                              fontFamily: 'monospace',
                              clipPath: 'polygon(0 0, 98% 0, 100% 15%, 100% 100%, 0 100%)',
                            }}
                          >
                            <option value="">ВЫБЕРИТЕ_ОЦЕНКУ</option>
                            <option value="5">★★★★★ (5)</option>
                            <option value="4">★★★★☆ (4)</option>
                            <option value="3">★★★☆☆ (3)</option>
                            <option value="2">★★☆☆☆ (2)</option>
                            <option value="1">★☆☆☆☆ (1)</option>
                          </select>
                          <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                        </div>
                      </div>

                      {/* Comment Textarea */}
                      <div>
                        <label
                          className="block text-green-500 text-xs mb-2 tracking-widest"
                          style={{ fontFamily: 'monospace' }}
                        >
                          [КОММЕНТАРИЙ]
                        </label>
                        <div className="relative">
                          <textarea
                            name="comment"
                            required
                            placeholder={`ВВЕДИТЕ_ВАШ_ОТЗЫВ, ${userName}`}
                            rows={4}
                            className="w-full p-3 bg-black border-2 border-green-500 text-white placeholder-green-900 focus:border-red-600 focus:outline-none transition-colors resize-none"
                            style={{
                              fontFamily: 'monospace',
                              clipPath: 'polygon(0 0, 98% 0, 100% 8%, 100% 100%, 0 100%)',
                            }}
                          />
                          <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="w-full p-4 bg-red-600 text-black border-2 border-red-600 hover:bg-green-500 hover:border-green-500 transition-all relative overflow-hidden group"
                        style={{
                          fontFamily: 'monospace',
                          clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)',
                        }}
                      >
                        <span className="block text-base tracking-widest">
                          [ОТПРАВИТЬ_ОТЗЫВ]
                        </span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                      </button>
                    </form>
                  ) : (
                    // Сообщение для неавторизованных пользователей
                    <div className="border-2 border-red-600 p-6 text-center bg-black/50">
                      <p className="text-white mb-4" style={{ fontFamily: 'monospace' }}>
                        ДЛЯ_ОСТАВЛЕНИЯ_ОТЗЫВА_ВОЙДИТЕ_В_СИСТЕМУ
                      </p>
                      <button
                        onClick={() => {
                          setSelectedItem(null);
                          setShowLoginPopup(true);
                        }}
                        className="px-6 py-3 bg-green-500 text-black border-2 border-green-500 hover:bg-red-600 hover:border-red-600 transition-all"
                        style={{ fontFamily: 'monospace' }}
                      >
                        [ВОЙТИ]
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer accent */}
            <div className="border-t-2 border-green-500 p-3 bg-black">
              <div
                className="text-center text-xs text-green-500"
                style={{ fontFamily: "monospace" }}
              >
                НАЖМИТЕ_ЧТОБЫ_ЗАКРЫТЬ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Popup */}
      {showProfilePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative bg-black border-4 border-green-500 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow: "0 0 30px rgba(0,255,0,0.5), inset 0 0 20px rgba(0,255,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b-4 border-red-600 p-4 bg-gradient-to-r from-black via-zinc-900 to-black relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-red-600 opacity-50" />
              <div className="flex justify-between items-start">
                <h3 className="text-3xl text-green-500 mb-1" style={{ fontFamily: "Impact, sans-serif", textShadow: "2px 2px 0px #ff0000" }}>
                  [ПРОФИЛЬ_ПОЛЬЗОВАТЕЛЯ]
                </h3>
                <button onClick={() => setShowProfilePopup(false)} className="text-green-500 hover:text-white border-2 border-green-500 hover:bg-green-500 px-3 py-1 transition-all" style={{ fontFamily: "monospace" }}>
                  [X]
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Информация о пользователе */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-2 border-green-500 p-4">
                    <div className="text-xs text-green-500 mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
                      [ИНФОРМАЦИЯ]
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-gray-400">Имя:</div>
                        <div className="text-white" style={{ fontFamily: "monospace" }}>{userProfile?.name || userName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Логин:</div>
                        <div className="text-white" style={{ fontFamily: "monospace" }}>{userProfile?.username || userName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Email:</div>
                        <div className="text-white" style={{ fontFamily: "monospace" }}>{userProfile?.email || "Не указан"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Баланс */}
                  <div className="border-2 border-green-500 p-4">
                    <div className="text-xs text-green-500 mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
                      [БАЛАНС]
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl text-white" style={{ fontFamily: "monospace" }}>
                        {balance}₽
                      </div>
                      <button
                        onClick={() => {
                          // TODO: Добавить функцию пополнения баланса
                          const amount = prompt("Введите сумму для пополнения (в рублях):");
                          if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
                            setBalance(prev => prev + Number(amount));
                          }
                        }}
                        className="border-2 border-red-600 text-red-600 px-4 py-2 hover:bg-red-600 hover:text-black transition-all"
                        style={{ fontFamily: "monospace" }}
                      >
                        [ПОПОЛНИТЬ]
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Сообщения об успехе/ошибке */}
              {profileSuccess && (
                <div className="mb-4 p-3 border-2 border-green-500 bg-green-500/10 text-green-500 text-center" style={{ fontFamily: "monospace" }}>
                  ✓ ПРОФИЛЬ_СОХРАНЕН
                </div>
              )}
              {profileError && (
                <div className="mb-4 p-3 border-2 border-red-600 bg-red-600/10 text-red-600" style={{ fontFamily: "monospace" }}>
                  [ОШИБКА]: {profileError}
                </div>
              )}

              {/* Автоматическая закупка */}
              <div className="mb-6">
                <div className="flex items-center justify-between border-2 border-green-500 p-4">
                  <div>
                    <div className="text-xs text-green-500 mb-1 tracking-widest" style={{ fontFamily: "monospace" }}>
                      [АВТОМАТИЧЕСКАЯ_ЗАКУПКА]
                    </div>
                    <div className="text-sm text-gray-400">
                      Автоматическая покупка выбранных блюд при низком балансе
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPurchase}
                      onChange={(e) => setAutoPurchase(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>

              {/* Аллергии */}
              <div className="mb-8">
                <div className="border-2 border-green-500 p-4">
                  <div className="text-xs text-green-500 mb-4 tracking-widest" style={{ fontFamily: "monospace" }}>
                    [ВАШИ_АЛЛЕРГИИ]
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {ALL_ALLERGENS.map((allergy) => (
                      <label
                        key={allergy}
                        className={`flex items-center p-3 border-2 cursor-pointer transition-all ${selectedAllergies.includes(allergy)
                            ? "border-red-600 bg-red-600/10"
                            : "border-green-500 hover:border-red-600"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAllergies.includes(allergy)}
                          onChange={() => handleAllergyChange(allergy)}
                          className="mr-2 w-4 h-4 text-red-600 bg-black border-green-500 rounded focus:ring-red-500 focus:ring-2"
                        />
                        <span className="text-sm" style={{ fontFamily: "monospace" }}>
                          {allergy}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-4">
                <button
                  onClick={saveUserProfile}
                  disabled={profileLoading}
                  className="flex-1 p-4 bg-red-600 text-black border-2 border-red-600 hover:bg-green-500 hover:border-green-500 transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "monospace", clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)" }}
                >
                  <span className="block text-lg tracking-widest">
                    {profileLoading ? "[СОХРАНЕНИЕ...]" : "[СОХРАНИТЬ_ПРОФИЛЬ]"}
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>
                <button
                  onClick={() => setShowProfilePopup(false)}
                  className="px-6 py-4 border-2 border-green-500 text-green-500 hover:border-red-600 hover:text-red-600 transition-all"
                  style={{ fontFamily: "monospace", clipPath: "polygon(5% 0, 95% 0, 100% 50%, 95% 100%, 5% 100%, 0% 50%)" }}
                >
                  [ЗАКРЫТЬ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative bg-black border-4 border-green-500 max-w-md w-full"
            style={{
              boxShadow: "0 0 30px rgba(0,255,0,0.5), inset 0 0 20px rgba(0,255,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b-4 border-red-600 p-4 bg-gradient-to-r from-black via-zinc-900 to-black relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-red-600 opacity-50" />
              <div className="flex justify-between items-start">
                <h3 className="text-3xl text-green-500 mb-1" style={{ fontFamily: "Impact, sans-serif", textShadow: "2px 2px 0px #ff0000" }}>
                  [ВХОД_В_СИСТЕМУ]
                </h3>
                <button onClick={() => setShowLoginPopup(false)} className="text-green-500 hover:text-white border-2 border-green-500 hover:bg-green-500 px-3 py-1 transition-all" style={{ fontFamily: "monospace" }}>
                  [X]
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-6">
                  <label className="block text-green-500 text-sm mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
                    [ЛОГИН]
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="ВВЕДИТЕ_ЛОГИН"
                      value={loginUsername}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setLoginUsername(e.target.value)}
                      className="w-full p-3 bg-black border-2 border-green-500 text-white placeholder-green-900 focus:border-red-600 focus:outline-none transition-colors"
                      style={{ fontFamily: "monospace", clipPath: "polygon(0 0, 98% 0, 100% 20%, 100% 100%, 0 100%)" }}
                    />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-green-500 text-sm mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
                    [ПАРОЛЬ]
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="ВВЕДИТЕ_ПАРОЛЬ"
                      value={loginPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value)}
                      className="w-full p-3 bg-black border-2 border-green-500 text-white placeholder-green-900 focus:border-red-600 focus:outline-none transition-colors"
                      style={{ fontFamily: "monospace", clipPath: "polygon(0 0, 98% 0, 100% 20%, 100% 100%, 0 100%)" }}
                    />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                  </div>
                </div>

                <button type="submit" className="w-full p-4 bg-red-600 text-black border-2 border-red-600 hover:bg-green-500 hover:border-green-500 transition-all relative overflow-hidden group" style={{ fontFamily: "monospace", clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)" }}>
                  <span className="block text-lg tracking-widest">[ВОЙТИ]</span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>

                <div className="mt-6 flex justify-between items-center">
                  <button onClick={SwitchToZabl} type="button" className="text-green-500 text-xs hover:text-red-600 transition-colors" style={{ fontFamily: "monospace" }}>
                    [ЗАБЫЛИ_ПАРОЛЬ?]
                  </button>
                  <button
                    onClick={SwithParametrButton}
                    type="button"
                    className="text-green-500 text-xs hover:text-red-600 transition-colors"
                    style={{ fontFamily: "monospace" }}
                  >
                    [РЕГИСТРАЦИЯ]
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}



      {/* Password Reset Step 1 - Email */}
      {showZablPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative bg-black border-4 border-green-500 max-w-md w-full"
            style={{
              boxShadow: "0 0 30px rgba(0,255,0,0.5), inset 0 0 20px rgba(0,255,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b-4 border-red-600 p-4 bg-gradient-to-r from-black via-zinc-900 to-black relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-red-600 opacity-50" />
              <div className="flex justify-between items-start">
                <h3 className="text-3xl text-green-500 mb-1" style={{ fontFamily: "Impact, sans-serif", textShadow: "2px 2px 0px #ff0000" }}>
                  [СБРОС_ПАРОЛЯ]
                </h3>
                <button onClick={() => setShowZablPopup(false)} className="text-green-500 hover:text-white border-2 border-green-500 hover:bg-green-500 px-3 py-1 transition-all" style={{ fontFamily: "monospace" }}>
                  [X]
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleResetEmailSubmit}>
                <div className="mb-6">
                  <label className="block text-green-500 text-sm mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
                    [EMAIL]
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="ВВЕДИТЕ_EMAIL"
                      value={resetEmail}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setResetEmail(e.target.value)}
                      className="w-full p-3 bg-black border-2 border-green-500 text-white placeholder-green-900 focus:border-red-600 focus:outline-none transition-colors"
                      style={{ fontFamily: "monospace", clipPath: "polygon(0 0, 98% 0, 100% 20%, 100% 100%, 0 100%)" }}
                    />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                  </div>
                </div>

                <button type="submit" className="w-full p-4 bg-red-600 text-black border-2 border-red-600 hover:bg-green-500 hover:border-green-500 transition-all relative overflow-hidden group" style={{ fontFamily: "monospace", clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)" }}>
                  <span className="block text-lg tracking-widest">[СБРОСИТЬ_ПАРОЛЬ]</span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Step 2 - Code */}
      {showMailPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative bg-black border-4 border-green-500 max-w-md w-full"
            style={{
              boxShadow: "0 0 30px rgba(0,255,0,0.5), inset 0 0 20px rgba(0,255,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b-4 border-red-600 p-4 bg-gradient-to-r from-black via-zinc-900 to-black relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-red-600 opacity-50" />
              <div className="flex justify-between items-start">
                <h3 className="text-3xl text-green-500 mb-1" style={{ fontFamily: "Impact, sans-serif", textShadow: "2px 2px 0px #ff0000" }}>
                  [СБРОС_ПАРОЛЯ]
                </h3>
                <button onClick={() => setShowMailPopup(false)} className="text-green-500 hover:text-white border-2 border-green-500 hover:bg-green-500 px-3 py-1 transition-all" style={{ fontFamily: "monospace" }}>
                  [X]
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleResetCodeSubmit}>
                <div className="mb-6">
                  <label className="block text-green-500 text-sm mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
                    [КОД]
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="ВВЕДИТЕ_КОД_C_ПОЧТЫ"
                      value={resetCode}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setResetCode(e.target.value)}
                      className="w-full p-3 bg-black border-2 border-green-500 text-white placeholder-green-900 focus:border-red-600 focus:outline-none transition-colors"
                      style={{ fontFamily: "monospace", clipPath: "polygon(0 0, 98% 0, 100% 20%, 100% 100%, 0 100%)" }}
                    />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                  </div>
                </div>

                <button type="submit" className="w-full p-4 bg-red-600 text-black border-2 border-red-600 hover:bg-green-500 hover:border-green-500 transition-all relative overflow-hidden group" style={{ fontFamily: "monospace", clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)" }}>
                  <span className="block text-lg tracking-widest">[ПРОВЕРИТЬ_КОД]</span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Step 3 - New Password */}
      {showPasswordPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative bg-black border-4 border-green-500 max-w-md w-full"
            style={{
              boxShadow: "0 0 30px rgba(0,255,0,0.5), inset 0 0 20px rgba(0,255,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b-4 border-red-600 p-4 bg-gradient-to-r from-black via-zinc-900 to-black relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-red-600 opacity-50" />
              <div className="flex justify-between items-start">
                <h3 className="text-3xl text-green-500 mb-1" style={{ fontFamily: "Impact, sans-serif", textShadow: "2px 2px 0px #ff0000" }}>
                  [СБРОС_ПАРОЛЯ]
                </h3>
                <button onClick={() => setShowPasswordPopup(false)} className="text-green-500 hover:text-white border-2 border-green-500 hover:bg-green-500 px-3 py-1 transition-all" style={{ fontFamily: "monospace" }}>
                  [X]
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleNewPasswordSubmit}>
                <div className="mb-8">
                  <label className="block text-green-500 text-sm mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
                    [НОВЫЙ_ПАРОЛЬ]
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="ПРИДУМАЙТЕ_ПАРОЛЬ"
                      value={newPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                      className="w-full p-3 bg-black border-2 border-green-500 text-white placeholder-green-900 focus:border-red-600 focus:outline-none transition-colors"
                      style={{ fontFamily: "monospace", clipPath: "polygon(0 0, 98% 0, 100% 20%, 100% 100%, 0 100%)" }}
                    />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                  </div>
                </div>

                <div className="mb-9">
                  <label className="block text-green-500 text-sm mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
                    [ПОВТОРЕНИЕ_ПАРОЛЯ]
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="ПОВТОРИТЕ_ПАРОЛЬ"
                      value={repeatPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setRepeatPassword(e.target.value)}
                      className="w-full p-3 bg-black border-2 border-green-500 text-white placeholder-green-900 focus:border-red-600 focus:outline-none transition-colors"
                      style={{ fontFamily: "monospace", clipPath: "polygon(0 0, 98% 0, 100% 20%, 100% 100%, 0 100%)" }}
                    />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                  </div>
                </div>

                <button type="submit" className="w-full p-4 bg-red-600 text-black border-2 border-red-600 hover:bg-green-500 hover:border-green-500 transition-all relative overflow-hidden group" style={{ fontFamily: "monospace", clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)" }}>
                  <span className="block text-lg tracking-widest">[СБРОСИТЬ_ПАРОЛЬ]</span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {showRegisterPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative bg-black border-4 border-green-500 max-w-md w-full"
            style={{
              boxShadow: "0 0 30px rgba(0,255,0,0.5), inset 0 0 20px rgba(0,255,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b-4 border-red-600 p-4 bg-gradient-to-r from-black via-zinc-900 to-black relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-red-600 opacity-50" />
              <div className="flex justify-between items-start">
                <h3 className="text-3xl text-green-500 mb-1" style={{ fontFamily: "Impact, sans-serif", textShadow: "2px 2px 0px #ff0000" }}>
                  [РЕГИСТРАЦИЯ_АККАУНТА]
                </h3>
                <button
                  onClick={() => {
                    setShowRegisterPopup(false);
                    setRegisterError(null);
                  }}
                  className="text-green-500 hover:text-white border-2 border-green-500 hover:bg-green-500 px-3 py-1 transition-all"
                  style={{ fontFamily: "monospace" }}
                >
                  [X]
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Отображение успешной регистрации */}
              {registerSuccess && (
                <div className="mb-4 p-3 border-2 border-green-500 bg-green-500/10 text-green-500 text-center" style={{ fontFamily: "monospace" }}>
                  ✓ РЕГИСТРАЦИЯ_УСПЕШНА
                </div>
              )}

              {/* Отображение ошибки регистрации */}
              {registerError && (
                <div className="mb-4 p-3 border-2 border-red-600 bg-red-600/10 text-red-600" style={{ fontFamily: "monospace" }}>
                  [ОШИБКА]: {registerError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit}>
                <div className="mb-1">
                  <label className="block text-green-500 text-sm mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
                    [ФИО]
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="ВВЕДИТЕ_ФИО"
                      value={registerName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setRegisterName(e.target.value)}
                      disabled={isLoading || registerSuccess}
                      className="w-full p-3 bg-black border-2 border-green-500 text-white placeholder-green-900 focus:border-red-600 focus:outline-none transition-colors disabled:opacity-50"
                      style={{ fontFamily: "monospace", clipPath: "polygon(0 0, 98% 0, 100% 20%, 100% 100%, 0 100%)" }}
                    />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-green-500 text-sm mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
                    [EMAIL]
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="ВВЕДИТЕ_EMAIL"
                      value={registerEmail}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setRegisterEmail(e.target.value)}
                      disabled={isLoading || registerSuccess}
                      className="w-full p-3 bg-black border-2 border-green-500 text-white placeholder-green-900 focus:border-red-600 focus:outline-none transition-colors disabled:opacity-50"
                      style={{ fontFamily: "monospace", clipPath: "polygon(0 0, 98% 0, 100% 20%, 100% 100%, 0 100%)" }}
                    />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-green-500 text-sm mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
                    [ЛОГИН]
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="ПРИДУМАЙТЕ_ЛОГИН"
                      value={registerUsername}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setRegisterUsername(e.target.value)}
                      disabled={isLoading || registerSuccess}
                      className="w-full p-3 bg-black border-2 border-green-500 text-white placeholder-green-900 focus:border-red-600 focus:outline-none transition-colors disabled:opacity-50"
                      style={{ fontFamily: "monospace", clipPath: "polygon(0 0, 98% 0, 100% 20%, 100% 100%, 0 100%)" }}
                    />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-green-500 text-sm mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
                    [ПАРОЛЬ]
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="ПРИДУМАЙТЕ_ПАРОЛЬ (мин. 6 символов)"
                      value={registerPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setRegisterPassword(e.target.value)}
                      disabled={isLoading || registerSuccess}
                      className="w-full p-3 bg-black border-2 border-green-500 text-white placeholder-green-900 focus:border-red-600 focus:outline-none transition-colors disabled:opacity-50"
                      style={{ fontFamily: "monospace", clipPath: "polygon(0 0, 98% 0, 100% 20%, 100% 100%, 0 100%)" }}
                    />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-600" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || registerSuccess}
                  className="w-full p-4 bg-red-600 text-black border-2 border-red-600 hover:bg-green-500 hover:border-green-500 transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "monospace", clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)" }}
                >
                  <span className="block text-lg tracking-widest">
                    {isLoading ? "[ОБРАБОТКА...]" : registerSuccess ? "[УСПЕШНО!]" : "[ЗАРЕГИСТРИРОВАТЬСЯ]"}
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {showNewAccPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative bg-black border-4 border-green-500 max-w-md w-full"
            style={{
              boxShadow: "0 0 30px rgba(0,255,0,0.5), inset 0 0 20px rgba(0,255,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b-4 border-red-600 p-4 bg-gradient-to-r from-black via-zinc-900 to-black relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-red-600 opacity-50" />
              <div className="flex justify-between items-start">
                <h3 className="text-3xl text-green-500 mb-1" style={{ fontFamily: "Impact, sans-serif", textShadow: "2px 2px 0px #ff0000" }}>
                  [АККАУНТ_УСПЕШНО_СОЗДАН!]
                </h3>
                <button
                  onClick={() => {
                    setShowNewAccPopup(false);
                    // Можно автоматически авторизовать пользователя или переключить на форму входа
                    setShowLoginPopup(true);
                  }}
                  className="text-green-500 hover:text-white border-2 border-green-500 hover:bg-green-500 px-3 py-1 transition-all"
                  style={{ fontFamily: "monospace" }}
                >
                  [X]
                </button>
              </div>
            </div>

            <div className="p-6 text-center">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <p className="text-white text-lg mb-6" style={{ fontFamily: "monospace" }}>
                АККАУНТ_УСПЕШНО_СОЗДАН
              </p>
              <p className="text-gray-400 text-sm mb-8">
                Теперь вы можете войти в систему, используя свои учетные данные
              </p>
              <button
                onClick={() => {
                  setShowNewAccPopup(false);
                  setShowLoginPopup(true);
                }}
                className="w-full p-4 bg-red-600 text-black border-2 border-red-600 hover:bg-green-500 hover:border-green-500 transition-all relative overflow-hidden group"
                style={{ fontFamily: "monospace", clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)" }}
              >
                <span className="block text-lg tracking-widest">[ВОЙТИ_В_СИСТЕМУ]</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      )}
      {isLoggedIn && (
  <button
    onClick={() => window.location.href = "/admin"}
    className="border-2 border-blue-500 bg-black text-blue-500 px-6 py-3 hover:border-yellow-500 hover:text-yellow-500 transition-all relative overflow-hidden group ml-4"
    style={{
      clipPath: "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)",
      fontFamily: "monospace",
    }}
  >
    <span className="relative z-10 tracking-wider text-sm">
      [АДМИН]
    </span>
    <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
  </button>
)}


    </div>
  );
}
