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
}

interface SensorGroup {
  mac_id: string;
  latest: SensorData;
  history: SensorData[];
}

// ✅ เพิ่ม interface สำหรับข้อมูลรายวัน
interface DailyRecord {
  time: string;
  temperature: number;
  humidity: number;
}

interface DailyDevice {
  mac_id: string;
  data: DailyRecord[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  groupedSensors: SensorGroup[] = [];
  dailyData: DailyDevice[] = []; // ✅ ใช้ interface ที่ชัดเจน
  intervalId?: any;

  constructor(private tempApiService: TempApiService) {}

  ngOnInit() {
    this.loadHistoryAndGroup();
    // ✅ โหลดข้อมูลใหม่ทุก 5 วิ
    this.intervalId = setInterval(() => {
      this.loadHistoryAndGroup();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  // ======================
  // 🔥 โหลดข้อมูลย้อนหลัง 24 ชั่วโมง
  // ======================
  loadHistoryAndGroup(): void {
    this.tempApiService.getHistory().subscribe({
      next: (res: any[]) => {
        const groups = new Map<string, SensorGroup>();
        const now = new Date();
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        res.forEach(record => {
          const temperature = parseFloat(record.temperature);
          const humidity = parseFloat(record.humidity);
          const heat_index =
            record.heat_index !== undefined
              ? parseFloat(record.heat_index)
              : this.calculateHeatIndex(temperature, humidity);

          const sensorRecord: SensorData = {
            temperature,
            humidity,
            heat_index,
            mac_id: record.mac_id,
            recorded_at: moment.utc(record.recorded_at).format('YYYY-MM-DD HH:mm:ss')
          };

          const recordDate = new Date(sensorRecord.recorded_at);
          if (recordDate >= cutoff) {
            if (!groups.has(record.mac_id)) {
              groups.set(record.mac_id, { mac_id: record.mac_id, latest: sensorRecord, history: [] });
            }

            const group = groups.get(record.mac_id)!;
            group.history.push(sensorRecord);

            if (recordDate.getTime() > new Date(group.latest.recorded_at).getTime()) {
              group.latest = sensorRecord;
            }
          }
        });

        this.groupedSensors = Array.from(groups.values()).map(g => {
          g.history.sort(
            (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
          );
          return g;
        });
      },
      error: err => console.error('Error fetching history:', err)
    });
  }

  // ======================
  // 🌤 โหลดข้อมูลรายวัน
  // ======================
  private calculateHeatIndex(temp: number, humidity: number): number {
    const T = temp, RH = humidity;
    const HI =
      -8.784695 +
      1.61139411 * T +
      2.338549 * RH -
      0.14611605 * T * RH -
      0.012308094 * T * T -
      0.016424828 * RH * RH +
      0.002211732 * T * T * RH +
      0.00072546 * T * RH * RH -
      0.000003582 * T * T * RH * RH;
    return parseFloat(HI.toFixed(2));
  }

  getRotation(temp: number): string {
    const deg = ((temp - 0) / 100) * 180 - 180;
    return `rotate(${deg}deg)`;
  }

  getGradient(temp: number, hum: number): string {
    const color = hum > 70 ? 'orange' : 'green';
    return `linear-gradient(90deg, ${color}, ${color})`;
  }

  getHeatFlag(heatIndex: number) {
    if (heatIndex < 27) return { label: 'Safe', color: 'green' };
    else if (heatIndex < 32) return { label: 'Caution', color: 'goldenrod' };
    else if (heatIndex < 41) return { label: 'Warning', color: 'orange' };
    else if (heatIndex < 54) return { label: 'Danger', color: 'red' };
    else return { label: 'Extreme Danger', color: 'black' };
  }

  getHistoryStatusClass(temp: number, hum: number): string {
    return hum > 70 ? 'high-humidity' : 'normal';
  }
}
