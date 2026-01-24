import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface AdminDashboardData {
  systemStats: {
    totalUsers: number;
    totalDoctors: number;
    totalPatients: number;
    totalAppointments: number;
    totalAnalyses: number;
  };
  recentActivity: {
    type: 'user_registered' | 'doctor_approved' | 'appointment_created' | 'analysis_completed';
    title: string;
    description: string;
    timestamp: Date;
    userId?: string;
  }[];
  pendingApprovals: {
    doctors: number;
    content: number;
    reports: number;
  };
  systemHealth: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<AdminDashboardData> {
    return this.http.get<AdminDashboardData>(`${this.apiUrl}/dashboard`);
  }

  getAllUsers() {
    return this.http.get(`${this.apiUrl}/users`);
  }

  getUserById(id: string) {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: string, user: any) {
    return this.http.patch(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  assignRole(userId: string, role: string) {
    return this.http.patch(`${this.apiUrl}/assign-role`, { userId, role });
  }

  getAllAppointments() {
    return this.http.get(`${this.apiUrl}/appointments`);
  }

  getAllPrescriptions() {
    return this.http.get(`${this.apiUrl}/prescriptions`);
  }

  getAllBlogs() {
    return this.http.get(`${this.apiUrl}/blogs`);
  }

  getAllComments() {
    return this.http.get(`${this.apiUrl}/comments`);
  }
}