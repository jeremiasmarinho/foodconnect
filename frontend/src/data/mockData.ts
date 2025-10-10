import {
  Restaurant,
  User,
  Post,
  Review,
  MenuCategory,
  MenuItem,
} from "../types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    email: "maria.silva@email.com",
    name: "Maria Silva",
    username: "maria_foodie",
    bio: "🍕 Apaixonada por gastronomia | Food blogger | São Paulo, SP",
    createdAt: "2024-01-15T10:00:00Z",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "2",
    email: "joao.santos@email.com",
    name: "João Santos",
    username: "joao_chef",
    bio: "👨‍🍳 Chef profissional | Amante da culinária italiana | Rio de Janeiro",
    createdAt: "2024-02-10T15:30:00Z",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "3",
    email: "ana.costa@email.com",
    name: "Ana Costa",
    username: "ana_veggie",
    bio: "🌱 Vegetariana | Explorando sabores saudáveis | Nutricionista",
    createdAt: "2024-03-05T09:15:00Z",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "4",
    email: "carlos.mendes@email.com",
    name: "Carlos Mendes",
    username: "carlos_gourmet",
    bio: "🍷 Sommelier | Crítico gastronômico | Belo Horizonte, MG",
    createdAt: "2024-03-20T14:00:00Z",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "5",
    email: "lucia.pereira@email.com",
    name: "Lucia Pereira",
    username: "lucia_doces",
    bio: "🧁 Confeiteira | Especialista em doces artesanais | Curitiba, PR",
    createdAt: "2024-04-02T11:45:00Z",
    avatar:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "6",
    email: "rafael.oliveira@email.com",
    name: "Rafael Oliveira",
    username: "rafael_street",
    bio: "🌮 Street food lover | Descobrindo sabores pelo Brasil | Salvador, BA",
    createdAt: "2024-04-15T16:20:00Z",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
];

