import React from "react";
import { View, Dimensions, StyleSheet, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { BarChart } from "react-native-chart-kit";

export default function ExpenseChart({ expenses }) {
  // Xử lý dữ liệu theo tháng
  const processMonthlyData = () => {
    const monthlyExpenses = Array(12).fill(0);
    
    expenses.forEach(exp => {
      let date;
      // Kiểm tra định dạng date (có thể là timestamp, string, hoặc object với seconds)
      if (exp.date && exp.date.seconds) {
        // Firestore timestamp
        date = new Date(exp.date.seconds * 1000);
      } else if (exp.date instanceof Date) {
        // Date object
        date = exp.date;
      } else if (typeof exp.date === 'string') {
        // String date
        date = new Date(exp.date);
      } else {
        // Fallback: sử dụng ngày hiện tại
        date = new Date();
      }
      
      const month = date.getMonth(); // 0-11
      if (!isNaN(month) && month >= 0 && month < 12) {
        monthlyExpenses[month] += exp.amount;
      }
    });
    
    return monthlyExpenses;
  };

  const monthlyExpenses = processMonthlyData();
  const screenWidth = Dimensions.get("window").width - 40;

  // Tính tổng chi tiêu
  const totalExpenses = monthlyExpenses.reduce((sum, amount) => sum + amount, 0);

  // Tìm tháng có chi tiêu cao nhất
  const maxExpense = Math.max(...monthlyExpenses);
  const maxMonthIndex = monthlyExpenses.indexOf(maxExpense);

  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", 
                     "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

  // Nếu không có dữ liệu
  if (expenses.length === 0 || totalExpenses === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chi tiêu theo tháng</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Chưa có dữ liệu chi tiêu</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiêu theo tháng</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={{
            labels: ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"],
            datasets: [{ 
              data: monthlyExpenses 
            }]
          }}
          width={Math.max(screenWidth, 600)} // Đảm bảo đủ rộng để hiển thị
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
            style: { borderRadius: 16 },
            barPercentage: 0.5,
            propsForLabels: {
              fontSize: 10,
            },
            formatYLabel: (value) => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}K`;
              }
              return value.toString();
            }
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          showBarTops={false}
          withCustomBarColorFromData={true}
          flatColor={true}
        />
      </ScrollView>

      {/* Hiển thị thông tin thống kê */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tổng chi năm:</Text>
          <Text style={styles.statValue}>{totalExpenses.toLocaleString()} VND</Text>
        </View>
        {maxExpense > 0 && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Chi cao nhất:</Text>
            <Text style={styles.statValue}>
              {monthNames[maxMonthIndex]} - {maxExpense.toLocaleString()} VND
            </Text>
          </View>
        )}
      </View>

      {/* Hiển thị chi tiết từng tháng */}
      <View style={styles.detailContainer}>
        <Text style={styles.detailTitle}>Chi tiết theo tháng</Text>
        <ScrollView style={styles.monthList} showsVerticalScrollIndicator={false}>
          {monthlyExpenses.map((amount, index) => (
            <View key={index} style={styles.monthItem}>
              <Text style={styles.monthName}>{monthNames[index]}</Text>
              <View style={styles.amountContainer}>
                <Text style={[
                  styles.monthAmount, 
                  amount > 0 ? styles.hasExpense : styles.noExpense
                ]}>
                  {amount > 0 ? amount.toLocaleString() + ' VND' : 'Không có chi tiêu'}
                </Text>
                {amount > 0 && (
                  <Text style={styles.percentage}>
                    ({((amount / totalExpenses) * 100).toFixed(1)}%)
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
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
  noDataContainer: {
    alignItems: "center",
    padding: 20,
  },
  noDataText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  statsContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "600",
  },
  detailContainer: {
    marginTop: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  monthList: {
    maxHeight: 200,
  },
  monthItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  monthName: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  amountContainer: {
    alignItems: "flex-end",
    flex: 1,
  },
  monthAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  hasExpense: {
    color: "#1f2937",
  },
  noExpense: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
  percentage: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  }
});