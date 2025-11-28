import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
  const [focusedInput, setFocusedInput] = useState(null);

  const handleAdd = async () => {
    if (!title.trim()) {
      return Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề chi tiêu");
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return Alert.alert("Số tiền không hợp lệ", "Vui lòng nhập số tiền lớn hơn 0");
    }

    try {
      await dispatch(
        addExpense({
          title: title.trim(),
          amount: Number(amount),
          category,
          date: new Date().toISOString(),
        })
      ).unwrap();

      Alert.alert("Thành công", "Đã thêm chi tiêu mới", [
        { 
          text: "Tiếp tục", 
          style: "default", 
          onPress: () => {
            setTitle("");
            setAmount("");
            setCategory(categories[0]);
          }
        },
        { 
          text: "Xong", 
          style: "cancel", 
          onPress: () => navigation.goBack() 
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thêm chi tiêu. Vui lòng thử lại.");
    }
  };

  const handleAmountChange = (text) => {
    const cleaned = text.replace(/[^\d]/g, '');
    setAmount(cleaned);
  };

  const formatAmount = (value) => {
    return value ? parseInt(value).toLocaleString('vi-VN') : '';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header Minimal */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>×</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm chi tiêu mới</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Form */}
        <View style={styles.formContainer}>
          
          {/* Amount Input - Featured */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Số tiền</Text>
            <View style={[
              styles.amountInputContainer,
              focusedInput === 'amount' && styles.inputFocused
            ]}>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={formatAmount(amount)}
                onChangeText={handleAmountChange}
                onFocus={() => setFocusedInput('amount')}
                onBlur={() => setFocusedInput(null)}
              />
              <Text style={styles.currencyText}>VND</Text>
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'title' && styles.inputFocused
              ]}
              placeholder="Nhập mô tả chi tiêu..."
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
              onFocus={() => setFocusedInput('title')}
              onBlur={() => setFocusedInput(null)}
            />
            <Text style={styles.charCount}>{title.length}/50</Text>
          </View>

          {/* Category Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Danh mục</Text>
            <View style={[
              styles.pickerContainer,
              focusedInput === 'category' && styles.inputFocused
            ]}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={styles.picker}
                dropdownIconColor="#64748b"
                onFocus={() => setFocusedInput('category')}
                onBlur={() => setFocusedInput(null)}
              >
                {categories.map((cat, index) => (
                  <Picker.Item 
                    key={index} 
                    label={cat} 
                    value={cat} 
                    color="#1e293b"
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Date Info */}
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Ngày thêm</Text>
            <Text style={styles.dateValue}>
              {new Date().toLocaleDateString('vi-VN', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickAmounts}>
            <Text style={styles.quickLabel}>Chọn nhanh</Text>
            <View style={styles.amountChips}>
              {[50000, 100000, 200000, 500000].map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.amountChip,
                    amount === quickAmount.toString() && styles.amountChipActive
                  ]}
                  onPress={() => setAmount(quickAmount.toString())}
                >
                  <Text style={[
                    styles.amountChipText,
                    amount === quickAmount.toString() && styles.amountChipTextActive
                  ]}>
                    {quickAmount.toLocaleString('vi-VN')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Fixed Action Button */}
      <View style={styles.actionBar}>
        <View style={styles.preview}>
          {title && (
            <Text style={styles.previewTitle} numberOfLines={1}>
              {title}
            </Text>
          )}
          {amount && (
            <Text style={styles.previewAmount}>
              {formatAmount(amount)} VND
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            (!title || !amount) && styles.addButtonDisabled
          ]}
          onPress={handleAdd}
          disabled={!title || !amount}
        >
          <Text style={styles.addButtonText}>
            {!title || !amount ? "Thêm chi tiêu" : `Thêm • ${formatAmount(amount)} VND`}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    color: "#64748b",
    fontWeight: "300",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e293b",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for action bar
  },
  formContainer: {
    padding: 20,
  },
  // Amount Section
  amountSection: {
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
    paddingVertical: 8,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginLeft: 8,
  },
  // Input Groups
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  inputFocused: {
    borderColor: "#3b82f6",
    backgroundColor: "#f8fafc",
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  // Picker
  pickerContainer: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: {
    height: 56,
  },
  // Date Info
  dateInfo: {
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  // Quick Amounts
  quickAmounts: {
    marginBottom: 24,
  },
  quickLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 12,
  },
  amountChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amountChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 20,
  },
  amountChipActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  amountChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  amountChipTextActive: {
    color: "#fff",
  },
  // Action Bar
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  preview: {
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 2,
  },
  previewAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#3b82f6",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonDisabled: {
    backgroundColor: "#cbd5e1",
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});