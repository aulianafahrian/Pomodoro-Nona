export function showSwal(type) {
    const base = { confirmButtonColor: '#a7d6f1', timer: undefined };

    const configs = {
        'start': {
            title: 'Waktunya Kerja! 💻',
            text: 'Fokus yuk, kamu pasti bisa!',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false
        },
        'break': {
            title: 'Istirahat Dulu 😌',
            text: 'Ambil napas sebentar, kamu hebat!',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false
        },
        'longbreak': {
            title: 'Istirahat Panjang 😴',
            text: 'Rebahan dulu, kamu sudah kerja keras!',
            icon: 'info',
            timer: 2500,
            showConfirmButton: false
        },
        'done': {
            title: 'Selesai Semua! 🎉',
            text: 'Kamu luar biasa! Waktunya istirahat total 💖',
            icon: 'success',
            confirmButtonText: 'Terima Kasih! 💖',
            ...base
        },
        'saved': {
            title: 'Pengaturan Tersimpan! 🥳',
            text: 'Klik Mulai untuk memulai siklusmu! ⏰💪',
            icon: 'success',
            confirmButtonText: 'Yuk Mulai! 🚀',
            ...base
        },
        'notif-denied': {
            title: 'Notifikasi Dimatikan 😢',
            text: 'Aktifkan notifikasi di pengaturan browser agar tidak ketinggalan! 🌟',
            icon: 'warning',
            confirmButtonText: 'Oke, Saya Aktifkan! 💖',
            ...base
        },
        'not-saved': {
            title: 'Pengaturan Belum Disimpan 😅',
            text: 'Buka ⚙ Pengaturan dan simpan dulu sebelum mulai!',
            icon: 'error',
            confirmButtonText: 'Siap! 📝',
            ...base
        },
        'empty-duration': {
            title: 'Durasi Kosong 😕',
            text: 'Masukkan durasi kerja yang valid dulu ya!',
            icon: 'error',
            confirmButtonText: 'Oke!',
            ...base
        },
    };

    const config = configs[type];
    if (config) Swal.fire(config);
}
