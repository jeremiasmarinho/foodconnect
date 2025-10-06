import { useState, useEffect } from "react";
import { PostData, EstablishmentType } from "../types";

export const usePost = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Simular dados de posts (depois será conectado com a API)
  const mockPosts: PostData[] = [
    {
      id: "1",
      userId: "user1",
      user: {
        id: "user1",
        username: "chef_marco",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        isVerified: true,
      },
      images: [
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop",
      ],
      content:
        "🍝 Massa fresca do dia com molho de tomate caseiro e manjericão colhido na hora! O segredo está na simplicidade dos ingredientes frescos. #MassaFresca #CozinhaItaliana #ChefLife",
      location: "Restaurante Nonna",
      likesCount: 1247,
      commentsCount: 89,
      postType: "FOOD",
      isLiked: false,
      isSaved: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      establishment: {
        id: "rest1",
        name: "Restaurante Nonna",
        type: "RESTAURANT" as EstablishmentType,
        address: "Rua dos Sabores, 123",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: "2",
      userId: "user2",
      user: {
        id: "user2",
        username: "maria_gourmet",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b9cbb4e4?w=150&h=150&fit=crop&crop=face",
        isVerified: false,
      },
      images: [
        "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=400&fit=crop",
      ],
      content:
        "🥗 Salada mediterrânea com ingredientes orgânicos! Rúcula, tomate cereja, queijo de cabra, nozes e um toque especial de vinagrete balsâmico. Perfeito para um almoço leve e nutritivo! 💚",
      postType: "FOOD",
      location: "São Paulo, SP",
      likesCount: 892,
      commentsCount: 34,
      isLiked: true,
      isSaved: true,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    },
    {
      id: "3",
      userId: "user3",
      user: {
        id: "user3",
        username: "sushimaster_ken",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        isVerified: true,
      },
      images: [
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=400&fit=crop",
      ],
      content:
        "🍣 Omakase especial da noite! Seleção premium de sashimis frescos direto do mercado de peixes. Cada peça é uma experiência única de sabor e textura. Arigato gozaimasu! 🙏",
      postType: "FOOD",
      location: "Sushi Ken",
      likesCount: 2156,
      commentsCount: 156,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      establishment: {
        id: "rest2",
        name: "Sushi Ken",
        type: "RESTAURANT" as EstablishmentType,
        address: "Rua Japão, 456",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-890",
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: "4",
      userId: "user4",
      user: {
        id: "user4",
        username: "doceria_bella",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        isVerified: false,
      },
      images: [
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
      ],
      content:
        "🧁 Cupcakes de chocolate belga com cobertura de cream cheese! Feitos com muito amor e ingredientes premium. Disponível para encomendas! 💕 #Cupcakes #ChocolateBelga #DocesBella",
      postType: "FOOD",
      location: "Doceria Bella Vista",
      likesCount: 634,
      commentsCount: 67,
      isLiked: true,
      isSaved: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      establishment: {
        id: "rest3",
        name: "Doceria Bella Vista",
        type: "RESTAURANT" as EstablishmentType,
        address: "Rua das Flores, 789",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-321",
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: "5",
      userId: "user5",
      user: {
        id: "user5",
        username: "burguer_station",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        isVerified: true,
      },
      images: [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=400&fit=crop",
      ],
      content:
        "🍔 Double Bacon Cheeseburger! Dois hambúrgueres suculentos, queijo cheddar derretido, bacon crocante e nosso molho especial. O clássico que nunca sai de moda! 🔥",
      location: "Burger Station Downtown",
      postType: "FOOD",
      likesCount: 1823,
      commentsCount: 203,
      isLiked: false,
      isSaved: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      establishment: {
        id: "rest4",
        name: "Burger Station",
        type: "RESTAURANT" as EstablishmentType,
        address: "Av. Central, 1000",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-000",
        createdAt: new Date().toISOString(),
      },
    },
  ];

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Simular carregamento da API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPosts(mockPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = async () => {
    setRefreshing(true);
    try {
      // Simular refresh da API
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPosts([...mockPosts]); // Simular novos posts
    } catch (error) {
      console.error("Error refreshing posts:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleLike = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked
                ? post.likesCount - 1
                : post.likesCount + 1,
            }
          : post
      )
    );
  };

  const toggleSave = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );
  };

  const openComments = (postId: string) => {
    console.log("Opening comments for post:", postId);
    // Implementar navegação para tela de comentários
  };

  const sharePost = (postId: string) => {
    console.log("Sharing post:", postId);
    // Implementar compartilhamento
  };

  const openUserProfile = (userId: string) => {
    console.log("Opening profile for user:", userId);
    // Implementar navegação para perfil do usuário
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return {
    posts,
    loading,
    refreshing,
    refreshPosts,
    toggleLike,
    toggleSave,
    openComments,
    sharePost,
    openUserProfile,
  };
};
