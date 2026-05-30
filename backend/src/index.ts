import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log("Seeding users...");
      const hashedPassword = await Bun.password.hash("123456", { algorithm: "bcrypt", cost: 4 });
      await prisma.user.createMany({
        data: [
          { username: "benhnhan", password: hashedPassword, role: "benhnhan", name: "Nguyễn Minh Khoa" },
          { username: "tuvan", password: hashedPassword, role: "tuvan", name: "CV. Đỗ Thanh Hằng" },
          { username: "bacsi", password: hashedPassword, role: "bacsi", name: "BS. Nguyễn Văn An" },
          { username: "bs_binh", password: hashedPassword, role: "bacsi", name: "BS. Trần Thị Bình" },
          { username: "bs_cuong", password: hashedPassword, role: "bacsi", name: "BS. Lê Hoàng Cường" },
          { username: "bs_dung", password: hashedPassword, role: "bacsi", name: "BS. Phạm Mai Dung" },
          { username: "bs_dat", password: hashedPassword, role: "bacsi", name: "BS. Vũ Quốc Đạt" },
          { username: "bs_hoa", password: hashedPassword, role: "bacsi", name: "BS. Đinh Thị Hoa" },
          { username: "bs_linh", password: hashedPassword, role: "bacsi", name: "BS. Hoàng Thùy Linh" },
          { username: "bs_minh", password: hashedPassword, role: "bacsi", name: "BS. Trương Quang Minh" },
          { username: "bs_thanh", password: hashedPassword, role: "bacsi", name: "BS. Nguyễn Ngọc Thanh" },
          { username: "bs_phong", password: hashedPassword, role: "bacsi", name: "BS. Lê Hải Phong" },
          { username: "quanly", password: hashedPassword, role: "quanly", name: "Quản lý Phòng khám" },
        ]
      });
    }

    const doctorCount = await prisma.doctor.count();
    if (doctorCount === 0) {
      console.log("Seeding doctors...");
      await prisma.doctor.createMany({
        data: [
          { name: "BS. Nguyễn Văn An", spec: "Tim mạch", rating: 4.9, fee: "300.000đ", clinic: "CN Q1", avail: '["08:00", "09:00", "10:30", "14:00"]' },
          { name: "BS. Trần Thị Bình", spec: "Da liễu", rating: 4.8, fee: "250.000đ", clinic: "CN Q3", avail: '["09:30", "11:00", "15:00"]' },
          { name: "BS. Lê Hoàng Cường", spec: "Nhi khoa", rating: 4.7, fee: "280.000đ", clinic: "CN Tân Bình", avail: '["08:30", "10:00", "13:30", "16:00"]' },
          { name: "BS. Phạm Mai Dung", spec: "Tai mũi họng", rating: 4.9, fee: "320.000đ", clinic: "CN Q1", avail: '["09:00", "11:30", "14:30"]' },
          { name: "BS. Vũ Quốc Đạt", spec: "Cơ xương khớp", rating: 4.6, fee: "350.000đ", clinic: "CN Q7", avail: '["08:00", "10:30", "15:30"]' },
          { name: "BS. Đinh Thị Hoa", spec: "Sản phụ khoa", rating: 4.9, fee: "400.000đ", clinic: "CN Phú Nhuận", avail: '["08:00", "09:30", "14:00", "15:30"]' },
          { name: "BS. Hoàng Thùy Linh", spec: "Nội tiết", rating: 4.8, fee: "250.000đ", clinic: "CN Q10", avail: '["08:30", "11:00", "16:00"]' },
          { name: "BS. Trương Quang Minh", spec: "Thần kinh", rating: 4.7, fee: "450.000đ", clinic: "CN Q1", avail: '["09:00", "10:30", "14:00", "16:30"]' },
          { name: "BS. Nguyễn Ngọc Thanh", spec: "Tiêu hóa", rating: 4.8, fee: "300.000đ", clinic: "CN Q3", avail: '["08:00", "10:00", "13:30", "15:00"]' },
          { name: "BS. Lê Hải Phong", spec: "Mắt", rating: 4.9, fee: "250.000đ", clinic: "CN Tân Bình", avail: '["09:30", "11:30", "14:30", "16:00"]' }
        ]
      });
    }

    const apptCount = await prisma.appointment.count();
    if (apptCount === 0) {
      console.log("Seeding appointments...");
      await prisma.appointment.createMany({
        data: [
          { patientName: "Nguyễn Minh Khoa", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-15", time: "09:00", clinic: "CN Q1", status: "Sắp tới", age: 35, symptoms: "Khám định kỳ", level: "Thấp" },
          { patientName: "Trần Văn Hậu", doctorName: "BS. Nguyễn Văn An", doctorSpec: "Tim mạch", date: "2026-05-14", time: "08:00", clinic: "CN Q1", status: "Hoàn thành", age: 58, symptoms: "Đau ngực dữ dội", level: "Khẩn cấp", vitalsBp: "160/100", vitalsHr: "112", vitalsTemp: "37.2°C", vitalsSpo2: "94%" },
          { patientName: "Phạm Thanh Tâm", doctorName: "BS. Trần Thị Bình", doctorSpec: "Da liễu", date: "2026-05-20", time: "10:00", clinic: "CN Q3", status: "Sắp tới", age: 28, symptoms: "Nổi mẩn đỏ", level: "Trung bình" }
        ]
      });
    }

    const threadCount = await prisma.thread.count();
    if (threadCount === 0) {
      console.log("Seeding threads...");
      const thread1 = await prisma.thread.create({
        data: {
          staffId: 1, staffName: "BS. Nguyễn Văn An", staffSpec: "Tim mạch",
          userRole: "benhnhan", userName: "Nguyễn Minh Khoa", topic: "Tư vấn kết quả xét nghiệm",
          status: "Đang diễn ra", last: "Bác sĩ ơi, chỉ số cholesterol của tôi có cao quá không?"
        }
      });
      await prisma.message.createMany({
        data: [
          { threadId: thread1.id, from: "user", txt: "Chào bác sĩ, tôi vừa nhận kết quả máu.", timeStr: "10 phút trước" },
          { threadId: thread1.id, from: "staff", txt: "Chào bạn, bạn gửi kết quả qua đây để tôi xem nhé.", timeStr: "5 phút trước" },
          { threadId: thread1.id, from: "user", txt: "Bác sĩ ơi, chỉ số cholesterol của tôi có cao quá không?", timeStr: "vừa xong" }
        ]
      });

      const thread2 = await prisma.thread.create({
        data: {
          staffId: 2, staffName: "CV. Đỗ Thanh Hằng", staffSpec: "Tâm lý",
          userRole: "tuvan", userName: "Phạm Thanh Tâm", topic: "Tâm lý",
          status: "Đã kết thúc", last: "Cảm ơn chuyên gia, tôi sẽ thử."
        }
      });
      await prisma.message.createMany({
        data: [
          { threadId: thread2.id, from: "user", txt: "Dạo này tôi hay mất ngủ", timeStr: "Hôm qua" },
          { threadId: thread2.id, from: "staff", txt: "Bạn hãy thử thiền 10 phút trước khi ngủ nhé.", timeStr: "Hôm qua" },
          { threadId: thread2.id, from: "user", txt: "Cảm ơn chuyên gia, tôi sẽ thử.", timeStr: "Hôm qua" }
        ]
      });
    }

    const articleCount = await prisma.article.count();
    if (articleCount === 0) {
      console.log("Seeding articles...");
      await prisma.article.createMany({
        data: [
          { title: "Cách nhận biết sớm đột quỵ", category: "Tim mạch", reads: "1.2k", time: "2 giờ trước" },
          { title: "Dinh dưỡng cho người tiểu đường", category: "Nội tiết", reads: "856", time: "5 giờ trước" },
          { title: "Bài tập giảm đau mỏi vai gáy", category: "Cơ xương khớp", reads: "2.1k", time: "1 ngày trước" }
        ]
      });
    }

    const painCount = await prisma.painPoint.count();
    if (painCount === 0) {
      await prisma.painPoint.createMany({
        data: [
          { description: "Role Quản lý: Thiếu tính năng xuất báo cáo hàng loạt", category: "Quản lý - Biểu đồ khó hiểu", evaluation: "Vi phạm tính linh hoạt" }
        ]
      });
    }

    const recordCount = await prisma.patientRecord.count();
    if (recordCount === 0) {
      await prisma.patientRecord.createMany({
        data: [
          { patientName: "Nguyễn Minh Khoa", title: "Khám tổng quát định kỳ", date: "2026-04-22", doctor: "BS. Phạm Mai Dung", note: "Sức khỏe tổng thể tốt.", type: "benhan" }
        ]
      });
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

        if (!user) {
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
      .get("/doctors", async ({ set }) => {
        try {
          return await prisma.doctor.findMany();
        } catch (error) {
          set.status = 500;
          return { error: "Lỗi cơ sở dữ liệu" };
        }
      })
      .get("/articles", async ({ set }) => {
        try {
          return await prisma.article.findMany();
        } catch (error) {
          set.status = 500;
          return { error: "Lỗi cơ sở dữ liệu" };
        }
      })
      .get("/threads", async ({ user, set }) => {
        if (!user) {
          set.status = 401;
          return { error: "Quyền truy cập bị từ chối" };
        }
        try {
          // Both patients and staff need to see their threads.
          // In a real app we would filter by user.id or staff.id.
          // For now, we return all threads to keep frontend logic simpler,
          // but including messages so they map to frontend type Thread.
          const threads = await prisma.thread.findMany({
            include: { messages: true },
            orderBy: { updatedAt: "desc" }
          });
          // map to frontend format
          return threads.map(th => ({
            id: th.id,
            staffId: th.staffId,
            staffName: th.staffName,
            staffSpec: th.staffSpec,
            userRole: th.userRole,
            userName: th.userName,
            topic: th.topic,
            status: th.status,
            last: th.last,
            updatedAt: th.updatedAt.getTime(),
            msgs: th.messages.map(m => ({
              f: m.from,
              txt: m.txt,
              t: m.timeStr
            }))
          }));
        } catch (error) {
          set.status = 500;
          return { error: "Lỗi cơ sở dữ liệu" };
        }
      })
      .post("/threads", async ({ user, body, set }) => {
        if (!user) {
          set.status = 401;
          return { error: "Quyền truy cập bị từ chối" };
        }
        try {
          const thread = await prisma.thread.create({
            data: {
              staffId: body.staffId,
              staffName: body.staffName,
              staffSpec: body.staffSpec,
              userRole: body.userRole,
              userName: body.userName,
              topic: body.topic,
              status: body.status,
              last: body.last,
              messages: {
                create: body.msgs.map((m: any) => ({
                  from: m.f,
                  txt: m.txt,
                  timeStr: m.t
                }))
              }
            },
            include: { messages: true }
          });
          return {
            id: thread.id,
            staffId: thread.staffId,
            staffName: thread.staffName,
            staffSpec: thread.staffSpec,
            userRole: thread.userRole,
            userName: thread.userName,
            topic: thread.topic,
            status: thread.status,
            last: thread.last,
            updatedAt: thread.updatedAt.getTime(),
            msgs: thread.messages.map(m => ({
              f: m.from,
              txt: m.txt,
              t: m.timeStr
            }))
          };
        } catch (error) {
          set.status = 500;
          return { error: "Lỗi cơ sở dữ liệu" };
        }
      }, {
        body: t.Object({
          staffId: t.Integer(),
          staffName: t.String(),
          staffSpec: t.String(),
          userRole: t.String(),
          userName: t.String(),
          topic: t.String(),
          status: t.String(),
          last: t.String(),
          msgs: t.Array(t.Object({
            f: t.String(),
            txt: t.String(),
            t: t.String()
          }))
        })
      })
      .post("/threads/:id/messages", async ({ params, user, body, set }) => {
        if (!user) {
          set.status = 401;
          return { error: "Quyền truy cập bị từ chối" };
        }
        try {
          await prisma.message.create({
            data: {
              threadId: parseInt(params.id),
              from: body.f,
              txt: body.txt,
              timeStr: body.t
            }
          });
          
          const newStatus = body.newStatus;
          // Update thread last message and timestamp
          await prisma.thread.update({
            where: { id: parseInt(params.id) },
            data: {
              last: body.txt,
              ...(newStatus ? { status: newStatus } : {})
            }
          });
          return { success: true };
        } catch (error) {
          set.status = 500;
          return { error: "Lỗi cơ sở dữ liệu" };
        }
      }, {
        body: t.Object({
          f: t.String(),
          txt: t.String(),
          t: t.String(),
          newStatus: t.Optional(t.String())
        })
      })
      .patch("/threads/:id", async ({ params, user, body, set }) => {
        if (!user) {
          set.status = 401;
          return { error: "Quyền truy cập bị từ chối" };
        }
        try {
          const updated = await prisma.thread.update({
            where: { id: parseInt(params.id) },
            data: {
              status: body.status
            }
          });
          return updated;
        } catch (error) {
          set.status = 500;
          return { error: "Lỗi cơ sở dữ liệu" };
        }
      }, {
        body: t.Object({
          status: t.String()
        })
      })
  )
  .get("/", () => "MediCare AI Backend is running!");

seedDatabase().then(() => {
  app.listen(3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
