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
import { updateExpense } from "../slices/expensesSlice";
import { useNavigation, useRoute } from "@react-navigation/native";
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

export default function EditExpenseScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { expense } = route.params;

  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState(expense.category);

  const handleUpdate = async () => {
    if (!title || !amount) {
      return Alert.alert("Error", "Please enter title and amount");
    }

    await dispatch(
      updateExpense({
        id: expense.id,
        title,
        amount: Number(amount),
        category,
        date: expense.date,
      })
    );
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Chỉnh sửa chi tiêu</Text>

        <Text style={styles.label}>Tiêu đề</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tiêu đề"
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

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Cập nhật</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    marginBottom: 6,
    fontWeight: "600",
    color: "#374151",
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
    marginBottom: 15,
    backgroundColor: "#f5f7ff",
  },

  updateButton: {
    backgroundColor: "#6366f1",
    padding: 15,
    borderRadius: 14,
    marginTop: 10,
  },

  updateButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
