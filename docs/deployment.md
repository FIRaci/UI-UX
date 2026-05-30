# Hướng dẫn Deploy Backend cho Hệ thống MediCare AI

Vì Frontend đang được host trên Netlify (một dịch vụ public internet), nên Frontend **không thể** gửi request HTTP tới `localhost` (backend chạy trên máy tính của bạn). Để hệ thống hoạt động hoàn chỉnh, bạn cần đưa Backend (FastAPI / Node) lên một máy chủ có IP public.

Dưới đây là một số nền tảng phổ biến, miễn phí để host Backend.

## 1. Sử dụng Render.com (Khuyên dùng cho Backend)

Render cung cấp Web Services miễn phí (sẽ tự động sleep sau 15 phút không dùng) và dễ dàng kết nối với Github.

- **Bước 1**: Đẩy code (bao gồm thư mục backend) lên Github.
- **Bước 2**: Đăng nhập [Render.com](https://render.com).
- **Bước 3**: Chọn **New +** -> **Web Service**.
- **Bước 4**: Chọn Repository Github của bạn.
- **Bước 5**: Cấu hình (ví dụ với Python FastAPI):
  - **Build Command**: `pip install -r requirements.txt` (Hoặc lệnh tương ứng cài đặt thư viện)
  - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Bước 6**: Nhấn "Create Web Service". Sau khi deploy thành công, bạn sẽ nhận được một URL public (ví dụ: `https://medicare-backend.onrender.com`).

## 2. Sử dụng Railway.app

Railway.app cung cấp $5 tín dụng miễn phí mỗi tháng, đủ để chạy một Backend liên tục.

- **Bước 1**: Đăng nhập [Railway.app](https://railway.app).
- **Bước 2**: Nhấn **New Project** -> **Deploy from GitHub repo**.
- **Bước 3**: Railway sẽ tự động nhận diện ngôn ngữ (Node.js hoặc Python) và tự động build.
- **Bước 4**: Vào mục Settings của service, chọn **Generate Domain** để lấy URL public.

## 3. Chạy qua Ngrok (Dành cho việc kiểm thử nhanh)

Nếu bạn chưa muốn đưa backend lên server mà chỉ muốn test từ Netlify, bạn có thể dùng **Ngrok** để tạo đường dẫn public trỏ về `localhost` của máy bạn.

- **Bước 1**: Cài đặt [Ngrok](https://ngrok.com/).
- **Bước 2**: Khi backend chạy ở cổng `8000`, mở terminal và chạy:
  `ngrok http 8000`
- **Bước 3**: Ngrok sẽ tạo ra một URL như `https://1234-abcd.ngrok-free.app`.
- **Bước 4**: Copy URL đó và đưa vào biến môi trường `VITE_AI_SERVICE_URL` của frontend trên Netlify.

---

### Lưu ý trên Netlify (Frontend)
Sau khi có URL của Backend, bạn cần quay lại Netlify:
1. Vào **Site configuration** -> **Environment variables**.
2. Thêm một biến:
   - Key: `VITE_AI_SERVICE_URL`
   - Value: `https://<url-backend-cua-ban>`
3. Trigger một bản **Deploy mới** trên Netlify để hệ thống nhận diện biến môi trường.
