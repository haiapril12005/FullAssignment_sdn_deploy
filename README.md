# SimpleQuiz – Assignment 4: Full-stack application

* **Backend**: Node.js + Express + MongoDB (Mongoose), REST API dưới `/api`, xác thực JWT (`verifyUser`, `verifyAdmin`).
* **Frontend**: React 18 (Vite) + **Redux Toolkit** + **React Router** + **Bootstrap 5** (thư mục `client/`).
* **Deploy**: 1 Web Service trên **Render** (Express vừa chạy API vừa phục vụ bản build React) + database **MongoDB Atlas**.

Tài khoản mẫu (sau khi chạy `npm run seed`):

| Vai trò | Username | Password |
|---|---|---|
| Admin (CRUD câu hỏi, quiz) | `mary` | `Mary@123` |
| User thường (chỉ làm quiz) | `john` | `John@123` |

---

## 1. Chạy ở máy (local)

Cần Node.js ≥ 18 và MongoDB (local hoặc Atlas).

```bash
# Backend
npm install
cp .env.example .env        # Windows: copy .env.example .env   -> sửa MONGODB_URI nếu cần
npm run seed                # tạo dữ liệu mẫu + 2 tài khoản ở trên (XOÁ dữ liệu cũ của DB đó)
npm run dev                 # API: http://localhost:3000/api

# Frontend (terminal thứ 2)
cd client
npm install
npm run dev                 # mở http://localhost:5173  (Vite tự chuyển /api sang cổng 3000)
```

Chạy giống hệt bản deploy (1 cổng): `npm run build` rồi `npm start` → http://localhost:3000

---

## 2. Deploy lên web (Render + MongoDB Atlas, đều miễn phí)

### Bước 1 – Tạo database trên MongoDB Atlas

1. Vào https://www.mongodb.com/cloud/atlas/register, đăng ký (có thể dùng Google).
2. **Create** một cluster loại **Free** (chọn region gần, ví dụ Singapore).
3. **Database Access** → *Add New Database User*: đặt username / password (nên dùng mật khẩu chỉ có chữ và số để khỏi phải mã hoá ký tự đặc biệt).
4. **Network Access** → *Add IP Address* → **Allow access from anywhere** (`0.0.0.0/0`). Bắt buộc, vì Render không có IP cố định.
5. **Connect** → *Drivers* → copy connection string, sửa lại thành dạng:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/SimpleQuiz?retryWrites=true&w=majority
   ```
   (nhớ thêm `/SimpleQuiz` trước dấu `?` để đặt tên database).
6. Nạp dữ liệu mẫu lên Atlas từ máy bạn: dán chuỗi trên vào `MONGODB_URI` trong file `.env`, rồi chạy `npm run seed`.

### Bước 2 – Đưa code lên GitHub

```bash
git init
git add .
git commit -m "Assignment 4 - full-stack quiz app"
git branch -M main
git remote add origin https://github.com/<tên-bạn>/simple-quiz.git   # tạo repo trống trên GitHub trước
git push -u origin main
```

`.gitignore` đã loại `node_modules`, `client/dist` và `.env` (không đẩy mật khẩu DB lên GitHub).

### Bước 3 – Tạo Web Service trên Render

1. Vào https://render.com, đăng nhập bằng GitHub.
2. **New → Web Service** → chọn repo vừa push.
3. Điền:
   | Mục | Giá trị |
   |---|---|
   | Runtime | Node |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm start` |
   | Instance Type | Free |
4. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | chuỗi Atlas ở bước 1 |
   | `AUTH_SECRET` | một chuỗi ngẫu nhiên dài bất kỳ |
   | `NODE_VERSION` | `20` |
5. **Create Web Service** → đợi build xong (3–5 phút) → Render cho link dạng `https://simple-quiz-xxxx.onrender.com`. Đó là link nộp cho thầy.

(Hoặc: **New → Blueprint** và chọn repo – Render đọc sẵn `render.yaml`, bạn chỉ cần dán `MONGODB_URI`.)

