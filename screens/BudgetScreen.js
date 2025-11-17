import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";
import { useSelector } from "react-redux";

export default function BudgetScreen() {
  const [budget, setBudget] = useState("5000000");
  const expenses = useSelector(state => state.expenses.items);

  const currentMonth = new Date().getMonth();
  const totalSpent = expenses
    .filter(e => new Date(e.date).getMonth() === currentMonth)
    .reduce((sum, x) => sum + x.amount, 0);

  const percent = Math.min(totalSpent / budget, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ngân sách tháng</Text>

      <Text style={styles.label}>Đặt ngân sách</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
      />

      <Text style={styles.summary}>
        Đã chi: {totalSpent.toLocaleString()} / {Number(budget).toLocaleString()} VND
      </Text>

      <Progress.Bar
        progress={percent}
        width={null}
        height={18}
        color={percent >= 1 ? "red" : "#4f46e5"}
        unfilledColor="#e5e7eb"
        borderWidth={0}
        style={{ borderRadius: 10, marginTop: 10 }}
      />

      <Text style={styles.percent}>{Math.round(percent * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#374151",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    marginBottom: 15,
  },
  summary: {
    fontSize: 16,
    marginBottom: 10,
    color: "#374151",
  },
  percent: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    color: "#4f46e5",
    fontWeight: "bold",
  },
});
