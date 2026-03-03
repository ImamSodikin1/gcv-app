import Swal from 'sweetalert2';

export const showAlert = (theme: 'dark' | 'light') => {
  const isDark = theme === 'dark';
  
  return {
    success: (title: string, text?: string) => {
      return Swal.fire({
        icon: 'success',
        title,
        text,
        background: isDark ? '#1e1b2e' : '#ffffff',
        color: isDark ? '#ffffff' : '#000000',
        confirmButtonColor: isDark ? '#7c3aed' : '#3b82f6',
        iconColor: isDark ? '#10b981' : '#10b981',
      });
    },
    
    error: (title: string, text?: string) => {
      return Swal.fire({
        icon: 'error',
        title,
        text,
        background: isDark ? '#1e1b2e' : '#ffffff',
        color: isDark ? '#ffffff' : '#000000',
        confirmButtonColor: isDark ? '#7c3aed' : '#3b82f6',
        iconColor: isDark ? '#ef4444' : '#ef4444',
      });
    },
    
    warning: (title: string, text?: string) => {
      return Swal.fire({
        icon: 'warning',
        title,
        text,
        background: isDark ? '#1e1b2e' : '#ffffff',
        color: isDark ? '#ffffff' : '#000000',
        confirmButtonColor: isDark ? '#7c3aed' : '#3b82f6',
        iconColor: isDark ? '#f59e0b' : '#f59e0b',
      });
    },
    
    info: (title: string, text?: string) => {
      return Swal.fire({
        icon: 'info',
        title,
        text,
        background: isDark ? '#1e1b2e' : '#ffffff',
        color: isDark ? '#ffffff' : '#000000',
        confirmButtonColor: isDark ? '#7c3aed' : '#3b82f6',
        iconColor: isDark ? '#3b82f6' : '#3b82f6',
      });
    },
    
    confirm: async (title: string, text?: string) => {
      const result = await Swal.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: 'Ya, Lanjutkan',
        cancelButtonText: 'Batal',
        background: isDark ? '#1e1b2e' : '#ffffff',
        color: isDark ? '#ffffff' : '#000000',
        confirmButtonColor: isDark ? '#7c3aed' : '#3b82f6',
        cancelButtonColor: isDark ? '#dc2626' : '#ef4444',
        iconColor: isDark ? '#f59e0b' : '#f59e0b',
      });
      return result.isConfirmed;
    },
    
    loading: (title: string = 'Memproses...', text?: string) => {
      Swal.fire({
        title,
        text,
        background: isDark ? '#1e1b2e' : '#ffffff',
        color: isDark ? '#ffffff' : '#000000',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    },
    
    close: () => {
      Swal.close();
    },
  };
};

export default showAlert;