Kiểm tra nhanh: mở `https://<link>/api/health` → `{"status":"ok"}`.

> Gói Free của Render "ngủ" sau 15 phút không ai truy cập; lần mở đầu tiên mất ~50 giây. **Mở link trước khi demo cho thầy.**
> Mỗi lần `git push` lên `main`, Render tự deploy lại.

---

## 3. Chức năng

| Người dùng | Trang | Làm được |
|---|---|---|
| Chưa đăng nhập | `/login`, `/register` | Đăng nhập, đăng ký (không thể tự đăng ký làm admin) |
| User thường | `/dashboard`, `/dashboard/quiz`, `/dashboard/quiz/:id` | Xem danh sách quiz, chọn đáp án từng câu, **Submit Answer**, cuối cùng xem **Quiz Completed – Your score** + xem lại đáp án, **Restart Quiz** |
| Admin | `/admin`, `/admin/questions`, `/admin/quizzes` | **CRUD câu hỏi** (form + danh sách Edit/Delete), CRUD quiz (chọn câu hỏi cho quiz), và cũng làm quiz được |
| Mọi người đã đăng nhập | Nav | **Logout** |

Redux store (`client/src/store`):

| Slice | Giữ gì | Thunk / action |
|---|---|---|
| `auth` | `token`, `user`, lỗi đăng nhập | `login`, `register`, `fetchMe`, `logout` |
| `quizzes` | danh sách quiz (đã populate câu hỏi) | `fetchQuizzes`, `createQuiz`, `updateQuiz`, `deleteQuiz` |
| `questions` | ngân hàng câu hỏi | `fetchQuestions`, `createQuestion`, `updateQuestion`, `deleteQuestion` |
| `play` | bài đang làm: câu hiện tại, các đáp án đã chọn, đã xong chưa | `startQuiz`, `submitAnswer`, `restartQuiz` |

Token lưu ở `localStorage` và được Axios gắn vào mọi request (`Authorization: Bearer <token>`); token hết hạn (401) → tự logout.

## 4. REST API

Tất cả cần token (frontend phải đăng nhập trước khi lấy quiz), trừ signup/login.

| Method | Endpoint | Quyền |
|---|---|---|
| POST | `/api/users/signup`, `/api/users/login` | Mọi người |
| GET | `/api/users/me` | Đã đăng nhập |
| GET | `/api/users` | Admin |
| GET | `/api/quizzes`, `/api/quizzes/:quizId` | Đã đăng nhập |
| POST / PUT / DELETE | `/api/quizzes`, `/api/quizzes/:quizId` | Admin |
| GET | `/api/questions`, `/api/questions/:questionId` | Đã đăng nhập |
| POST / PUT / DELETE | `/api/questions`, `/api/questions/:questionId` | Admin |

Validation & lỗi: Mongoose validator (text bắt buộc, ≥ 2 options, `correctAnswerIndex` phải trỏ vào một option, id câu hỏi trong quiz phải tồn tại) → **400**; thiếu/sai token → **401**; không phải admin → **403**; không tìm thấy → **404**. Mọi lỗi trả JSON `{ "message": "..." }`.

## 5. Cấu trúc

```
bin/www                 khởi động server (đọc .env, kết nối MongoDB, listen PORT)
app.js                  middleware, /api routes, phục vụ client/dist, xử lý lỗi
authenticate.js         getToken, verifyUser, verifyAdmin, verifyAuthor
models/                 User, Quiz, Question
controllers/            quizController, questionController
routes/                 userRoutes, quizRoutes, questionRoutes
scripts/seed.js         dữ liệu mẫu      scripts/make-admin.js   cấp quyền admin
render.yaml             cấu hình deploy Render
client/                 React app (Vite)
  src/api/client.js     Axios instance + gắn token
  src/store/            Redux Toolkit slices
  src/components/       ProtectedRoute, DashboardLayout, PasswordInput
  src/pages/            Login, Register, UserHome, QuizList, TakeQuiz,
                        AdminHome, ManageQuestions, ManageQuizzes, NotFound
```
