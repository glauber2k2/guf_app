// screens/GroupsScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import { LinearGradient } from "expo-linear-gradient";
import { Group } from "../../../shared/types";

const { height: screenHeight } = Dimensions.get("window");
const GroupsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isCreateGroupModalVisible, setCreateGroupModalVisible] =
    useState(false);
  const [isJoinGroupModalVisible, setJoinGroupModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const [isCustomAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState("");
  const [customAlertMessage, setCustomAlertMessage] = useState("");
  const [customAlertActions, setCustomAlertActions] = useState<
    { text: string; onPress: () => void; style?: "cancel" | "destructive" }[]
  >([]);

  const showCustomAlert = (
    title: string,
    message: string,
    actions: {
      text: string;
      onPress: () => void;
      style?: "cancel" | "destructive";
    }[] = [{ text: "OK", onPress: () => setCustomAlertVisible(false) }]
  ) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertActions(actions);
    setCustomAlertVisible(true);
  };

  const fetchGroupsFromApi = async (): Promise<Group[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const apiGroups: Group[] = [
          {
            id: "group-1",
            name: "Corredores Urbanos",
            isPinned: false,
            leaderPoints: 1200,
            userPoints: 850,
          },
          {
            id: "group-2",
            name: "Desafio 30 Dias Fitness",
            isPinned: true,
            leaderPoints: 2500,
            userPoints: 2300,
          },
          {
            id: "group-3",
            name: "Yoga & Meditação",
            isPinned: false,
            leaderPoints: 700,
            userPoints: 680,
          },
          {
            id: "group-4",
            name: "CrossFit Warriors",
            isPinned: false,
            leaderPoints: 3000,
            userPoints: 1500,
          },
          {
            id: "group-5",
            name: "Ciclismo de Estrada JP",
            isPinned: true,
            leaderPoints: 1800,
            userPoints: 1750,
          },
          {
            id: "group-6",
            name: "Treino Funcional em Casa",
            isPinned: false,
            leaderPoints: 900,
            userPoints: 400,
          },
        ];
        resolve(apiGroups);
      }, 1000);
    });
  };

  const createGroupViaApi = async (groupName: string): Promise<Group> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newGroup: Group = {
          id: `new-group-${Date.now()}`,
          name: groupName,
          isPinned: false,
          leaderPoints: 0,
          userPoints: 0,
        };
        resolve(newGroup);
      }, 500);
    });
  };

  const joinGroupViaApi = async (groupId: string): Promise<Group | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allPossibleGroups: Group[] = [
          {
            id: "group-1",
            name: "Corredores Urbanos",
            isPinned: false,
            leaderPoints: 1200,
            userPoints: 850,
          },
          {
            id: "group-2",
            name: "Desafio 30 Dias Fitness",
            isPinned: true,
            leaderPoints: 2500,
            userPoints: 2300,
          },
          {
            id: "group-3",
            name: "Yoga & Meditação",
            isPinned: false,
            leaderPoints: 700,
            userPoints: 680,
          },
          {
            id: "group-4",
            name: "CrossFit Warriors",
            isPinned: false,
            leaderPoints: 3000,
            userPoints: 1500,
          },
          {
            id: "group-5",
            name: "Ciclismo de Estrada JP",
            isPinned: true,
            leaderPoints: 1800,
            userPoints: 1750,
          },
          {
            id: "group-6",
            name: "Treino Funcional em Casa",
            isPinned: false,
            leaderPoints: 900,
            userPoints: 400,
          },
          {
            id: "secret-squad-789",
            name: "Elite Bodybuilders",
            isPinned: false,
            leaderPoints: 5000,
            userPoints: 100,
          },
        ];
        const foundGroup = allPossibleGroups.find((g) => g.id === groupId);

        if (foundGroup) {
          return {
            ...foundGroup,
            userPoints: Math.floor(Math.random() * 1000) + 100,
          };
        }
        resolve(foundGroup || null);
      }, 500);
    });
  };

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    let fetchedGroups: Group[] = [];
    let connected: boolean = false;

    try {
      const netInfoState = await NetInfo.fetch();
      connected = !!(
        netInfoState.isConnected && netInfoState.isInternetReachable
      );
      setIsOffline(!connected);

      if (!connected) {
        setGroups([]);
        setIsLoading(false);
        return;
      }

      try {
        fetchedGroups = await fetchGroupsFromApi();
      } catch (apiError) {
        showCustomAlert(
          "Erro",
          "Não foi possível carregar os grupos da API. Tente novamente."
        );
        fetchedGroups = [];
      }
    } catch (error) {
      setIsOffline(true);
      setGroups([]);
      setIsLoading(false);
      return;
    }

    const sortedGroups = fetchedGroups.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.name.localeCompare(b.name);
    });
    setGroups(sortedGroups);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
      const unsubscribe = NetInfo.addEventListener((state) => {
        const currentConnectionStatus: boolean = !!(
          state.isConnected && state.isInternetReachable
        );

        if (
          currentConnectionStatus !== !isOffline ||
          (currentConnectionStatus && groups.length === 0)
        ) {
          loadGroups();
        }
      });
      return () => unsubscribe();
    }, [loadGroups, groups.length, isOffline])
  );

  const handleCreateGroup = async () => {
    if (newGroupName.trim() === "") {
      showCustomAlert("Erro", "Por favor, insira um nome para o grupo.");
      return;
    }

    try {
      await createGroupViaApi(newGroupName.trim());
      setNewGroupName("");
      setCreateGroupModalVisible(false);
      showCustomAlert("Sucesso", `Grupo "${newGroupName.trim()}" criado!`);
      loadGroups();
    } catch (error) {
      showCustomAlert(
        "Erro",
        "Não foi possível criar o grupo. Tente novamente."
      );
    }
  };

  const handleJoinGroup = async () => {
    if (joinGroupId.trim() === "") {
      showCustomAlert("Erro", "Por favor, insira o ID do grupo.");
      return;
    }

    try {
      const groupToJoin = await joinGroupViaApi(joinGroupId.trim());

      if (groupToJoin) {
        const isAlreadyInGroup = groups.some((g) => g.id === groupToJoin.id);
        if (isAlreadyInGroup) {
          showCustomAlert(
            "Atenção",
            `Você já faz parte do grupo "${groupToJoin.name}".`
          );
          setJoinGroupId("");
          setJoinGroupModalVisible(false);
          return;
        }
        showCustomAlert(
          "Sucesso",
          `Você entrou no grupo "${groupToJoin.name}"!`
        );
        loadGroups();
      } else {
        showCustomAlert("Erro", "Grupo não encontrado. Verifique o ID.");
      }
    } catch (error) {
      showCustomAlert(
        "Erro",
        "Não foi possível entrar no grupo. Tente novamente."
      );
    }

    setJoinGroupId("");
    setJoinGroupModalVisible(false);
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGroupItem = ({ item }: { item: Group }) => (
    <View style={styles.groupItemContainer}>
      <Text style={styles.groupItemTitle}>{item.name}</Text>
      <View style={styles.groupCard}>
        <View style={styles.profilePhotoArea}>
          <Ionicons name="people-circle-outline" size={100} color="#ccc" />
        </View>

        <View style={styles.pointsStrip}>
          <View style={styles.leaderInfo}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.pointsText}>
              Líder: {item.leaderPoints} pts
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={24} color="#ADD8E6" />
            <Text style={styles.pointsText}>Seus: {item.userPoints} pts</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={["#a82dd3", "#432cc9"]}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIcon}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Meus Grupos</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="options-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <View>
          <Text
            style={{
              width: 250,
              fontSize: 50,
              color: "#ffffff99",
              fontWeight: "bold",
            }}
          >
            Dispute com seus amigos.
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.concaveCurveBackground} />

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionCircleButton}
          onPress={() =>
            showCustomAlert(
              "Pesquisar",
              "Funcionalidade de pesquisa será implementada."
            )
          }
        >
          <Ionicons name="search" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCircleButton}
          onPress={() => setCreateGroupModalVisible(true)}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCircleButton}
          onPress={() =>
            showCustomAlert(
              "Favoritos",
              "Funcionalidade de favoritos será implementada."
            )
          }
        >
          <Ionicons name="heart-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#541cb6" />
          <Text style={styles.loadingText}>Carregando grupos...</Text>
        </View>
      ) : isOffline ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#db4045" />
          <Text style={styles.emptyStateText}>Sem Conexão!</Text>
          <Text style={styles.emptyStateSubText}>
            Não foi possível carregar os grupos. Verifique sua internet.
          </Text>
        </View>
      ) : filteredGroups.length === 0 && searchQuery !== "" ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="search-outline" size={80} color="#ccc" />
          <Text style={styles.emptyStateText}>Nenhum grupo encontrado.</Text>
          <Text style={styles.emptyStateSubText}>
            Tente uma pesquisa diferente.
          </Text>
        </View>
      ) : filteredGroups.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="people-outline" size={80} color="#ccc" />
          <Text style={styles.emptyStateText}>Nenhum grupo ainda.</Text>
          <Text style={styles.emptyStateSubText}>
            Crie ou entre em um para começar!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          scrollEnabled={false}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={isCustomAlertVisible}
        onRequestClose={() => setCustomAlertVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{customAlertTitle}</Text>
            <Text style={styles.modalText}>{customAlertMessage}</Text>
            <View style={styles.modalButtonContainer}>
              {customAlertActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalButton,
                    action.style === "cancel"
                      ? styles.modalCancelButton
                      : action.style === "destructive"
                      ? styles.modalDestructiveButton
                      : styles.modalConfirmButton,
                  ]}
                  onPress={action.onPress}
                >
                  <Text style={styles.modalButtonText}>{action.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isCreateGroupModalVisible}
        onRequestClose={() => setCreateGroupModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Criar Novo Grupo</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome do Grupo"
              value={newGroupName}
              onChangeText={setNewGroupName}
              autoCapitalize="words"
              placeholderTextColor="#888"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setCreateGroupModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleCreateGroup}
              >
                <Text style={styles.modalButtonText}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isJoinGroupModalVisible}
        onRequestClose={() => setJoinGroupModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Entrar em Grupo</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="ID do Grupo"
              value={joinGroupId}
              onChangeText={setJoinGroupId}
              autoCapitalize="none"
              placeholderTextColor="#888"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setJoinGroupModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleJoinGroup}
              >
                <Text style={styles.modalButtonText}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  gradientHeader: {
    height: screenHeight * 0.5,
    paddingTop: Platform.OS === "android" ? 20 : 40,
    paddingBottom: 20,
    position: "relative",
    zIndex: 0,
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  headerIcon: {
    padding: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  concaveCurveBackground: {
    backgroundColor: "#f4f4f4",
    height: 50,
    width: "100%",
    borderTopLeftRadius: "100%",
    borderTopRightRadius: "100%",
    marginTop: -50,
    zIndex: 1,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: -80,
    marginBottom: 20,
    zIndex: 2,
  },
  actionCircleButton: {
    backgroundColor: "#000",
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#777",
    marginTop: 10,
    fontWeight: "bold",
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },

  groupItemContainer: {
    marginBottom: 25,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  groupItemTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  groupCard: {
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    height: 200,
  },
  profilePhotoArea: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  pointsStrip: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  leaderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },

  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: "#db4045",
  },
  modalConfirmButton: {
    backgroundColor: "#541cb6",
  },
  modalDestructiveButton: {
    backgroundColor: "#db4045",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default GroupsScreen;
