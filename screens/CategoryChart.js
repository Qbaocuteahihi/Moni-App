import React from "react";
import { View, Dimensions, StyleSheet, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";

// Bảng màu cố định cho các danh mục
const CATEGORY_COLORS = {
  "Ăn uống": "#FF6B6B",
  "Mua sắm": "#4ECDC4", 
  "Di chuyển": "#FFD166",
  "Giải trí": "#6A0572",
  "Hóa đơn": "#06D6A0",
  "Y tế": "#118AB2",
  "Khác": "#073B4C"
};

export default function CategoryChart({ expenses }) {
  // Tính tổng chi tiêu theo danh mục
  const categoryTotals = {};
  let totalAmount = 0;
  
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    totalAmount += exp.amount;
  });

  // Chuyển đổi dữ liệu cho biểu đồ
  const chartData = Object.keys(categoryTotals).map((category) => {
    const amount = categoryTotals[category];
    const percentage = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : 0;
    
    return {
      name: category,
      population: amount,
      color: CATEGORY_COLORS[category] || "#999999",
      legendFontColor: "#374151",
      legendFontSize: 12,
      percentage: percentage
    };
  });

  const screenWidth = Dimensions.get("window").width - 40;

  // Nếu không có dữ liệu
  if (expenses.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chi tiêu theo danh mục</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Chưa có dữ liệu chi tiêu</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiêu theo danh mục</Text>
      
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={screenWidth}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute // Hiển thị giá trị tuyệt đối thay vì phần trăm
        />
      </View>

      {/* Hiển thị chi tiết số liệu bên dưới biểu đồ */}
      <ScrollView 
        style={styles.legendContainer}
        showsVerticalScrollIndicator={false}
      >
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={styles.legendColorContainer}>
              <View 
                style={[
                  styles.colorBox, 
                  { backgroundColor: item.color }
                ]} 
              />
              <Text style={styles.categoryName}>{item.name}</Text>
            </View>
            <View style={styles.legendValueContainer}>
              <Text style={styles.amountText}>
                {item.population.toLocaleString()} VND
              </Text>
              <Text style={styles.percentageText}>
                ({item.percentage}%)
              </Text>
            </View>
          </View>
        ))}
        
        {/* Tổng cộng */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalAmount}>
            {totalAmount.toLocaleString()} VND
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { 
    marginVertical: 10,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { 
    textAlign: "center", 
    marginBottom: 16, 
    fontWeight: "600",
    fontSize: 18,
    color: "#1f2937"
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  legendContainer: {
    maxHeight: 200,
  },
  legendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  legendColorContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  legendValueContainer: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  percentageText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
  },
  noDataContainer: {
    alignItems: "center",
    padding: 20,
  },
  noDataText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  }
});