
import axios from "axios";

// กำหนด BASE_URL ให้ตรงกับ URL ของ Backend (Spring Boot หรืออื่น ๆ)
// ถ้าใช้ไฟล์ .env ใน Vite ก็ดึงจาก import.meta.env.VITE_API_BASE_URL ได้
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

// ฟังก์ชันสำหรับอัปเดตข้อมูลโปรไฟล์ (username + รูปภาพ)
export const updateProfile = (formData, token) => {
  return axios.put(
    `${BASE_URL}/api/user/profile`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // สมมติว่าเราใช้ JWT token
      },
    }
  );
};
