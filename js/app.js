// js/app.js - Controller Utama, Routing & Left Sidebar Navigation
import { Store } from './store.js';
import { renderAuthPage } from './pages/auth.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderPosPage } from './pages/pos.js';
import { renderInventoryPage } from './pages/inventory.js';
import { renderReportsPage } from './pages/reports.js';

const root = document.getElementById('app');

function initApp() {
  const user = Store.getCurrentUser();
  if (!user) {
    renderAuthPage(root, () => initApp());
    return;
  }

  // Hak akses menu di Sidebar Kiri berdasarkan Role
  const menuItems = user.role === 'owner'
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'pos', label: 'Kasir (POS)', icon: '🛒' },
        { id: 'inventory', label: 'Produk & Stok', icon: '📦' },
        { id: 'reports', label: 'Laporan & HPP', icon: '📈' }
      ]
    : [
        { id: 'pos', label: 'Kasir (POS)', icon: '🛒' },
        { id: 'reports', label: 'Riwayat Shift', icon: '🧾' }
      ];

  let activePage = menuItems[0].id;
  let isCollapsed = false;

  function renderLayout() {
    root.innerHTML = `
      <div class="app-container">
        <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" id="leftSidebar">
          <div class="sidebar-header">
            <span class="brand-title">JayMart ERP</span>
            <button class="toggle-btn" id="toggleSidebar" title="Perkecil/Perbesar Sidebar">☰</button>
          </div>

          <nav class="nav-menu">
            ${menuItems.map(item => `
              <button class="nav-item ${activePage === item.id ? 'active' : ''}" data-page="${item.id}">
                <span>${item.icon}</span>
                <span class="nav-text">${item.label}</span>
              </button>
            `).join('')}
          </nav>

          <div class="sidebar-footer">
            <div class="user-meta" style="margin-bottom: 0.75rem; font-size: 0.85rem;">
              <div style="font-weight: 600;">${user.nama_lengkap}</div>
              <div style="color: var(--sage-light); font-size: 0.75rem; text-transform: uppercase;">Role: ${user.role}</div>
            </div>
            <button class="btn btn-wood btn-block" id="btnLogout" style="padding: 0.5rem;">
              <span>🚪</span> <span class="nav-text">Keluar</span>
            </button>
          </div>
        </aside>

        <main class="main-content" id="pageContainer"></main>
      </div>
    `;

    root.querySelector('#toggleSidebar').onclick = () => {
      isCollapsed = !isCollapsed;
      renderLayout();
    };

    root.querySelectorAll('.nav-item').forEach(btn => {
      btn.onclick = () => {
        activePage = btn.dataset.page;
        renderLayout();
      };
    });

    root.querySelector('#btnLogout').onclick = () => {
      Store.logout();
      initApp();
    };

    const pageContainer = root.querySelector('#pageContainer');
    if (activePage === 'dashboard') renderDashboardPage(pageContainer);
    else if (activePage === 'pos') renderPosPage(pageContainer, user);
    else if (activePage === 'inventory') renderInventoryPage(pageContainer);
    else if (activePage === 'reports') renderReportsPage(pageContainer, user);
  }

  renderLayout();
}

initApp();