// Mock Restaurants
export const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    type: "RESTAURANT",
    name: "Bella Napoli",
    description:
      "Autêntica culinária italiana com ingredientes importados diretamente da Itália. Massa fresca feita diariamente.",
    address: "Rua Augusta, 1234",
    city: "São Paulo",
    state: "SP",
    zipCode: "01305-100",
    phone: "(11) 3456-7890",
    email: "contato@bellanapoli.com.br",
    website: "https://bellanapoli.com.br",
    imageUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    latitude: -23.5505,
    longitude: -46.6333,
    category: "italian",
    cuisine: "Italiana",
    priceRange: 2,
    rating: 4.8,
    reviewCount: 127,
    isOpen: true,
    openingHours: {
      monday: "11:00-23:00",
      tuesday: "11:00-23:00",
      wednesday: "11:00-23:00",
      thursday: "11:00-23:00",
      friday: "11:00-23:30",
      saturday: "11:00-23:30",
      sunday: "11:00-22:00",
    },
    features: ["delivery", "takeout", "dine_in", "wifi", "parking"],
    tags: ["pizza", "pasta", "romantic", "family_friendly"],
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    type: "RESTAURANT",
    name: "Burger Station",
    description:
      "Os melhores hambúrguers artesanais da cidade! Carne 100% bovina, pães brioche e batatas rústicas.",
    address: "Av. Paulista, 2000",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    phone: "(11) 2345-6789",
    email: "pedidos@burgerstation.com.br",
    imageUrl:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop",
    latitude: -23.5618,
    longitude: -46.6565,
    category: "burger",
    cuisine: "Americana",
    priceRange: 2,
    rating: 4.6,
    reviewCount: 89,
    isOpen: true,
    openingHours: {
      monday: "18:00-02:00",
      tuesday: "18:00-02:00",
      wednesday: "18:00-02:00",
      thursday: "18:00-02:00",
      friday: "18:00-03:00",
      saturday: "18:00-03:00",
      sunday: "18:00-01:00",
    },
    features: ["delivery", "takeout", "dine_in"],
    tags: ["burgers", "fries", "casual", "family_friendly"],
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    type: "RESTAURANT",
    name: "Sushi Zen",
    description:
      "Experiência autêntica da culinária japonesa. Peixes frescos e sushiman com mais de 15 anos de experiência.",
    address: "Rua da Liberdade, 456",
    city: "São Paulo",
    state: "SP",
    zipCode: "01503-010",
    phone: "(11) 1234-5678",
    email: "reservas@sushizen.com.br",
    imageUrl:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
    latitude: -23.5587,
    longitude: -46.6347,
    category: "sushi",
    cuisine: "Japonesa",
    priceRange: 3,
    rating: 4.9,
    reviewCount: 203,
    isOpen: false,
    openingHours: {
      monday: "Fechado",
      tuesday: "18:00-23:00",
      wednesday: "18:00-23:00",
      thursday: "18:00-23:00",
      friday: "18:00-24:00",
      saturday: "18:00-24:00",
      sunday: "18:00-22:00",
    },
    features: ["dine_in", "takeout", "wifi", "valet_parking"],
    tags: ["sushi", "sashimi", "japanese", "fresh"],
    createdAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "4",
    type: "RESTAURANT",
    name: "Green Bowl",
    description:
      "Comida saudável e saborosa! Bowls nutritivos, saladas frescas e sucos naturais para uma vida mais equilibrada.",
    address: "Rua Oscar Freire, 789",
    city: "São Paulo",
    state: "SP",
    zipCode: "01426-001",
    phone: "(11) 9876-5432",
    email: "contato@greenbowl.com.br",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    latitude: -23.5626,
    longitude: -46.6727,
    category: "healthy",
    cuisine: "Saudável",
    priceRange: 2,
    rating: 4.7,
    reviewCount: 156,
    isOpen: true,
    openingHours: {
      monday: "08:00-20:00",
      tuesday: "08:00-20:00",
      wednesday: "08:00-20:00",
      thursday: "08:00-20:00",
      friday: "08:00-20:00",
      saturday: "09:00-18:00",
      sunday: "09:00-17:00",
    },
    features: ["delivery", "takeout", "dine_in", "wifi", "vegan_options"],
    tags: ["healthy", "vegan", "organic", "bowl"],
    createdAt: "2024-01-04T00:00:00Z",
  },
  {
    id: "5",
    type: "RESTAURANT",
    name: "Café Central",
    description:
      "O melhor café da região! Grãos especiais, doces artesanais e ambiente aconchegante para trabalhar ou relaxar.",
    address: "Rua Bela Cintra, 321",
    city: "São Paulo",
    state: "SP",
    zipCode: "01415-000",
    phone: "(11) 5555-1234",
    email: "ola@cafecentral.com.br",
    imageUrl:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
    latitude: -23.5656,
    longitude: -46.6679,
    category: "coffee",
    cuisine: "Café",
    priceRange: 1,
    rating: 4.5,
    reviewCount: 94,
    isOpen: true,
    openingHours: {
      monday: "07:00-19:00",
      tuesday: "07:00-19:00",
      wednesday: "07:00-19:00",
      thursday: "07:00-19:00",
      friday: "07:00-20:00",
      saturday: "08:00-20:00",
      sunday: "08:00-18:00",
    },
    features: ["takeout", "dine_in", "wifi", "work_friendly"],
    tags: ["coffee", "cozy", "work", "dessert"],
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: "6",
    type: "RESTAURANT",
    name: "Churrascaria Gaúcha",
    description:
      "Tradição do sul! Carnes nobres, buffet completo e o verdadeiro chimarrão gaúcho em ambiente familiar.",
    address: "Av. Faria Lima, 1500",
    city: "São Paulo",
    state: "SP",
    zipCode: "04538-132",
    phone: "(11) 3333-4444",
    email: "reservas@churrascariagaucha.com.br",
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    latitude: -23.573,
    longitude: -46.6892,
    category: "brazilian",
    cuisine: "Brasileira",
    priceRange: 3,
    rating: 4.4,
    reviewCount: 78,
    isOpen: true,
    openingHours: {
      monday: "11:30-15:00,18:00-23:00",
      tuesday: "11:30-15:00,18:00-23:00",
      wednesday: "11:30-15:00,18:00-23:00",
      thursday: "11:30-15:00,18:00-23:00",
      friday: "11:30-15:00,18:00-24:00",
      saturday: "11:30-24:00",
      sunday: "11:30-22:00",
    },
    features: ["dine_in", "parking", "family_friendly"],
    tags: ["bbq", "family", "traditional", "meat"],
    createdAt: "2024-01-06T00:00:00Z",
  },
];

