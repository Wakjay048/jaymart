// js/store.js - State Management & Simulasi Database Lokal
export const Store = {
  getUsers() {
    const defaultUsers = [
      {
        id: 1,
        nama_lengkap: 'Bapak Jaya (Owner)',
        username: 'owner_jaymart',
        password: '123',
        role: 'owner',
        shift: 'Full Day'
      }
    ];
    const stored = JSON.parse(localStorage.getItem('jaymart_users') || 'null');
    if (!stored) {
      localStorage.setItem('jaymart_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return stored;
  },

  registerKasir({ nama_lengkap, username, password, shift }) {
    const users = this.getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, message: 'Username sudah terdaftar. Gunakan username lain.' };
    }
    const newUser = {
      id: Date.now(),
      nama_lengkap,
      username,
      password,
      role: 'kasir', // Pendaftaran publik selalu dikunci sebagai kasir
      shift
    };
    users.push(newUser);
    localStorage.setItem('jaymart_users', JSON.stringify(users));
    return { ok: true, message: 'Registrasi akun kasir berhasil! Silakan login.' };
  },

  login(username, password) {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return { ok: false, message: 'Username atau password salah.' };
    }
    sessionStorage.setItem('jaymart_session', JSON.stringify(user));
    return { ok: true, user };
  },

  getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('jaymart_session') || 'null');
  },

  logout() {
    sessionStorage.removeItem('jaymart_session');
  },

  getProducts() {
    const defaults = [
      { sku: 'JM-001', nama: 'Beras Pandan Wangi 5kg', kategori: 'Sembako', harga_beli: 62000, harga_jual: 72000, stok: 24, satuan: 'Sak' },
      { sku: 'JM-002', nama: 'Minyak Goreng 2L', kategori: 'Sembako', harga_beli: 31000, harga_jual: 36000, stok: 18, satuan: 'Pouch' },
      { sku: 'JM-003', nama: 'Gula Pasir Putih 1kg', kategori: 'Sembako', harga_beli: 14500, harga_jual: 17500, stok: 4, satuan: 'Bungkus' },
      { sku: 'JM-004', nama: 'Kopi Susu Kaleng 240ml', kategori: 'Minuman', harga_beli: 6500, harga_jual: 9000, stok: 40, satuan: 'Kaleng' },
      { sku: 'JM-005', nama: 'Sabun Mandi Cair 450ml', kategori: 'Kebutuhan Rumah', harga_beli: 18000, harga_jual: 23500, stok: 3, satuan: 'Pouch' }
    ];
    const data = JSON.parse(localStorage.getItem('jaymart_products') || 'null');
    if (!data) {
      localStorage.setItem('jaymart_products', JSON.stringify(defaults));
      return defaults;
    }
    return data;
  },

  saveProducts(products) {
    localStorage.setItem('jaymart_products', JSON.stringify(products));
  },

  getTransactions() {
    return JSON.parse(localStorage.getItem('jaymart_transactions') || '[]');
  },

  addTransaction(tx) {
    const txs = this.getTransactions();
    txs.unshift(tx);
    localStorage.setItem('jaymart_transactions', JSON.stringify(txs));

    // Potong stok & catat mutasi
    const products = this.getProducts();
    tx.items.forEach(item => {
      const idx = products.findIndex(p => p.sku === item.sku);
      if (idx !== -1) {
        products[idx].stok = Math.max(0, products[idx].stok - item.qty);
        this.addMutation({
          sku: item.sku,
          nama: item.nama,
          jenis: 'KELUAR',
          qty: item.qty,
          referensi: tx.id,
          waktu: tx.waktu
        });
      }
    });
    this.saveProducts(products);
  },

  getMutations() {
    return JSON.parse(localStorage.getItem('jaymart_mutations') || '[]');
  },

  addMutation(mut) {
    const muts = this.getMutations();
    muts.unshift(mut);
    localStorage.setItem('jaymart_mutations', JSON.stringify(muts));
  }
};

export function formatRupiah(angka) {
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}
