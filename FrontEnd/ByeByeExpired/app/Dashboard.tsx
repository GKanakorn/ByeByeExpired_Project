import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Circle, G } from 'react-native-svg';

// Dashboard สำหรับแสดงสรุปข้อมูลวัตถุดิบที่ถูกทิ้ง พร้อม Bar Chart และ Pie Chart
// ใช้สำหรับติดตามและวิเคราะห์ข้อมูลการสูญเสียวัตถุดิบรายเดือน
const { width, height } = Dimensions.get('window');

const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const summary = {
  totalItems: 20,
  totalLoss: 845,
};

const barData = [
  { date: "8 ม.ค.", loss: 305 },
  { date: "11 ม.ค.", loss: 255 },
  { date: "22 ม.ค.", loss: 285 },
];

const pieData = [
  { name: "เนื้อหมู", value: 350, color: "#8B5CF6" },
  { name: "นมสด", value: 198, color: "#EC4899" },
  { name: "ผักสลัด", value: 140, color: "#34D399" },
  { name: "ไข่ไก่", value: 68, color: "#FBBF24" },
  { name: "ซุปยา", value: 30, color: "#60A5FA" },
];

const maxLoss = Math.max(...barData.map(d => d.loss));
const totalPieValue = pieData.reduce((sum, item) => sum + item.value, 0);

// Pie Chart Component
const PieChart = () => {
  const size = 140;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedPercentage = 0;
  
  return (
    <View style={styles.pieChartWrapper}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {pieData.map((item, index) => {
            const percentage = item.value / totalPieValue;
            const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
            const strokeDashoffset = -circumference * accumulatedPercentage;
            accumulatedPercentage += percentage;
            
            return (
              <Circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </G>
      </Svg>
      <View style={styles.pieChartCenter}>
        <Text style={styles.pieChartTotal}>{totalPieValue}</Text>
        <Text style={styles.pieChartUnit}>บาท</Text>
      </View>
    </View>
  );
};

export default function LossDashboard() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState('ม.ค.');
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  return (
    <LinearGradient
      colors={['#E8EAFF', '#F5F7FF', '#E8F4FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/')}
          >
            <Ionicons name="chevron-back" size={26} color="#6366F1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* App Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#A78BFA', '#8B5CF6', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.appIcon}
          >
            <Ionicons name="stats-chart" size={40} color="#FFF" />
          </LinearGradient>
        </View>

        {/* Title with Month Picker */}
        <View style={styles.titleRow}>
          <Text style={styles.mainTitle}>สรุปข้อมูลวัตถุดิบที่ถูกทิ้ง</Text>
          <TouchableOpacity 
            style={styles.monthPicker}
            onPress={() => setShowMonthPicker(!showMonthPicker)}
          >
            <Text style={styles.monthText}>เดือน {selectedMonth}</Text>
            <Ionicons 
              name={showMonthPicker ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#6B7280" 
            />
          </TouchableOpacity>
        </View>

        {/* Month Picker Dropdown */}
        {showMonthPicker && (
          <View style={styles.monthDropdown}>
            {months.map((month) => (
              <TouchableOpacity
                key={month}
                style={[styles.monthOption, selectedMonth === month && styles.monthOptionActive]}
                onPress={() => {
                  setSelectedMonth(month);
                  setShowMonthPicker(false);
                }}
              >
                <Text style={[styles.monthOptionText, selectedMonth === month && styles.monthOptionTextActive]}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary Cards</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['#F3E8FF', '#EDE9FE']}
                style={styles.summaryCardInner}
              >
                <View style={styles.summaryTopRow}>
                  <Ionicons name="cube-outline" size={22} color="#8B5CF6" />
                  <Text style={styles.summaryLabel}>ของที่ทิ้งทั้งหมด</Text>
                </View>
                <Text style={styles.summaryValue}>{summary.totalItems} <Text style={styles.summaryUnit}>รายการ</Text></Text>
              </LinearGradient>
            </View>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['#FCE7F3', '#FDF2F8']}
                style={styles.summaryCardInner}
              >
                <View style={styles.summaryTopRow}>
                  <Ionicons name="wallet-outline" size={22} color="#EC4899" />
                  <Text style={styles.summaryLabel}>รวมมูลค่าความสูญเสีย</Text>
                </View>
                <Text style={styles.summaryValuePink}>{summary.totalLoss} <Text style={styles.summaryUnit}>บาท</Text></Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bar Chart</Text>
          <View style={styles.chartCard}>
            <View style={styles.barChartHeader}>
              <Text style={styles.barChartLabel}>วันที่</Text>
              <Text style={styles.barChartLabel}>เงินที่เสีย (บาท)</Text>
            </View>
            {barData.map((item, index) => (
              <View key={index} style={styles.barRow}>
                <Text style={styles.barDateLabel}>{item.date}</Text>
                <View style={styles.barTrack}>
                  <LinearGradient
                    colors={['#F472B6', '#EC4899', '#DB2777']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.barFill, { width: `${(item.loss / maxLoss) * 100}%` }]}
                  />
                </View>
                <Text style={styles.barValueLabel}>{item.loss}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pie Chart Section */}
        <View style={styles.sectionLast}>
          <Text style={styles.sectionTitle}>Top 5 วัตถุดิบที่หมดอายุ</Text>
          <View style={styles.chartCard}>
            <View style={styles.pieContainer}>
              <PieChart />
              
              {/* Legend */}
              <View style={styles.legendContainer}>
                {pieData.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <Text style={styles.legendNumber}>{index + 1}.</Text>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendName}>{item.name}</Text>
                    <Text style={styles.legendValue}>{item.value} บาท</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* View All Button */}
            <TouchableOpacity style={styles.viewAllButton}>
              <LinearGradient
                colors={['#A78BFA', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.viewAllGradient}
              >
                <Text style={styles.viewAllText}>ดูทั้งหมด</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  monthDropdown: {
    position: 'absolute',
    top: 200,
    right: 20,
    zIndex: 100,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    width: width - 40,
  },
  monthOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  monthOptionActive: {
    backgroundColor: '#8B5CF6',
  },
  monthOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  monthOptionTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 18,
  },
  sectionLast: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 14,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryCardInner: {
    padding: 18,
    borderRadius: 18,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  summaryValuePink: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EC4899',
  },
  summaryUnit: {
    fontSize: 15,
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  barChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  barChartLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  barDateLabel: {
    width: 55,
    fontSize: 13,
    fontWeight: '600',
    color: '#EC4899',
  },
  barTrack: {
    flex: 1,
    height: 26,
    backgroundColor: '#F9FAFB',
    borderRadius: 13,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 13,
  },
  barValueLabel: {
    width: 42,
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'right',
  },
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  pieChartWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieChartCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieChartTotal: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
  },
  pieChartUnit: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  legendContainer: {
    flex: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  legendNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    width: 20,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  viewAllButton: {
    alignSelf: 'flex-end',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 14,
  },
  viewAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 6,
  },
  viewAllText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
