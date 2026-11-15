-- Database Schema untuk JayMart Retail ERP & POS
CREATE DATABASE IF NOT EXISTS jaymart_db;
USE jaymart_db;

-- Tabel Users (Khusus Kasir untuk Register & Login; Akun Owner/Admin disiapkan secara internal/manual)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_lengkap VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('owner', 'kasir') NOT NULL DEFAULT 'kasir',
    shift_default VARCHAR(30) DEFAULT 'Pagi (07:00 - 15:00)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed akun Owner default (tidak bisa register via form publik)
INSERT INTO users (nama_lengkap, username, password_hash, role, shift_default)
VALUES ('Bapak Jaya (Owner)', 'owner_jaymart', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner', 'Full Day');

-- Tabel Produk & Master Data
CREATE TABLE produk (
    sku VARCHAR(20) PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    harga_beli DECIMAL(12, 2) NOT NULL,
    harga_jual DECIMAL(12, 2) NOT NULL,
    stok INT NOT NULL DEFAULT 0,
    min_stok INT NOT NULL DEFAULT 5,
    satuan VARCHAR(20) NOT NULL DEFAULT 'Pcs',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Transaksi Penjualan (Order-to-Cash)
CREATE TABLE transaksi (
    id_transaksi VARCHAR(30) PRIMARY KEY,
    user_id INT NOT NULL,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12, 2) NOT NULL,
    diskon DECIMAL(12, 2) DEFAULT 0,
    pajak DECIMAL(12, 2) DEFAULT 0,
    total_bayar DECIMAL(12, 2) NOT NULL,
    metode_bayar ENUM('Tunai', 'QRIS', 'Transfer') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabel Detail Transaksi (Menyimpan snapshot harga saat transaksi)
CREATE TABLE detail_transaksi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_transaksi VARCHAR(30) NOT NULL,
    sku VARCHAR(20) NOT NULL,
    qty INT NOT NULL,
    harga_saat_transaksi DECIMAL(12, 2) NOT NULL,
    hpp_saat_transaksi DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (id_transaksi) REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
    FOREIGN KEY (sku) REFERENCES produk(sku)
);

-- Tabel Kartu Stok / Mutasi Barang
CREATE TABLE mutasi_stok (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(20) NOT NULL,
    jenis ENUM('MASUK', 'KELUAR', 'OPNAME') NOT NULL,
    qty INT NOT NULL,
    referensi VARCHAR(50) NOT NULL,
    keterangan VARCHAR(255),
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sku) REFERENCES produk(sku)
);
