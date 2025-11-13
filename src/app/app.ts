import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import moment from 'moment-timezone';
import { TempApiService } from './temp-api-service';

interface SensorData {
  temperature: number;
  humidity: number;
  mac_id: string;
  recorded_at: string;
  heat_index: number;
  risk_color: string;
}

interface SensorGroup {
  mac_id: string;
  latest: SensorData;
  history: SensorData[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  imagePath = 'assets/logo.png';
  groupedSensors: SensorGroup[] = [];
  intervalId?: any;

  constructor(private tempApiService: TempApiService) {}

  // ====================
  // 🕒 Lifecycle
  // ====================
  ngOnInit() {
    this.loadHistoryAndGroup();
    this.intervalId = setInterval(() => this.loadHistoryAndGroup(), 5000); // ทุก 1 นาที
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  // ====================
  // 📊 โหลดข้อมูลย้อนหลัง 24 ชม. (ไม่คำนวณ heat index)
  // ====================
  loadHistoryAndGroup(): void {
    this.tempApiService.getHistory().subscribe({
      next: (res: any[]) => {
        const groups = new Map<string, SensorGroup>();
        const now = new Date();
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        res.forEach(record => {
          const sensorRecord: SensorData = {
            temperature: parseFloat(record.temperature),
            humidity: parseFloat(record.humidity),
            heat_index: parseFloat(record.heat_index), // ✅ ใช้จาก API โดยตรง
            mac_id: record.mac_id,
            recorded_at: moment
              .utc(record.recorded_at)
              .format('YYYY-MM-DD HH:mm:ss'),
            risk_color: (record.risk_color || '') // ✅ เอาสีจาก API
          };

          const recordDate = new Date(sensorRecord.recorded_at);
          if (recordDate >= cutoff) {
            if (!groups.has(record.mac_id)) {
              groups.set(record.mac_id, {
                mac_id: record.mac_id,
                latest: sensorRecord,
                history: []
              });
            }

            const group = groups.get(record.mac_id)!;
            group.history.push(sensorRecord);

            // ✅ อัปเดตข้อมูลล่าสุด
            if (
              recordDate.getTime() >
              new Date(group.latest.recorded_at).getTime()
            ) {
              group.latest = sensorRecord;
            }
          }
        });

        // ✅ เรียงเวลาล่าสุดอยู่บนสุด
        this.groupedSensors = Array.from(groups.values()).map(g => {
          g.history.sort(
            (a, b) =>
              new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
          );
          return g;
        });

        console.log('Grouped sensors:', this.groupedSensors);
      },
      error: err => console.error('Error fetching history:', err)
    });
  }

  // ====================
  // 🎨 แปลงรหัสสีจาก API → ข้อมูลแสดงผล
  // ====================
getHeatFlag(riskColor: string) {
  const color = riskColor.toUpperCase();
  switch (color) {
    case 'WHITE':
      return { label: 'ปลอดภัย', color: '#c6c6c6ff' }; // เทาอ่อน
    case 'GREEN':
      return { label: 'ระวัง', color: '#00B050' }; // เขียวสด
    case 'YELLOW':
      return { label: 'เสี่ยง', color: '#FFD966' }; // เหลืองอ่อน
    case 'RED':
      return { label: 'อันตราย', color: '#FF4C4C' }; // แดงสด
    case 'BLACK':
      return { label: 'อันตรายสูง', color: '#000000' }; // ดำ
    default:
      return { label: 'ไม่ทราบ', color: '#CCCCCC' }; // เทากลาง
  }
}


  // ====================
  // 🌀 UI Helpers
  // ====================
  getRotation(temp: number): string {
    const deg = ((temp - 0) / 100) * 180 - 180;
    return `rotate(${deg}deg)`;
  }

  getGradient(temp: number, hum: number): string {
    const color = hum > 70 ? 'orange' : 'green';
    return `linear-gradient(90deg, ${color}, ${color})`;
  }

  getHistoryStatusClass(temp: number, hum: number): string {
    return hum > 70 ? 'high-humidity' : 'normal';
  }
}
