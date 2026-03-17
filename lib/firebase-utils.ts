export interface RegistrationData {
  id?: string;
  name: string;
  phone: string;
  fatherName: string;
  motherName: string;
  emergencyPhone: string;
  nid: string;
  birthYear: string;
  address: string;
  union: string;
  ward: string;
  village: string;
  vehicleName: string;
  currentNumber: string;
  color: string;
  bodyNumber?: string;
  batteryModel: string;
  route: string;
  vehicleType: string;
  specialMark?: string;
  vehiclePhotoUrl: string;
  driverPhotoUrl: string;
  generatedId: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: any;
  createdAt: any;
  downloadCount?: number;
  downloadedBy?: string[]; // Array of admin usernames who downloaded
}

export interface AdminData {
  uid: string;
  name: string;
  username: string;
  password?: string;
  phone: string;
  designation: string;
  role: 'super_admin' | 'admin';
  photoUrl: string;
  createdAt: any;
}

// Local Storage Keys
const STORAGE_KEYS = {
  REGISTRATIONS: 'bakshiganj_registrations',
  ADMINS: 'bakshiganj_admins',
};

// Helper to get data from localStorage
const getLocalData = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Helper to save data to localStorage
const saveLocalData = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const UNIONS = [
  "Bakshiganj",
  "Merurchar",
  "Nilakhia",
  "Bagwarchar",
  "Sadhurpara",
  "Battajore",
  "Dhanua Kamalpur"
];

export const WARDS = Array.from({ length: 9 }, (_, i) => (i + 1).toString());

export const VEHICLE_TYPES = ["Big Auto", "Van Auto"];

export async function submitRegistration(data: Omit<RegistrationData, 'createdAt' | 'generatedId'>) {
  const registrations = getLocalData<RegistrationData>(STORAGE_KEYS.REGISTRATIONS);
  const generatedId = data.birthYear.slice(-2) + data.currentNumber;
  
  const newRegistration: RegistrationData = {
    status: 'pending',
    ...data,
    id: data.id || Math.random().toString(36).substr(2, 9),
    generatedId,
    createdAt: new Date().toISOString(),
  };

  registrations.push(newRegistration);
  saveLocalData(STORAGE_KEYS.REGISTRATIONS, registrations);
  return { docId: newRegistration.id, generatedId };
}

export async function getRegistration(id: string) {
  const registrations = getLocalData<RegistrationData>(STORAGE_KEYS.REGISTRATIONS);
  return registrations.find(r => r.id === id || r.currentNumber === id) || null;
}

export async function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function uploadImage(file: File, folder: string) {
  // Instead of Firebase, we return a base64 string (compressed)
  try {
    const base64 = await compressImage(file, 400, 0.5); // Smaller for localStorage
    return base64;
  } catch (error) {
    console.error("Local upload error:", error);
    throw error;
  }
}

export async function searchRegistration(searchTerm: string) {
  const registrations = getLocalData<RegistrationData>(STORAGE_KEYS.REGISTRATIONS);
  return registrations.find(r => 
    r.currentNumber === searchTerm || 
    r.generatedId === searchTerm || 
    r.phone === searchTerm ||
    r.id === searchTerm
  ) || null;
}

export async function getPendingRegistrations() {
  const registrations = getLocalData<RegistrationData>(STORAGE_KEYS.REGISTRATIONS);
  return registrations
    .filter(r => r.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateRegistration(id: string, data: Partial<RegistrationData>) {
  const registrations = getLocalData<RegistrationData>(STORAGE_KEYS.REGISTRATIONS);
  const index = registrations.findIndex(r => r.id === id);
  if (index !== -1) {
    registrations[index] = { ...registrations[index], ...data, updatedAt: new Date().toISOString() } as any;
    saveLocalData(STORAGE_KEYS.REGISTRATIONS, registrations);
  }
}

export async function approveRegistration(id: string, adminUid: string, adminName: string) {
  await updateRegistration(id, {
    status: 'approved',
    approvedBy: adminUid,
    approvedByName: adminName,
    approvedAt: new Date().toISOString(),
  });
}

export async function rejectRegistration(id: string) {
  await updateRegistration(id, { status: 'rejected' });
}

export async function getApprovedRegistrations() {
  const registrations = getLocalData<RegistrationData>(STORAGE_KEYS.REGISTRATIONS);
  return registrations
    .filter(r => r.status === 'approved')
    .sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());
}

export async function deleteRegistration(id: string) {
  const registrations = getLocalData<RegistrationData>(STORAGE_KEYS.REGISTRATIONS);
  const filtered = registrations.filter(r => r.id !== id);
  saveLocalData(STORAGE_KEYS.REGISTRATIONS, filtered);
}

export async function getAdmin(uid: string) {
  const admins = getLocalData<AdminData>(STORAGE_KEYS.ADMINS);
  return admins.find(a => a.uid === uid) || null;
}

export async function addAdmin(data: AdminData) {
  const admins = getLocalData<AdminData>(STORAGE_KEYS.ADMINS);
  admins.push({ ...data, createdAt: new Date().toISOString() });
  saveLocalData(STORAGE_KEYS.ADMINS, admins);
}

export async function getAllAdmins() {
  return getLocalData<AdminData>(STORAGE_KEYS.ADMINS);
}

export async function deleteAdmin(uid: string) {
  const admins = getLocalData<AdminData>(STORAGE_KEYS.ADMINS);
  const filtered = admins.filter(a => a.uid !== uid);
  saveLocalData(STORAGE_KEYS.ADMINS, filtered);
}

export async function incrementDownloadCount(id: string, adminUsername: string) {
  const registrations = getLocalData<RegistrationData>(STORAGE_KEYS.REGISTRATIONS);
  const index = registrations.findIndex(r => r.id === id);
  if (index !== -1) {
    const reg = registrations[index];
    const downloadCount = (reg.downloadCount || 0) + 1;
    const downloadedBy = reg.downloadedBy || [];
    if (!downloadedBy.includes(adminUsername)) {
      downloadedBy.push(adminUsername);
    }
    registrations[index] = { ...reg, downloadCount, downloadedBy };
    saveLocalData(STORAGE_KEYS.REGISTRATIONS, registrations);
    return registrations[index];
  }
  return null;
}

export async function testConnection() {
  return true; // Local storage is always "connected"
}

