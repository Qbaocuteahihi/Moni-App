import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useDispatch } from "react-redux";
import { addExpense } from "../slices/expensesSlice";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

const categories = [
  "Ăn uống",
  "Mua sắm",
  "Di chuyển",
  "Giải trí",
  "Hóa đơn",
  "Y tế",
  "Khác",
];

export default function AddExpenseScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);

  const handleAdd = async () => {
    if (!title || !amount) {
      return Alert.alert("Error", "Please enter title and amount");
    }

    await dispatch(
      addExpense({
        title,
        amount: Number(amount),
        category,
      })
    );
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Thêm chi tiêu mới</Text>

        <Text style={styles.label}>Tiêu đề</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Cafe, ăn sáng..."
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Số tiền</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 45000"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Danh mục</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
          >
            {categories.map((cat, index) => (
              <Picker.Item key={index} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+ Thêm chi tiêu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff", // pastel tím nhẹ
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },

  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4f46e5",
    textAlign: "center",
  },

  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#c7d2fe",
    backgroundColor: "#f5f7ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#c7d2fe",
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#f5f7ff",
  },

  addButton: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 14,
    marginTop: 10,
  },

  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
