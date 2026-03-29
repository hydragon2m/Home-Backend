# Home-Server Functional & Technical Flow

Tài liệu mô tả kiến trúc kỹ thuật và các luồng chức năng của hệ thống Home-Server (Multi-tenant, Roles & Invitations).

---

## 1. Kiến trúc Kỹ thuật (Technical Stack)
- **Backend**: NestJS (v11) - framework bền vững, chuẩn hóa cao.
- **ORM**: TypeORM - quản lý Database bằng Entity và Migration.
- **Database**: PostgreSQL - lưu trữ dữ liệu quan hệ, hỗ trợ mạnh cho JSONB sau này.
- **Authentication**: JWT (JSON Web Token) kết hợp với **HttpOnly Cookie** (ngăn chặn XSS).
- **Authorization**: **CASL** (Attribute-Based Access Control) giúp quản lý quyền linh hoạt mức thuộc tính.

---

## 2. Luồng Bảo mật & Đăng nhập (Security Flow)

### Authentication (Xác thực)
1. Người dùng gửi `email/password` lên `/auth/login`.
2. Server xác thực và sinh ra **JWT Token**.
3. Token được lưu vào **HttpOnly Cookie** (tên: `access_token`). 
   - *Lưu ý*: Frontend tự động gửi Cookie này trong mỗi request mà không cần code JS can thiệp (an toàn tuyệt đối).

### Authorization (Phân quyền)
- **JwtAuthGuard**: Kiểm tra xem Cookie có Token hợp lệ không.
- **PoliciesGuard**: Kiểm tra xem Người dùng có quyền truy cập vào Tổ chức (`orgId`) cụ thể hay không.
- **CASL Factory**: Định nghĩa luật chơi dựa trên vai trò:
    - `ORG_ADMIN`: Quyền `manage` (Toàn quyền).
    - `ORG_MEMBER`: Quyền `read` (Chỉ xem).

---

## 3. Quản lý Tổ chức & Mã mời (Invitations)

### Cơ chế Multi-tenancy
- Hệ thống chia dữ liệu theo **Organization**. 
- Mỗi bản ghi liên quan (Thiết bị, Thành viên...) đều bắt buộc có cột `organization_id`.
- **Tenant Swapping**: Người dùng có thể có nhiều tổ chức, khi chuyển đổi, `currentOrgId` trong Token/Cookie sẽ thay đổi giúp Server lọc dữ liệu chuẩn xác.

### Luồng Mã mời (Family Link)
1. **Admin** gọi API sinh mã (8 ký tự ngẫu nhiên).
2. Mã được lưu kèm: `organizationId`, `role` (Admin/Member), `expiresAt` (Hạn dùng) và `maxUses` (Lượt dùng).
3. **Thành viên mới** gia nhập qua `POST /organizations/join/:code`. 
4. Hệ thống tự động tạo liên kết trong bảng `user_organizations` mà không cần Admin phải add tay.

---

## 4. Quản lý Database (Migration)
Hệ thống **không dùng `synchronize: true`** ở môi trường Production (EC2) để tránh rủi ro mất dữ liệu. 

**Quy trình chuẩn:**
1. Thay đổi code Entity.
2. `pnpm migration:generate`: Tự động so sánh Code và DB để sinh file `.ts` chứa SQL.
3. `pnpm migration:run`: Thực thi thay đổi vào DB.

---

## 5. Danh sách API Quan trọng

| Chức năng | Method | Endpoint | Lưu ý |
| :--- | :--- | :--- | :--- |
| Đăng ký | POST | `/auth/register` | Tự tạo Org mặc định |
| Đăng nhập | POST | `/auth/login` | Trả về Set-Cookie |
| Tạo mã mời | POST | `/organizations/:orgId/invites` | Chỉ Admin mới tạo được |
| Tham gia | POST | `/organizations/join/:code` | Tự động gán Role |
| Check Health | GET | `/health` | Check uptime cho AWS ALB |
