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

  // --- SIMPLIFIED FILTER STATES ---
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

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
    // search
    if (!item.title.toLowerCase().includes(search.toLowerCase())) return false;

    // category
    if (filterCategory !== "All" && item.category !== filterCategory)
      return false;

    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý chi tiêu</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Expense Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddExpense")}
        >
          <Text style={styles.addButtonText}>+ Thêm chi tiêu</Text>
        </TouchableOpacity>

        {/* SIMPLIFIED FILTER SECTION */}
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
                {showFilters ? "Ẩn lọc" : "Lọc"}
              </Text>
            </TouchableOpacity>
          </View>

          {showFilters && (
            <View style={styles.simpleFilterOptions}>
              <Text style={styles.filterLabel}>Lọc theo danh mục</Text>
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

              {/* Reset Filter Button */}
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

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredExpenses.length}</Text>
            <Text style={styles.statLabel}>khoản chi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {filteredExpenses
                .reduce((sum, item) => sum + item.amount, 0)
                .toLocaleString()}{" "}
              VND
            </Text>
            <Text style={styles.statLabel}>tổng chi</Text>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          <Text style={styles.sectionTitle}>Thống kê</Text>
          <ExpenseChart expenses={filteredExpenses} />
          <CategoryChart expenses={filteredExpenses} />
        </View>

        {/* Expense List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Danh sách chi tiêu</Text>
            <Text style={styles.itemCount}>{filteredExpenses.length}</Text>
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
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.expenseItem}
                  onPress={() =>
                    navigation.navigate("EditExpense", { expense: item })
                  }
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
      </ScrollView>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
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
  addButton: {
    backgroundColor: "#3b82f6",
    padding: 18,
    borderRadius: 16,
    marginVertical: 16,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  filterSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  chartsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  listSection: {
    marginBottom: 30,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  itemCount: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
});
