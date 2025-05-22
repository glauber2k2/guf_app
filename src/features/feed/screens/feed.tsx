import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Importe useSafeAreaInsets
import { useIsFocused } from "@react-navigation/native";
import { AntDesign, FontAwesome } from "@expo/vector-icons"; // FontAwesome para ícones de like/share/comment

// --- Tipagem para os Posts ---
interface Exercise {
  name: string;
  sets: number;
  reps: string; // Ex: "3x10", "4x8-12"
}

interface Post {
  id: string;
  user: {
    name: string;
    profilePicture: string;
  };
  date: string; // Formato de data, ex: "20 de Maio de 2025"
  description: string;
  exercises: Exercise[];
  likes: number;
  comments: number;
  shares: number;
  hasLiked: boolean; // Para controlar se o usuário atual deu like
}

// --- Dados Mockados ---
const MOCK_POSTS: Post[] = [
  {
    id: "1",
    user: {
      name: "Ana Fitness",
      profilePicture: "https://placehold.co/50x50/FFC0CB/000000?text=AF",
    },
    date: "20 de Maio de 2025",
    description:
      "Treino de pernas insano hoje! Quase não consegui andar depois. 🦵🔥",
    exercises: [
      { name: "Agachamento Livre", sets: 4, reps: "8-12" },
      { name: "Leg Press", sets: 3, reps: "10-15" },
      { name: "Cadeira Extensora", sets: 3, reps: "12-15" },
      { name: "Panturrilha em Pé", sets: 4, reps: "15-20" },
    ],
    likes: 120,
    comments: 15,
    shares: 5,
    hasLiked: false,
  },
  {
    id: "2",
    user: {
      name: "Bruno Força",
      profilePicture: "https://placehold.co/50x50/ADD8E6/000000?text=BF",
    },
    date: "19 de Maio de 2025",
    description:
      "Dia de peito e tríceps. Foco na execução e carga progressiva. 💪",
    exercises: [
      { name: "Supino Reto com Barra", sets: 4, reps: "6-10" },
      { name: "Crucifixo Halteres", sets: 3, reps: "10-12" },
      { name: "Desenvolvimento Militar", sets: 3, reps: "8-12" },
      { name: "Tríceps Corda", sets: 3, reps: "12-15" },
    ],
    likes: 95,
    comments: 8,
    shares: 3,
    hasLiked: true,
  },
  {
    id: "3",
    user: {
      name: "Carla Cardio",
      profilePicture: "https://placehold.co/50x50/90EE90/000000?text=CC",
    },
    date: "18 de Maio de 2025",
    description:
      "Corrida matinal de 5km e depois um HIIT rápido. Energia total! 🏃‍♀️💨",
    exercises: [
      { name: "Corrida (5km)", sets: 1, reps: "30 min" },
      { name: "Burpees", sets: 3, reps: "10" },
      { name: "Mountain Climbers", sets: 3, reps: "30s" },
    ],
    likes: 70,
    comments: 5,
    shares: 2,
    hasLiked: false,
  },
];

// --- Componente de Item de Post ---
interface PostItemProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  onLike,
  onComment,
  onShare,
}) => {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: post.user.profilePicture }}
          style={styles.postProfileImage}
        />
        <View>
          <Text style={styles.postUserName}>{post.user.name}</Text>
          <Text style={styles.postDate}>{post.date}</Text>
        </View>
      </View>

      <Text style={styles.postDescription}>{post.description}</Text>

      <View style={styles.exercisesContainer}>
        <Text style={styles.exercisesTitle}>Exercícios do Treino:</Text>
        {post.exercises.map((exercise, index) => (
          <Text key={index} style={styles.exerciseItem}>
            • {exercise.name}: {exercise.sets}x{exercise.reps}
          </Text>
        ))}
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity
          onPress={() => onLike(post.id)}
          style={styles.actionButton}
        >
          <FontAwesome
            name={post.hasLiked ? "heart" : "heart-o"}
            size={20}
            color={post.hasLiked ? "#e74c3c" : "#555"}
          />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onComment(post.id)}
          style={styles.actionButton}
        >
          <FontAwesome name="comment-o" size={20} color="#555" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onShare(post.id)}
          style={styles.actionButton}
        >
          <AntDesign name="sharealt" size={20} color="#555" />
          <Text style={styles.actionText}>{post.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Tela Principal de Feeds ---
export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused(); // Hook para verificar se a tela está em foco
  const insets = useSafeAreaInsets(); // Obtém as insets de segurança da tela

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Simula uma chamada de API
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setPosts(MOCK_POSTS); // Em uma API real: setPosts(response.data);
      } catch (error) {
        console.error("Erro ao carregar posts:", error);
        Alert.alert("Erro", "Não foi possível carregar os posts do feed.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []); // Executa apenas uma vez ao montar o componente

  const handleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
              hasLiked: !post.hasLiked,
            }
          : post
      )
    );
    // Em uma API real: enviar requisição para o backend para registrar o like
    console.log(`Like no post: ${postId}`);
  };

  const handleComment = (postId: string) => {
    Alert.alert(
      "Comentar",
      `Funcionalidade de comentar no post ${postId} em desenvolvimento.`
    );
    // Em uma API real: navegar para tela de comentários ou abrir modal
    console.log(`Comentar no post: ${postId}`);
  };

  const handleShare = (postId: string) => {
    Alert.alert(
      "Compartilhar",
      `Funcionalidade de compartilhar o post ${postId} em desenvolvimento.`
    );
    // Em uma API real: usar Share API do React Native
    console.log(`Compartilhar post: ${postId}`);
  };

  if (isLoading) {
    return (
      // Removida a SafeAreaView aqui para permitir que o conteúdo se estenda
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        {isFocused && (
          <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
        )}
        <ActivityIndicator size="large" color="#541cb6" />
        <Text style={styles.loadingText}>Carregando feed...</Text>
      </View>
    );
  }

  return (
    // Removida a SafeAreaView aqui para permitir que o conteúdo se estenda
    <View style={[styles.fullScreenContainer, { paddingTop: insets.top }]}>
      {/* StatusBar para esta tela: conteúdo escuro para fundo claro */}
      {isFocused && (
        <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
      )}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed de Treinos</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        )}
        // Ajuste o paddingBottom para compensar a barra de navegação flutuante
        contentContainerStyle={[
          styles.flatListContent,
          { paddingBottom: insets.bottom + 85 }, // insets.bottom + altura da tab bar (70) + bottom offset (15)
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  fullScreenContainer: {
    // Novo estilo para o container principal
    flex: 1,
    backgroundColor: "#f0f2f5", // Fundo claro para a tela
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#541cb6",
  },
  header: {
    padding: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  flatListContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  postCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  postProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  postUserName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  postDate: {
    fontSize: 12,
    color: "#777",
  },
  postDescription: {
    fontSize: 15,
    color: "#444",
    marginBottom: 10,
    lineHeight: 22,
  },
  exercisesContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  exercisesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
  },
  exerciseItem: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginTop: 5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#555",
  },
});
