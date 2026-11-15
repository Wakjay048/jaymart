// js/pages/auth.js - Halaman Login & Register Khusus Kasir
import { Store } from '../store.js';

export function renderAuthPage(container, onLoginSuccess) {
  let mode = 'login'; // 'login' | 'register'

  function render() {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">JM</div>
            <h2 style="color: var(--sage-dark); margin-bottom: 4px;">JayMart ERP & POS</h2>
            <p style="font-size: 0.85rem; color: var(--slate-muted);">Sistem Manajemen Toko Ritel Terpadu</p>
          </div>

          <div class="auth-tabs">
            <button type="button" class="auth-tab ${mode === 'login' ? 'active' : ''}" id="tabLogin">Masuk (Login)</button>
            <button type="button" class="auth-tab ${mode === 'register' ? 'active' : ''}" id="tabRegister">Daftar Kasir</button>
          </div>

          <div id="authAlert"></div>

          ${mode === 'login' ? `
            <form id="loginForm">
              <div class="form-group">
                <label>Username</label>
                <input type="text" id="loginUsername" class="form-control" placeholder="Masukkan username Anda" required />
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" id="loginPassword" class="form-control" placeholder="Masukkan password" required />
              </div>
              <button type="submit" class="btn btn-primary btn-block" style="margin-top: 0.5rem;">Masuk ke Sistem</button>
            </form>
          ` : `
            <form id="registerForm">
              <div class="form-group">
                <label>Nama Lengkap Kasir</label>
                <input type="text" id="regNama" class="form-control" placeholder="Contoh: Rina Marlina" required />
              </div>
              <div class="form-group">
                <label>Username Baru</label>
                <input type="text" id="regUsername" class="form-control" placeholder="Contoh: rina_kasir" required />
              </div>
              <div class="form-group">
                <label>Shift Kerja Utama</label>
                <select id="regShift" class="form-control">
                  <option value="Pagi (07:00 - 15:00)">Pagi (07:00 - 15:00)</option>
                  <option value="Siang (15:00 - 22:00)">Siang (15:00 - 22:00)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" id="regPassword" class="form-control" placeholder="Buat password akun kasir" required />
              </div>
              <button type="submit" class="btn btn-wood btn-block" style="margin-top: 0.5rem;">Daftar Akun Kasir</button>
            </form>
          `}
        </div>
      </div>
    `;

    container.querySelector('#tabLogin').onclick = () => { mode = 'login'; render(); };
    container.querySelector('#tabRegister').onclick = () => { mode = 'register'; render(); };

    const alertBox = container.querySelector('#authAlert');

    if (mode === 'login') {
      container.querySelector('#loginForm').onsubmit = (e) => {
        e.preventDefault();
        const user = container.querySelector('#loginUsername').value.trim();
        const pass = container.querySelector('#loginPassword').value;
        const res = Store.login(user, pass);
        if (res.ok) {
          onLoginSuccess(res.user);
        } else {
          alertBox.innerHTML = `<div class="alert-box alert-error">${res.message}</div>`;
        }
      };
    } else {
      container.querySelector('#registerForm').onsubmit = (e) => {
        e.preventDefault();
        const nama_lengkap = container.querySelector('#regNama').value.trim();
        const username = container.querySelector('#regUsername').value.trim();
        const shift = container.querySelector('#regShift').value;
        const password = container.querySelector('#regPassword').value;

        const res = Store.registerKasir({ nama_lengkap, username, password, shift });
        if (res.ok) {
          mode = 'login';
          render();
          container.querySelector('#authAlert').innerHTML = `<div class="alert-box alert-success">${res.message}</div>`;
        } else {
          alertBox.innerHTML = `<div class="alert-box alert-error">${res.message}</div>`;
        }
      };
    }
  }

  render();
}
