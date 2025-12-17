import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';
import monthlyManager from '../utils/monthlyManager';

const DailyTracker = () => {
  const expenses = useSelector((state) => state.expenses.items);
  const incomes = useSelector((state) => state.incomes.items);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  // Format số tiền thông minh
  const formatSmartCurrency = (amount) => {
    if (amount === 0) return '0 ₫';
    
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} tr`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  // Lấy dữ liệu chi tiêu tháng hiện tại
  const currentMonth = monthlyManager.getCurrentMonthInfo();
  const monthExpenses = expenses.filter(e => e.monthId === currentMonth?.id);
  const monthIncomes = incomes.filter(i => i.monthId === currentMonth?.id);

  // Phân tích chi tiêu theo ngày
  const getDailyData = () => {
    const dailyData = {};
    
    monthExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = {
          date: dateStr,
          expenses: [],
          totalExpense: 0,
          incomes: [],
          totalIncome: 0,
          expenseCount: 0,
        };
      }
      
      dailyData[dateStr].expenses.push(expense);
      dailyData[dateStr].totalExpense += expense.amount;
      dailyData[dateStr].expenseCount++;
    });
    
    monthIncomes.forEach(income => {
      const date = new Date(income.date);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = {
          date: dateStr,
          expenses: [],
          totalExpense: 0,
          incomes: [],
          totalIncome: 0,
          expenseCount: 0,
        };
      }
      
      dailyData[dateStr].incomes.push(income);
      dailyData[dateStr].totalIncome += income.amount;
    });
    
    return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const dailyData = getDailyData();
  
  // Lấy dữ liệu cho 7 ngày gần nhất
  const getLast7Days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = dailyData.find(d => d.date === dateStr) || {
        date: dateStr,
        expenses: [],
        totalExpense: 0,
        incomes: [],
        totalIncome: 0,
        expenseCount: 0,
      };
      
      result.push(dayData);
    }
    return result;
  };

  const last7Days = getLast7Days();

  // Tìm ngày chi mạnh nhất
  const findMaxSpendingDay = () => {
    const daysWithExpenses = dailyData.filter(day => day.totalExpense > 0);
    if (daysWithExpenses.length === 0) return null;
    
    return daysWithExpenses.reduce((max, day) => 
      day.totalExpense > max.totalExpense ? day : max
    , daysWithExpenses[0]);
  };

  const maxSpendingDay = findMaxSpendingDay();

  // Tổng hợp theo tuần
  const getWeeklySummary = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekExpenses = monthExpenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= weekAgo;
    });
    
    const weekIncomes = monthIncomes.filter(i => {
      const incomeDate = new Date(i.date);
      return incomeDate >= weekAgo;
    });
    
    const totalExpense = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = weekIncomes.reduce((sum, i) => sum + i.amount, 0);
    const avgDailyExpense = totalExpense / 7;
    
    return {
      totalExpense,
      totalIncome,
      avgDailyExpense,
      expenseCount: weekExpenses.length,
      incomeCount: weekIncomes.length,
    };
  };

  const weeklySummary = getWeeklySummary();

  // Chuẩn bị dữ liệu cho biểu đồ
  const prepareChartData = () => {
    const labels = last7Days.map(day => {
      const date = new Date(day.date);
      return date.getDate().toString();
    });
    
    const expenseData = last7Days.map(day => day.totalExpense);
    const incomeData = last7Days.map(day => day.totalIncome);
    
    // Tìm giá trị lớn nhất để scale
    const allValues = [...expenseData, ...incomeData];
    const maxValue = Math.max(...allValues.filter(v => !isNaN(v)));
    
    // Scale xuống để hiển thị đẹp
    let divisor = 1000;
    if (maxValue >= 10000000) {
      divisor = 1000000;
    } else if (maxValue >= 100000) {
      divisor = 10000;
    }
    
    return {
      labels,
      datasets: [
        {
          data: expenseData.map(v => v / divisor),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: incomeData.map(v => v / divisor),
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 3,
        },
      ],
      divisor,
    };
  };

  const chartData = prepareChartData();

  // Định dạng Y label thông minh
  const formatYLabel = (value, divisor) => {
    const actualValue = value * divisor;
    
    if (actualValue >= 1000000) {
      return `${(actualValue / 1000000).toFixed(0)}tr`;
    } else if (actualValue >= 1000) {
      return `${(actualValue / 1000).toFixed(0)}k`;
    }
    return actualValue.toString();
  };

  // Định dạng ngày
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayOfWeek = days[date.getDay()];
      return `${dayOfWeek} ${date.getDate()}`;
    }
  };

  // Format ngày đầy đủ
  const formatFullDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      day: 'numeric',
      month: 'numeric'
    });
  };

  // Tính toán ngày trong tháng
  const getMonthDaysData = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Lấy số ngày trong tháng
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = dailyData.find(d => d.date === dateStr) || {
        date: dateStr,
        totalExpense: 0,
        totalIncome: 0,
        expenseCount: 0,
      };
      
      monthData.push({
        day,
        date: dateStr,
        ...dayData,
      });
    }
    
    return monthData.slice(-31); // Lấy 31 ngày gần nhất
  };

  const monthDaysData = getMonthDaysData();

  // Tính các thống kê cho tháng
  const getMonthStats = () => {
    const today = new Date();
    const month = today.getMonth();
    const monthStart = new Date(today.getFullYear(), month, 1);
    
    const monthExp = monthExpenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= monthStart;
    });
    
    const monthInc = monthIncomes.filter(i => {
      const incomeDate = new Date(i.date);
      return incomeDate >= monthStart;
    });
    
    const totalExpense = monthExp.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = monthInc.reduce((sum, i) => sum + i.amount, 0);
    const daysPassed = Math.min(today.getDate(), 31);
    const avgDailyExpense = totalExpense / daysPassed;
    
    return {
      totalExpense,
      totalIncome,
      avgDailyExpense,
      expenseCount: monthExp.length,
      incomeCount: monthInc.length,
      daysPassed,
    };
  };

  const monthStats = getMonthStats();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📅 Theo dõi hàng ngày</Text>
        <Text style={styles.subtitle}>
          {viewMode === 'week' ? '7 ngày gần nhất' : 'Tháng này'}
        </Text>
      </View>

      {/* Toggle view mode */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'week' && styles.toggleActive]}
          onPress={() => setViewMode('week')}
        >
          <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>
            Tuần
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'month' && styles.toggleActive]}
          onPress={() => setViewMode('month')}
        >
          <Text style={[styles.toggleText, viewMode === 'month' && styles.toggleTextActive]}>
            Tháng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Biểu đồ */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          {viewMode === 'week' ? '7 ngày qua' : 'Tháng này'}
        </Text>
        <LineChart
          data={viewMode === 'week' ? chartData : {
            labels: monthDaysData.map(d => d.day.toString()),
            datasets: [{
              data: monthDaysData.map(d => d.totalExpense / 1000),
              color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
              strokeWidth: 2,
            }],
            divisor: 1000,
          }}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
            },
            propsForLabels: {
              fontSize: 10,
            },
            propsForBackgroundLines: {
              strokeWidth: 1,
              stroke: '#e5e7eb',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          formatYLabel={(value) => {
            const divisor = viewMode === 'week' ? chartData.divisor : 1000;
            return formatYLabel(value, divisor);
          }}
          segments={4}
          withInnerLines={true}
        />
        
        <View style={styles.chartLegend}>
          {viewMode === 'week' ? (
            <>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.legendText}>Chi tiêu</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendText}>Thu nhập</Text>
              </View>
            </>
          ) : (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Chi tiêu hàng ngày</Text>
            </View>
          )}
        </View>
      </View>

      {/* Thống kê nhanh */}
      <View style={styles.quickStats}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {viewMode === 'week' ? weeklySummary.expenseCount : monthStats.expenseCount}
          </Text>
          <Text style={styles.statLabel}>Giao dịch</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {viewMode === 'week' 
              ? formatSmartCurrency(weeklySummary.totalExpense)
              : formatSmartCurrency(monthStats.totalExpense)}
          </Text>
          <Text style={styles.statLabel}>Tổng chi</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {viewMode === 'week'
              ? formatSmartCurrency(weeklySummary.avgDailyExpense)
              : formatSmartCurrency(monthStats.avgDailyExpense)}
          </Text>
          <Text style={styles.statLabel}>TB/ngày</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {viewMode === 'week' 
              ? dailyData.filter(d => d.totalExpense > 0).length
              : monthStats.daysPassed}
          </Text>
          <Text style={styles.statLabel}>
            {viewMode === 'week' ? 'Ngày chi' : 'Ngày đã qua'}
          </Text>
        </View>
      </View>

      {/* Ngày chi mạnh nhất */}
      {maxSpendingDay && (
        <View style={[styles.highlightCard, maxSpendingDay.totalExpense > 0 ? styles.highlightActive : styles.highlightInactive]}>
          <View style={styles.highlightHeader}>
            <Text style={styles.flameIcon}>🔥</Text>
            <Text style={styles.highlightTitle}>Ngày chi nhiều nhất</Text>
          </View>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightDate}>
              {formatFullDate(maxSpendingDay.date)}
            </Text>
            <Text style={styles.highlightAmount}>
              {maxSpendingDay.totalExpense > 0 
                ? formatSmartCurrency(maxSpendingDay.totalExpense)
                : 'Chưa có chi tiêu'}
            </Text>
            {maxSpendingDay.expenseCount > 0 && (
              <Text style={styles.highlightDetail}>
                {maxSpendingDay.expenseCount} giao dịch
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Danh sách chi tiết */}
      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>
          {viewMode === 'week' ? '7 ngày qua' : `${monthStats.daysPassed} ngày qua`}
        </Text>
        
        {(viewMode === 'week' ? last7Days : monthDaysData.slice(-monthStats.daysPassed)).map((day, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.dayRow,
              day.totalExpense > 0 && styles.dayRowHasExpense,
              index === 0 && viewMode === 'week' && styles.dayRowToday
            ]}
            onPress={() => console.log('Xem chi tiết ngày:', day.date)}
          >
            <View style={styles.dayInfo}>
              <Text style={[
                styles.dayName,
                index === 0 && viewMode === 'week' && styles.dayNameToday
              ]}>
                {formatDate(day.date)}
              </Text>
              {day.expenseCount > 0 && (
                <Text style={styles.dayCount}>{day.expenseCount} GD</Text>
              )}
            </View>
            
            <View style={styles.dayAmounts}>
              {day.totalExpense > 0 && (
                <Text style={styles.expenseAmount}>
                  {formatSmartCurrency(day.totalExpense)}
                </Text>
              )}
              {day.totalIncome > 0 && (
                <Text style={styles.incomeAmount}>
                  +{formatSmartCurrency(day.totalIncome)}
                </Text>
              )}
              {day.totalExpense === 0 && day.totalIncome === 0 && (
                <Text style={styles.noDataText}>--</Text>
              )}
            </View>
            
            {/* Thanh chỉ số visual */}
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { 
                    width: maxSpendingDay?.totalExpense > 0 
                      ? `${Math.min((day.totalExpense / maxSpendingDay.totalExpense) * 100, 100)}%`
                      : '0%',
                    opacity: day.totalExpense > 0 ? 0.7 : 0
                  }
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Mẹo theo dõi hàng ngày</Text>
        <Text style={styles.tipText}>
          • Kiểm tra chi tiêu cuối ngày để điều chỉnh
        </Text>
        <Text style={styles.tipText}>
          • Hạn chế chi vào ngày đã vượt trung bình
        </Text>
        <Text style={styles.tipText}>
          • Cuối tuần, tổng kết và lập kế hoạch tuần mới
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#3b82f6',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  highlightCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  highlightActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  highlightInactive: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  flameIcon: {
    fontSize: 20,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  highlightContent: {
    alignItems: 'center',
  },
  highlightDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#92400e',
    marginBottom: 4,
    textAlign: 'center',
  },
  highlightAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ef4444',
    marginBottom: 4,
    textAlign: 'center',
  },
  highlightDetail: {
    fontSize: 14,
    color: '#92400e',
  },
  detailSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dayRowHasExpense: {
    backgroundColor: '#fafafa',
  },
  dayRowToday: {
    backgroundColor: '#f0f9ff',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  dayNameToday: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  dayCount: {
    fontSize: 11,
    color: '#9ca3af',
  },
  dayAmounts: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 2,
  },
  incomeAmount: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#f3f4f6',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 1,
  },
  tipsContainer: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default DailyTracker;