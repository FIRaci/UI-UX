import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    const apptCount = await prisma.appointment.count();
    if (apptCount === 0) {
      console.log("Seeding initial appointments...");
      const initialAppts = [
        { patientName: "Trần Văn Hậu", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-14", time: "08:00", clinic: "CN Q1", status: "Sắp tới", age: 58, symptoms: "Đau ngực dữ dội, khó thở", level: "Khẩn cấp", vitalsBp: "160/100", vitalsHr: "112", vitalsTemp: "37.2°C", vitalsSpo2: "94%" },
        { patientName: "Đặng Quỳnh Anh", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-14", time: "08:45", clinic: "CN Q1", status: "Sắp tới", age: 34, symptoms: "Sốt cao, đau đầu kéo dài 3 ngày", level: "Cao", vitalsBp: "120/80", vitalsHr: "98", vitalsTemp: "39.1°C", vitalsSpo2: "97%" },
        { patientName: "Phạm Bích Ngọc", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-14", time: "09:30", clinic: "CN Q1", status: "Sắp tới", age: 47, symptoms: "Đau lưng dưới, tê chân phải", level: "Trung bình", vitalsBp: "125/82", vitalsHr: "78", vitalsTemp: "36.7°C", vitalsSpo2: "98%" },
        { patientName: "Lê Văn Tú", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-14", time: "10:00", clinic: "CN Q1", status: "Sắp tới", age: 41, symptoms: "Tái khám tăng huyết áp", level: "Trung bình", vitalsBp: "138/88", vitalsHr: "82", vitalsTemp: "36.8°C", vitalsSpo2: "98%" },
        { patientName: "Mai Hồng Yến", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-14", time: "10:45", clinic: "CN Q1", status: "Sắp tới", age: 29, symptoms: "Khám sức khỏe định kỳ", level: "Thấp", vitalsBp: "118/76", vitalsHr: "72", vitalsTemp: "36.5°C", vitalsSpo2: "99%" },
        { patientName: "Nguyễn Minh Khoa", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-10", time: "09:00", clinic: "CN Q1", status: "Sắp tới" },
        { patientName: "Nguyễn Minh Khoa", doctorName: "BS. Phạm Mai Dung", doctorSpec: "Tai mũi họng", date: "2026-04-22", time: "14:30", clinic: "CN Q1", status: "Hoàn thành" },
        { patientName: "Nguyễn Minh Khoa", doctorName: "BS. Trần Thị Bình", doctorSpec: "Da liễu", date: "2026-04-05", time: "10:00", clinic: "CN Q3", status: "Hoàn thành" },
        { patientName: "Trần Thu Hà", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-08", time: "09:30", clinic: "CN Q1", status: "Sắp tới" },
      ];
      await prisma.appointment.createMany({ data: initialAppts });
    }

    const painCount = await prisma.painPoint.count();
    if (painCount === 0) {
      console.log("Seeding initial pain points...");
      const initialPainPoints = [
        { description: "Role Quản lý: Thiếu tính năng xuất báo cáo hàng loạt", category: "Quản lý - Biểu đồ khó hiểu", evaluation: "Vi phạm tính linh hoạt và hiệu quả sử dụng (Heuristic #7). Nên thêm Checkbox đa chọn." },
        { description: "Role Bệnh nhân: Không biết cách hủy lịch", category: "Bệnh nhân - Khó đặt lịch", evaluation: "Vi phạm User Control and Freedom (Heuristic #3). Cần làm rõ nút Hủy trong Dashboard." }
      ];
      await prisma.painPoint.createMany({ data: initialPainPoints });
    }

    const recordCount = await prisma.patientRecord.count();
    if (recordCount === 0) {
      console.log("Seeding initial patient records...");
      const initialRecords = [
        { patientName: "Nguyễn Minh Khoa", title: "Khám tổng quát định kỳ", date: "2026-04-22", doctor: "BS. Phạm Mai Dung", note: "Sức khỏe tổng thể tốt, huyết áp ổn định.", type: "benhan" },
        { patientName: "Nguyễn Minh Khoa", title: "Viêm họng cấp", date: "2026-02-10", doctor: "BS. Lê Hoàng Cường", note: "Kê đơn thuốc kháng sinh 7 ngày.", type: "benhan" },
        { patientName: "Nguyễn Minh Khoa", title: "Xét nghiệm máu", date: "2026-04-22", doctor: "Lab Trung tâm", note: "Trong giới hạn bình thường.", type: "ketqua" },
        { patientName: "Nguyễn Minh Khoa", title: "Siêu âm bụng", date: "2026-04-22", doctor: "Lab Trung tâm", note: "Không phát hiện bất thường.", type: "ketqua" },
        { patientName: "Nguyễn Minh Khoa", title: "Đơn thuốc viêm họng", date: "2026-02-10", doctor: "BS. Lê Hoàng Cường", note: "Amoxicillin 500mg • Paracetamol 500mg • Vitamin C", type: "donthuoc" }
      ];
      await prisma.patientRecord.createMany({ data: initialRecords });
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

const app = new Elysia()
  .use(cors())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret",
    })
  )
  .derive(async ({ jwt, headers }) => {
    const authHeader = headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = await jwt.verify(token);
      if (payload) {
        return {
          user: payload as { username: string; role: string; id?: string }
        };
      }
    }
    return { user: null };
  })
  .post(
    "/api/auth/register",
    async ({ body, set }) => {
      try {
        const existing = await prisma.user.findUnique({
          where: { username: body.username },
        });
        if (existing) {
          set.status = 400;
          return { error: "Tên đăng nhập đã tồn tại" };
        }

        // Verify staffCode if trying to register as a staff member
        if (body.role !== "benhnhan" && body.staffCode !== "MEDICARE_STAFF_2026") {
          set.status = 403;
          return { error: "Mã xác thực nhân viên không chính xác" };
        }
        
        // Securely hash password using Bun's built-in hasher
        const hashedPassword = await Bun.password.hash(body.password, {
          algorithm: "bcrypt",
          cost: 4 // low cost for faster dev testing/tests
        });

        const user = await prisma.user.create({
          data: {
            username: body.username,
            password: hashedPassword,
            role: body.role,
            name: body.name || body.username,
          },
        });
        return { success: true, user: { id: user.id, username: user.username, role: user.role } };
      } catch (error) {
        set.status = 500;
        return { error: "Lỗi server khi đăng ký" };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
        role: t.String(),
        name: t.Optional(t.String()),
        staffCode: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/api/auth/login",
    async ({ body, jwt, set }) => {
      try {
        // Find user by username
        const user = await prisma.user.findUnique({
          where: { username: body.username },
        });

        // Quick login support for "123456" for testing roles
        if (!user) {
          if (["benhnhan", "tuvan", "bacsi", "chuyengia", "quanly"].includes(body.username) && body.password === "123456") {
             // Mock success for testing default roles
             const token = await jwt.sign({ username: body.username, role: body.username });
             return { success: true, token, user: { username: body.username, role: body.username } };
          }
          set.status = 401;
          return { error: "Sai tài khoản hoặc mật khẩu" };
        }

        // Verify hashed password
        const isMatch = await Bun.password.verify(body.password, user.password);
        if (!isMatch) {
          set.status = 401;
          return { error: "Sai tài khoản hoặc mật khẩu" };
        }

        const token = await jwt.sign({ id: user.id, username: user.username, role: user.role });
        return { success: true, token, user: { id: user.id, username: user.username, role: user.role, name: user.name } };
      } catch (error) {
        set.status = 500;
        return { error: "Lỗi server khi đăng nhập" };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  )
  .group("/api", (group) =>
    group
      .onBeforeHandle(({ user, set }) => {
        if (!user) {
          set.status = 401;
          return { error: "Không được phép truy cập (Thiếu token xác thực hoặc đã hết hạn)" };
        }
      })
      .get("/painpoints", async ({ user, set }) => {
        if (user?.role !== "chuyengia" && user?.role !== "quanly") {
          set.status = 403;
          return { error: "Quyền truy cập bị từ chối" };
        }
        try {
          return await prisma.painPoint.findMany({
            orderBy: { createdAt: "desc" }
          });
        } catch (error) {
          set.status = 500;
          return { error: "Lỗi cơ sở dữ liệu khi truy vấn pain points" };
        }
      })
      .post(
        "/painpoints",
        async ({ user, body, set }) => {
          if (user?.role !== "chuyengia") {
            set.status = 403;
            return { error: "Quyền truy cập bị từ chối" };
          }
          try {
            const painPoint = await prisma.painPoint.create({
              data: {
                description: body.description,
                category: body.category,
                evaluation: body.evaluation,
              },
            });
            return painPoint;
          } catch (error) {
            set.status = 500;
            return { error: "Lỗi cơ sở dữ liệu khi lưu pain point" };
          }
        },
        {
          body: t.Object({
            description: t.String(),
            category: t.String(),
            evaluation: t.String(),
          }),
        }
      )
      .get("/appointments", async ({ user, set }) => {
        if (!user) {
          set.status = 401;
          return { error: "Không được phép truy cập" };
        }
        try {
          return await prisma.appointment.findMany({
            orderBy: { date: "asc" }
          });
        } catch (error) {
          set.status = 500;
          return { error: "Lỗi cơ sở dữ liệu khi truy vấn lịch hẹn" };
        }
      })
      .post(
        "/appointments",
        async ({ user, body, set }) => {
          if (user?.role !== "benhnhan" && user?.role !== "tuvan" && user?.role !== "quanly") {
            set.status = 403;
            return { error: "Quyền truy cập bị từ chối (Chỉ bệnh nhân, tư vấn viên hoặc quản lý mới có thể đặt lịch)" };
          }
          try {
            const appointment = await prisma.appointment.create({
              data: {
                patientName: body.patientName,
                doctorName: body.doctorName,
                doctorSpec: body.doctorSpec,
                date: body.date,
                time: body.time,
                clinic: body.clinic,
                status: body.status,
                age: body.age,
                symptoms: body.symptoms,
                level: body.level,
                vitalsBp: body.vitalsBp,
                vitalsHr: body.vitalsHr,
                vitalsTemp: body.vitalsTemp,
                vitalsSpo2: body.vitalsSpo2,
              },
            });
            return appointment;
          } catch (error) {
            set.status = 500;
            return { error: "Lỗi cơ sở dữ liệu khi đặt lịch hẹn" };
          }
        },
        {
          body: t.Object({
            patientName: t.String(),
            doctorName: t.String(),
            doctorSpec: t.String(),
            date: t.String(),
            time: t.String(),
            clinic: t.String(),
            status: t.String(),
            age: t.Optional(t.Integer()), // Strict Integer validation for Prisma Int?
            symptoms: t.Optional(t.String()),
            level: t.Optional(t.String()),
            vitalsBp: t.Optional(t.String()),
            vitalsHr: t.Optional(t.String()),
            vitalsTemp: t.Optional(t.String()),
            vitalsSpo2: t.Optional(t.String()),
          }),
        }
      )
      .patch(
        "/appointments/:id",
        async ({ params, user, body, set }) => {
          if (user?.role !== "benhnhan" && user?.role !== "bacsi" && user?.role !== "quanly") {
            set.status = 403;
            return { error: "Quyền truy cập bị từ chối" };
          }
          try {
            const updated = await prisma.appointment.update({
              where: { id: params.id },
              data: {
                status: body.status,
                date: body.date,
                time: body.time,
              },
            });
            return updated;
          } catch (error) {
            set.status = 404;
            return { error: "Không tìm thấy lịch hẹn hoặc cập nhật thất bại" };
          }
        },
        {
          body: t.Object({
            status: t.Optional(t.String()),
            date: t.Optional(t.String()),
            time: t.Optional(t.String()),
          }),
        }
      )
      .get("/notifications", async ({ set }) => {
        try {
          return await prisma.notification.findMany({
            orderBy: { createdAt: "desc" }
          });
        } catch (error) {
          set.status = 500;
          return { error: "Lỗi cơ sở dữ liệu khi truy vấn thông báo" };
        }
      })
      .post(
        "/notifications",
        async ({ user, body, set }) => {
          if (user?.role !== "quanly") {
            set.status = 403;
            return { error: "Quyền truy cập bị từ chối" };
          }
          try {
            const notif = await prisma.notification.create({
              data: {
                target: body.target,
                title: body.title,
                content: body.content,
                time: body.time,
                status: "sent",
              },
            });
            return notif;
          } catch (error) {
            set.status = 500;
            return { error: "Lỗi cơ sở dữ liệu khi gửi thông báo" };
          }
        },
        {
          body: t.Object({
            target: t.String(),
            title: t.String(),
            content: t.String(),
            time: t.String(),
          }),
        }
      )
      .delete(
        "/notifications/:id",
        async ({ user, params, set }) => {
          if (user?.role !== "quanly") {
            set.status = 403;
            return { error: "Quyền truy cập bị từ chối" };
          }
          try {
            await prisma.notification.delete({
              where: { id: params.id },
            });
            return { success: true };
          } catch (error) {
            set.status = 404;
            return { error: "Không tìm thấy thông báo" };
          }
        }
      )
      .get("/records", async ({ user, set }) => {
        if (user?.role !== "bacsi" && user?.role !== "benhnhan" && user?.role !== "quanly") {
          set.status = 403;
          return { error: "Quyền truy cập bị từ chối" };
        }
        try {
          return await prisma.patientRecord.findMany({
            orderBy: { date: "desc" }
          });
        } catch (error) {
          set.status = 500;
          return { error: "Lỗi cơ sở dữ liệu khi truy vấn bệnh án" };
        }
      })
      .post(
        "/records",
        async ({ user, body, set }) => {
          if (user?.role !== "bacsi") {
            set.status = 403;
            return { error: "Quyền truy cập bị từ chối (Chỉ bác sĩ mới được tạo bệnh án)" };
          }
          try {
            const record = await prisma.patientRecord.create({
              data: {
                patientName: body.patientName,
                title: body.title,
                date: body.date,
                doctor: body.doctor,
                note: body.note,
                type: body.type,
              },
            });
            return record;
          } catch (error) {
            set.status = 500;
            return { error: "Lỗi cơ sở dữ liệu khi tạo bệnh án mới" };
          }
        },
        {
          body: t.Object({
            patientName: t.String(),
            title: t.String(),
            date: t.String(),
            doctor: t.String(),
            note: t.String(),
            type: t.String(),
          }),
        }
      )
  )
  .get("/", () => "MediCare AI Backend is running!");

seedDatabase().then(() => {
  app.listen(3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
