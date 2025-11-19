import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import DateTimePickerNative from '@react-native-community/datetimepicker';

type Props = {
  value?: Date | number;
  mode?: 'date' | 'time' | 'datetime';
  is24Hour?: boolean;
  display?: any;
  onChange: (event: any, date?: Date) => void;
};

export default function DateTimePickerWrapper({ value, mode = 'date', is24Hour = true, display, onChange }: Props) {
  const dateValue = value ? new Date(value) : new Date();

  if (Platform.OS === 'web') {
    const formatDate = (d: Date) => d.toISOString().slice(0, 10); 
    const formatTime = (d: Date) => d.toTimeString().slice(0, 5); 

    const handleDateChange = (e: any) => {
      const v = e.target.value; 
      if (!v) return;
      const d = new Date(v + 'T00:00:00');
      onChange(null, d);
    };

    const handleTimeChange = (e: any) => {
      const v = e.target.value; // HH:MM
      if (!v) return;
      const [hh, mm] = v.split(':').map(Number);
      const d = new Date(dateValue);
      d.setHours(hh, mm, 0, 0);
      onChange(null, d);
    };

    return (
      <View style={styles.webWrapper}>
        {mode === 'date' && (

          <input type="date" value={formatDate(dateValue)} onChange={handleDateChange} />
        )}
        {mode === 'time' && (

          <input type="time" value={formatTime(dateValue)} onChange={handleTimeChange} />
        )}
      </View>
    );
  }


  return (
    <DateTimePickerNative
      value={dateValue}
      mode={mode === 'datetime' ? 'date' : (mode as any)}
      is24Hour={is24Hour}
      display={display}
      onChange={onChange}
    />
  );
}

const styles = StyleSheet.create({
  webWrapper: { paddingVertical: 6 },
});