// Mock Menu Categories and Items
export const mockMenuCategories: Record<string, MenuCategory[]> = {
  "1": [
    {
      id: "pizza",
      name: "Pizzas",
      description: "Nossas deliciosas pizzas artesanais",
      items: [
        {
          id: "margherita",
          name: "Pizza Margherita",
          description:
            "Molho de tomate, mussarela, manjericão fresco e azeite extra virgem",
          price: 45.9,
          image:
            "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop",
          category: "pizza",
          isVegetarian: true,
          isAvailable: true,
        },
        {
          id: "pepperoni",
          name: "Pizza Pepperoni",
          description: "Molho de tomate, mussarela e pepperoni italiano",
          price: 52.9,
          image:
            "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop",
          category: "pizza",
          isAvailable: true,
        },
        {
          id: "quattro-formaggi",
          name: "Pizza Quattro Formaggi",
          description:
            "Quatro queijos: mussarela, gorgonzola, parmesão e provolone",
          price: 58.9,
          image:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
          category: "pizza",
          isVegetarian: true,
          isAvailable: true,
        },
      ],
    },
    {
      id: "pasta",
      name: "Massas",
      description: "Massas frescas feitas diariamente",
      items: [
        {
          id: "carbonara",
          name: "Spaghetti Carbonara",
          description: "Spaghetti com ovos, bacon, parmesão e pimenta preta",
          price: 38.9,
          image:
            "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
          category: "pasta",
          isAvailable: true,
        },
        {
          id: "bolognese",
          name: "Penne Bolognese",
          description: "Penne com molho bolognese tradicional",
          price: 35.9,
          image:
            "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop",
          category: "pasta",
          isAvailable: true,
        },
      ],
    },
  ],
  "2": [
    {
      id: "burgers",
      name: "Hambúrguers",
      description: "Hambúrguers artesanais com carne 100% bovina",
      items: [
        {
          id: "classic",
          name: "Classic Burger",
          description:
            "Hambúrguer 180g, queijo cheddar, alface, tomate, cebola e molho especial",
          price: 28.9,
          image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
          category: "burger",
          isAvailable: true,
        },
        {
          id: "bacon",
          name: "Bacon Burger",
          description: "Classic + bacon crocante e cebola caramelizada",
          price: 34.9,
          image:
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
          category: "burger",
          isAvailable: true,
        },
      ],
    },
  ],
};

