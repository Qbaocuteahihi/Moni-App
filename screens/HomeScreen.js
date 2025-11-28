import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { fetchExpenses, deleteExpense } from "../slices/expensesSlice";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import ExpenseChart from "../components/ExpenseChart";
import CategoryChart from "./CategoryChart";
import SmartAlert from '../components/SmartAlert';

const { width } = Dimensions.get("window");
const categories = [
  "Ăn uống",
  "Mua sắm",
  "Di chuyển",
  "Giải trí",
  "Hóa đơn",
  "Y tế",
  "Khác",
];

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const expenses = useSelector((state) => state.expenses.items);

  // --- STATES ---
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, list, stats

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  const handleDelete = (id) => {
    Alert.alert(
      "Xóa chi tiêu",
      "Bạn có chắc chắn muốn xóa khoản chi tiêu này?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: () => dispatch(deleteExpense(id)) },
      ]
    );
  };

  const filteredExpenses = expenses.filter((item) => {
    if (!item.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory !== "All" && item.category !== filterCategory) return false;
    return true;
  });

  // Tính tổng chi
  const totalExpenses = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Cảnh báo thông minh */}
            <SmartAlert expenses={expenses} />

            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{filteredExpenses.length}</Text>
                <Text style={styles.statLabel}>khoản chi</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {totalExpenses.toLocaleString()} VND
                </Text>
                <Text style={styles.statLabel}>tổng chi</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {filteredExpenses.length > 0 
                    ? Math.round(totalExpenses / filteredExpenses.length).toLocaleString()
                    : "0"
                  } VND
                </Text>
                <Text style={styles.statLabel}>trung bình</Text>
              </View>
            </View>

            {/* Biểu đồ danh mục (tóm tắt) */}
            <View style={styles.chartSummary}>
              <Text style={styles.sectionTitle}>Phân bổ chi tiêu</Text>
              <CategoryChart expenses={filteredExpenses} />
            </View>

            {/* Chi tiêu gần đây */}
            <View style={styles.recentSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Chi tiêu gần đây</Text>
                <TouchableOpacity onPress={() => setActiveTab("list")}>
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>
              {filteredExpenses.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentItem}
                  onPress={() => navigation.navigate("EditExpense", { expense: item })}
                >
                  <View style={styles.recentLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category) }]} />
                    <View>
                      <Text style={styles.recentTitle}>{item.title}</Text>
                      <Text style={styles.recentCategory}>{item.category}</Text>
                    </View>
                  </View>
                  <View style={styles.recentRight}>
                    <Text style={styles.recentAmount}>{item.amount.toLocaleString()} VND</Text>
                    <Text style={styles.recentDate}>
                      {item.date ? new Date(item.date).toLocaleDateString("vi-VN") : ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {filteredExpenses.length === 0 && (
                <View style={styles.emptyRecent}>
                  <Text style={styles.emptyText}>Chưa có chi tiêu nào</Text>
                </View>
              )}
            </View>
          </ScrollView>
        );

      case "list":
        return (
          <View style={styles.tabContent}>
            {/* Bộ lọc */}
            <View style={styles.filterSection}>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm chi tiêu..."
                  placeholderTextColor="#9ca3af"
                  value={search}
                  onChangeText={setSearch}
                />
                <TouchableOpacity
                  style={styles.filterToggleButton}
                  onPress={() => setShowFilters(!showFilters)}
                >
                  <Text style={styles.filterToggleText}>
                    {showFilters ? "Ẩn" : "Lọc"}
                  </Text>
                </TouchableOpacity>
              </View>

              {showFilters && (
                <View style={styles.simpleFilterOptions}>
                  <Text style={styles.filterLabel}>Danh mục</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={filterCategory}
                      style={styles.picker}
                      onValueChange={setFilterCategory}
                      dropdownIconColor="#6b7280"
                    >
                      <Picker.Item label="Tất cả danh mục" value="All" />
                      {categories.map((c) => (
                        <Picker.Item key={c} label={c} value={c} />
                      ))}
                    </Picker>
                  </View>

                  {(search || filterCategory !== "All") && (
                    <TouchableOpacity
                      style={styles.resetFilterButton}
                      onPress={() => {
                        setSearch("");
                        setFilterCategory("All");
                      }}
                    >
                      <Text style={styles.resetFilterText}>Xóa bộ lọc</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Danh sách */}
            <View style={styles.listContainer}>
              <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>
                  Danh sách chi tiêu ({filteredExpenses.length})
                </Text>
              </View>

              {filteredExpenses.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.noDataText}>Không tìm thấy chi tiêu nào</Text>
                  <Text style={styles.noDataSubText}>
                    {search || filterCategory !== "All"
                      ? "Hãy thử thay đổi bộ lọc"
                      : "Thêm chi tiêu mới để bắt đầu"}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredExpenses}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.expenseItem}
                      onPress={() => navigation.navigate("EditExpense", { expense: item })}
                    >
                      <View style={styles.expenseContent}>
                        <View style={styles.expenseMain}>
                          <Text style={styles.expenseTitle}>{item.title}</Text>
                          <Text style={styles.expenseAmount}>
                            {item.amount.toLocaleString()} VND
                          </Text>
                        </View>
                        <View style={styles.expenseDetails}>
                          <View
                            style={[
                              styles.categoryBadge,
                              { backgroundColor: getCategoryColor(item.category) },
                            ]}
                          >
                            <Text style={styles.categoryText}>{item.category}</Text>
                          </View>
                          <Text style={styles.expenseDate}>
                            {item.date
                              ? new Date(item.date).toLocaleDateString("vi-VN")
                              : ""}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item.id)}
                      >
                        <Text style={styles.deleteText}>✕</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        );

      case "stats":
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.statsHeader}>
              <View style={styles.statCard}>
                <Text style={styles.statCardValue}>{filteredExpenses.length}</Text>
                <Text style={styles.statCardLabel}>Số giao dịch</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statCardValue}>{totalExpenses.toLocaleString()}</Text>
                <Text style={styles.statCardLabel}>Tổng chi tiêu</Text>
              </View>
            </View>

            <View style={styles.chartsSection}>
              <Text style={styles.sectionTitle}>Chi tiêu theo tháng</Text>
              <ExpenseChart expenses={filteredExpenses} />
            </View>

            <View style={styles.chartsSection}>
              <Text style={styles.sectionTitle}>Phân bổ theo danh mục</Text>
              <CategoryChart expenses={filteredExpenses} />
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý chi tiêu</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>
            📊 Tổng quan
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === "list" && styles.activeTab]}
          onPress={() => setActiveTab("list")}
        >
          <Text style={[styles.tabText, activeTab === "list" && styles.activeTabText]}>
            📝 Danh sách
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === "stats" && styles.activeTab]}
          onPress={() => setActiveTab("stats")}
        >
          <Text style={[styles.tabText, activeTab === "stats" && styles.activeTabText]}>
            📈 Thống kê
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddExpense")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Helper function for category colors
const getCategoryColor = (category) => {
  const colors = {
    "Ăn uống": "#ef4444",
    "Mua sắm": "#3b82f6",
    "Di chuyển": "#f59e0b",
    "Giải trí": "#8b5cf6",
    "Hóa đơn": "#10b981",
    "Y tế": "#ec4899",
    Khác: "#6b7280",
  };
  return colors[category] || "#6b7280";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#f8fafc",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
  },
  // Tab Styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    flex: 1,
  },
  // FAB Styles
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  // Overview Tab Styles
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  chartSummary: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recentSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  seeAllText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  recentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  recentCategory: {
    fontSize: 12,
    color: "#6b7280",
  },
  recentRight: {
    alignItems: "flex-end",
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  emptyRecent: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
  },
  // List Tab Styles
  filterSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    marginRight: 12,
  },
  filterToggleButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  filterToggleText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  simpleFilterOptions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    overflow: "hidden",
    marginBottom: 12,
  },
  picker: {
    height: 50,
  },
  resetFilterButton: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  resetFilterText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    marginBottom: 16,
    marginTop: 16,
  },
  expenseItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  expenseContent: {
    flex: 1,
  },
  expenseMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 12,
  },
  expenseAmount: {
    fontSize: 17,
    fontWeight: "700",
    color: "#059669",
  },
  expenseDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  expenseDate: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  deleteText: {
    color: "#ef4444",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  noDataText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8,
  },
  noDataSubText: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
  },
  // Stats Tab Styles
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  chartsSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});

