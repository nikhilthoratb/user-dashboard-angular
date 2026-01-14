import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgComponentOutlet],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.scss']
})
export class UserDashboardComponent
  implements OnInit, AfterViewInit, OnDestroy {

  users: User[] = [];

  // filtering + pagination
  searchText = '';
  currentPage = 1;
  pageSize = 5;
  filteredUsers: User[] = [];
  pagedUsers: User[] = [];

  showUserForm = false;

  private sub!: Subscription;
  private chart: any;
  private ChartJs: any;
  private viewReady = false;

  @ViewChild('roleChart') roleChart!: ElementRef<HTMLCanvasElement>;

  userFormComponent: any = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.sub = this.userService.users$.subscribe(users => {
      this.users = users;
      this.applyFilterAndPagination();
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.applyFilterAndPagination();
  }

  async openUserForm(): Promise<void> {
    if (!this.userFormComponent) {
      this.userFormComponent =
        (await import('../../user-form/user-form'))
          .UserFormComponent;
    }
    this.showUserForm = true;
  }

  closeUserForm = (): void => {
    this.showUserForm = false;
  };

  applyFilterAndPagination(): void {
    const search = this.searchText.toLowerCase();

    this.filteredUsers = this.users.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.role.toLowerCase().includes(search)
    );

    this.currentPage = 1;
    this.updatePagedUsers();

    if (this.viewReady) {
      this.updateChart(this.filteredUsers);
    }
  }

  updatePagedUsers(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.filteredUsers.length) {
      this.currentPage++;
      this.updatePagedUsers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedUsers();
    }
  }

  private async loadChartJs(): Promise<void> {
    if (!this.ChartJs) {
      const module = await import('chart.js/auto');
      this.ChartJs = module.default;
    }
  }

  private async updateChart(data: User[]): Promise<void> {
    if (!this.roleChart) return;

    await this.loadChartJs();

    const roleCount = { Admin: 0, Editor: 0, Viewer: 0 };
    data.forEach(u => roleCount[u.role]++);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new this.ChartJs(this.roleChart.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Admin', 'Editor', 'Viewer'],
        datasets: [{
          data: [
            roleCount.Admin,
            roleCount.Editor,
            roleCount.Viewer
          ],
          backgroundColor: ['#1c4980', '#383838', '#9e9e9e']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.chart?.destroy();
  }
}