// Mock Reviews
export const mockReviews: Record<string, Review[]> = {
  "1": [
    {
      id: "1",
      userId: "1",
      restaurantId: "1",
      rating: 5,
      comment:
        "Pizza incrível! Massa fininha e ingredientes frescos. O ambiente é muito aconchegante.",
      createdAt: "2024-09-15T19:30:00Z",
      user: mockUsers[0],
    },
    {
      id: "2",
      userId: "2",
      restaurantId: "1",
      rating: 4,
      comment:
        "Ótima opção para jantar. O atendimento foi excelente e a carbonara estava perfeita.",
      createdAt: "2024-09-10T20:15:00Z",
      user: mockUsers[1],
    },
    {
      id: "3",
      userId: "4",
      restaurantId: "1",
      rating: 5,
      comment:
        "Como sommelier, recomendo! Excelente carta de vinhos que harmoniza perfeitamente com as massas.",
      createdAt: "2024-09-05T18:20:00Z",
      user: mockUsers[3],
    },
  ],
  "2": [
    {
      id: "4",
      userId: "3",
      restaurantId: "2",
      rating: 5,
      comment:
        "Melhor hambúrguer que já comi! Batata rústica crocante e molho especial único.",
      createdAt: "2024-09-20T21:45:00Z",
      user: mockUsers[2],
    },
    {
      id: "5",
      userId: "5",
      restaurantId: "2",
      rating: 4,
      comment:
        "Adorei a experiência! O milk-shake de chocolate é divino, lembra os doces da minha infância.",
      createdAt: "2024-09-18T20:30:00Z",
      user: mockUsers[4],
    },
  ],
  "3": [
    {
      id: "6",
      userId: "2",
      restaurantId: "3",
      rating: 5,
      comment:
        "Qualidade impecável! Peixe fresco e preparo tradicional japonês. Voltarei sempre!",
      createdAt: "2024-09-12T19:00:00Z",
      user: mockUsers[1],
    },
    {
      id: "7",
      userId: "4",
      restaurantId: "3",
      rating: 5,
      comment:
        "Experiência gastronômica única. O omakase é uma verdadeira viagem pelos sabores do Japão.",
      createdAt: "2024-09-08T20:45:00Z",
      user: mockUsers[3],
    },
  ],
  "4": [
    {
      id: "8",
      userId: "3",
      restaurantId: "4",
      rating: 5,
      comment:
        "Perfeito para quem busca alimentação saudável! Bowl nutritivo e saboroso, ingredientes fresquinhos.",
      createdAt: "2024-09-14T12:30:00Z",
      user: mockUsers[2],
    },
  ],
};

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: "1",
    userId: "1",
    restaurantId: "1",
    content:
      "Noite perfeita no Bella Napoli! A pizza margherita estava divina 🍕✨",
    imageUrl:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&h=600&fit=crop",
    imageUrls: '["https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&h=600&fit=crop"]',
    updatedAt: "2024-09-25T20:30:00Z",
    _count: { likes: 0, comments: 0 },
    postType: "FOOD",
    user: {
      id: mockUsers[0].id,
      username: mockUsers[0].username,
      name: mockUsers[0].name,
      avatar: mockUsers[0].avatar,
    },
    createdAt: "2024-09-25T20:30:00Z",
    likesCount: 24,
    commentsCount: 5,
    restaurant: mockRestaurants[0],
    isLiked: false,
  },
  {
    id: "2",
    userId: "2",
    restaurantId: "3",
    content:
      "Experiência incrível no Sushi Zen! O sashimi estava fresquíssimo 🍣",
    imageUrl:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=600&fit=crop",
    imageUrls: '["https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=600&fit=crop"]',
    updatedAt: "2024-09-25T20:30:00Z",
    _count: { likes: 0, comments: 0 },
    postType: "FOOD",
    user: {
      id: mockUsers[1].id,
      username: mockUsers[1].username,
      name: mockUsers[1].name,
      avatar: mockUsers[1].avatar,
    },
    createdAt: "2024-09-24T19:15:00Z",
    likesCount: 31,
    commentsCount: 8,
    restaurant: mockRestaurants[2],
    isLiked: true,
  },
  {
    id: "3",
    userId: "3",
    restaurantId: "4",
    content:
      "Almoço saudável e delicioso! Este bowl de quinoa estava perfeito 🥗",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop",
    imageUrls: '["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop"]',
    updatedAt: "2024-09-25T20:30:00Z",
    _count: { likes: 0, comments: 0 },
    postType: "FOOD",
    user: {
      id: mockUsers[2].id,
      username: mockUsers[2].username,
      name: mockUsers[2].name,
      avatar: mockUsers[2].avatar,
    },
    createdAt: "2024-09-23T13:45:00Z",
    likesCount: 18,
    commentsCount: 3,
    restaurant: mockRestaurants[3],
    isLiked: false,
  },
  {
    id: "4",
    userId: "1",
    restaurantId: "2",
    content: "Esse bacon burger é simplesmente épico! Não consegui resistir 🍔",
    imageUrl:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=600&fit=crop",
    imageUrls: '["https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=600&fit=crop"]',
    updatedAt: "2024-09-25T20:30:00Z",
    _count: { likes: 0, comments: 0 },
    postType: "FOOD",
    user: {
      id: mockUsers[0].id,
      username: mockUsers[0].username,
      name: mockUsers[0].name,
      avatar: mockUsers[0].avatar,
    },
    createdAt: "2024-09-22T21:00:00Z",
    likesCount: 27,
    commentsCount: 6,
    restaurant: mockRestaurants[1],
    isLiked: true,
  },
  {
    id: "5",
    userId: "2",
    restaurantId: "5",
    content: "Café da manhã perfeito! Esse cappuccino está no ponto ideal ☕",
    imageUrl:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=600&fit=crop",
    imageUrls: '["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=600&fit=crop"]',
    updatedAt: "2024-09-25T20:30:00Z",
    _count: { likes: 0, comments: 0 },
    postType: "FOOD",
    user: {
      id: mockUsers[1].id,
      username: mockUsers[1].username,
      name: mockUsers[1].name,
      avatar: mockUsers[1].avatar,
    },
    createdAt: "2024-09-21T09:30:00Z",
    likesCount: 15,
    commentsCount: 2,
    restaurant: mockRestaurants[4],
    isLiked: false,
  },
  {
    id: "6",
    userId: "4",
    restaurantId: "1",
    content:
      "A harmonização entre o vinho Chianti e a lasanha estava sublime! 🍷✨",
    imageUrl:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=600&fit=crop",
    imageUrls: '["https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=600&fit=crop"]',
    updatedAt: "2024-09-25T20:30:00Z",
    _count: { likes: 0, comments: 0 },
    postType: "FOOD",
    user: {
      id: mockUsers[3].id,
      username: mockUsers[3].username,
      name: mockUsers[3].name,
      avatar: mockUsers[3].avatar,
    },
    createdAt: "2024-09-20T21:15:00Z",
    likesCount: 32,
    commentsCount: 7,
    restaurant: mockRestaurants[0],
    isLiked: true,
  },
  {
    id: "7",
    userId: "5",
    restaurantId: "5",
    content:
      "Descobri o doce perfeito para acompanhar o café! Esse bolo de cenoura é incrível 🧁",
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=600&fit=crop",
    imageUrls: '["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=600&fit=crop"]',
    updatedAt: "2024-09-25T20:30:00Z",
    _count: { likes: 0, comments: 0 },
    postType: "FOOD",
    user: {
      id: mockUsers[4].id,
      username: mockUsers[4].username,
      name: mockUsers[4].name,
      avatar: mockUsers[4].avatar,
    },
    createdAt: "2024-09-19T15:45:00Z",
    likesCount: 28,
    commentsCount: 4,
    restaurant: mockRestaurants[4],
    isLiked: false,
  },
  {
    id: "8",
    userId: "6",
    restaurantId: "6",
    content:
      "Churrasco de domingo em família! A picanha estava no ponto perfeito 🥩",
    imageUrl:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=600&fit=crop",
    imageUrls: '["https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=600&fit=crop"]',
    updatedAt: "2024-09-25T20:30:00Z",
    _count: { likes: 0, comments: 0 },
    postType: "FOOD",
    user: {
      id: mockUsers[5].id,
      username: mockUsers[5].username,
      name: mockUsers[5].name,
      avatar: mockUsers[5].avatar,
    },
    createdAt: "2024-09-18T14:20:00Z",
    likesCount: 41,
    commentsCount: 9,
    restaurant: mockRestaurants[5],
    isLiked: true,
  },
];

// Popular search terms
export const popularSearches = [
  "Pizza",
  "Sushi",
  "Hambúrguer",
  "Café",
  "Italiano",
  "Japonês",
  "Saudável",
  "Delivery",
];

// Featured restaurants (for home screen)
export const featuredRestaurants = [
  mockRestaurants[0], // Bella Napoli
  mockRestaurants[2], // Sushi Zen
  mockRestaurants[3], // Green Bowl
];

// Restaurant categories for filtering
export const restaurantCategories = [
  { id: "all", name: "Todos", icon: "restaurant-outline" },
  { id: "italian", name: "Italiano", icon: "pizza-outline" },
  { id: "burger", name: "Hambúrguer", icon: "fast-food-outline" },
  { id: "sushi", name: "Sushi", icon: "fish-outline" },
  { id: "coffee", name: "Café", icon: "cafe-outline" },
  { id: "healthy", name: "Saudável", icon: "leaf-outline" },
  { id: "brazilian", name: "Brasileiro", icon: "restaurant-outline" },
];
