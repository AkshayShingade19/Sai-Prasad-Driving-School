import { NestFactory } from '@nestjs/core';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { User, UserDocument } from './modules/users/schemas/user.schema';
import { Settings, SettingsDocument } from './modules/settings/schemas/settings.schema';
import { Course, CourseDocument } from './modules/courses/schemas/course.schema';
import { Instructor, InstructorDocument } from './modules/instructors/schemas/instructor.schema';
import { Student, StudentDocument, StudentStatus } from './modules/students/schemas/student.schema';
import { Lesson, LessonDocument, LessonStatus } from './modules/lessons/schemas/lesson.schema';
import { Attendance, AttendanceDocument, AttendanceStatus } from './modules/attendance/schemas/attendance.schema';
import { DemoBooking, DemoBookingDocument, DemoStatus } from './modules/demo-bookings/schemas/demo-booking.schema';
import { ServiceRequest, ServiceRequestDocument, ServiceStatus, ServiceType } from './modules/service-requests/schemas/service-request.schema';
import { Payment, PaymentDocument, PaymentMethod } from './modules/payments/schemas/payment.schema';
import { Role } from './modules/auth/roles.enum';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const settingsModel = app.get<Model<SettingsDocument>>(getModelToken(Settings.name));
  const courseModel = app.get<Model<CourseDocument>>(getModelToken(Course.name));
  const instructorModel = app.get<Model<InstructorDocument>>(getModelToken(Instructor.name));
  const studentModel = app.get<Model<StudentDocument>>(getModelToken(Student.name));
  const lessonModel = app.get<Model<LessonDocument>>(getModelToken(Lesson.name));
  const attendanceModel = app.get<Model<AttendanceDocument>>(getModelToken(Attendance.name));
  const demoBookingModel = app.get<Model<DemoBookingDocument>>(getModelToken(DemoBooking.name));
  const serviceRequestModel = app.get<Model<ServiceRequestDocument>>(getModelToken(ServiceRequest.name));
  const paymentModel = app.get<Model<PaymentDocument>>(getModelToken(Payment.name));

  console.log('Seeding database...');

  // Create admin user
  const existingAdmin = await userModel.findOne({ email: 'admin@drivingschool.com' });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    await userModel.create({
      name: 'Admin',
      email: 'admin@drivingschool.com',
      password: hashedPassword,
      role: Role.ADMIN,
      phone: '+91 9876543210',
      isActive: true,
    });
    console.log('Admin user created: admin@drivingschool.com / Admin@123');
  }

  // Create sample instructor
  const existingInstructor = await userModel.findOne({ email: 'instructor@drivingschool.com' });
  if (!existingInstructor) {
    const hashedPassword = await bcrypt.hash('Instructor@123', 12);
    await userModel.create({
      name: 'Suresh Yadav',
      email: 'instructor@drivingschool.com',
      password: hashedPassword,
      role: Role.INSTRUCTOR,
      phone: '+91 9876543211',
      isActive: true,
    });
    console.log('Instructor user created: instructor@drivingschool.com / Instructor@123');
  }

  // Create sample receptionist
  const existingReceptionist = await userModel.findOne({ email: 'reception@drivingschool.com' });
  if (!existingReceptionist) {
    const hashedPassword = await bcrypt.hash('Reception@123', 12);
    await userModel.create({
      name: 'Priya Sharma',
      email: 'reception@drivingschool.com',
      password: hashedPassword,
      role: Role.RECEPTIONIST,
      phone: '+91 9876543212',
      isActive: true,
    });
    console.log('Receptionist user created: reception@drivingschool.com / Reception@123');
  }

  // Create settings
  const existingSettings = await settingsModel.findOne();
  if (!existingSettings) {
    await settingsModel.create({
      businessName: 'Sai Prasad Driving School',
      phone: '+91 8600740507',
      whatsapp: '918600740507',
      email: 'info@saiprasaddrivingschool.com',
      address: 'Shop 23, Near SAIPRASAD ENTERPRISE',
      city: 'Kolhapur',
      state: 'Maharashtra',
      pincode: '416001',
      timezone: 'Asia/Kolkata',
      googleMapsEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121104.29897331083!2d74.41574269726563!3d18.460573900000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc3150020f6b031%3A0x47b2ead4c4c1aaeb!2sSAIPRASAD%20ENTERPRISE!5e0!3m2!1sen!2sin!4v1792438043914!5m2!1sen!2sin',
      aboutUs: 'Sai Prasad Driving School has been teaching safe driving skills for over 10 years. Our certified instructors provide patient, professional training for beginners and experienced drivers alike.',
      mission: 'To create confident, responsible drivers through quality education and personalized attention.',
    });
    console.log('Settings created');
  }

  // Create sample courses
  const existingCourses = await courseModel.countDocuments();
  if (existingCourses === 0) {
    await courseModel.create([
      {
        name: 'Beginner Driving Course',
        description: 'Complete driving course for beginners. Learn from scratch with our certified instructors.',
        durationWeeks: 4,
        sessions: 12,
        price: 4500,
        transmission: 'manual',
        isActive: true,
      },
      {
        name: 'Advanced Driving Course',
        description: 'For those with some experience. Focus on highway driving, parking, and defensive techniques.',
        durationWeeks: 2,
        sessions: 8,
        price: 3500,
        transmission: 'manual',
        isActive: true,
      },
      {
        name: 'Refresher Course',
        description: 'Get back on the road with confidence. Perfect for those who have not driven in a while.',
        durationWeeks: 1,
        sessions: 4,
        price: 2000,
        transmission: 'both',
        isActive: true,
      },
      {
        name: 'Automatic Transmission Course',
        description: 'Learn to drive automatic transmission vehicles with ease.',
        durationWeeks: 3,
        sessions: 10,
        price: 5000,
        transmission: 'automatic',
        isActive: true,
      },
    ]);
    console.log('Courses created');
  }

  // Create sample instructors
  const existingInstructors = await instructorModel.countDocuments();
  if (existingInstructors === 0) {
    await instructorModel.create([
      {
        name: 'Suresh Yadav',
        phone: '+91 9876543211',
        email: 'suresh@drivingschool.com',
        licenseNumber: 'DL-2020-MH-12345',
        experience: '8 years',
        transmission: 'manual',
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      },
      {
        name: 'Rajesh Kumar',
        phone: '+91 9876543213',
        email: 'rajesh@drivingschool.com',
        licenseNumber: 'DL-2018-MH-67890',
        experience: '10 years',
        transmission: 'both',
        weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      },
    ]);
    console.log('Instructors created');
  }

  // Create sample students
  const existingStudents = await studentModel.countDocuments();
  if (existingStudents === 0) {
    const courses = await courseModel.find().lean();
    const instructors = await instructorModel.find().lean();

    if (courses.length > 0 && instructors.length > 0) {
      const students = [
        {
          studentId: 'SPD-2026-0001',
          name: 'Amit Sharma',
          mobile: '9876500001',
          email: 'amit@example.com',
          course: courses[0]._id,
          instructor: instructors[0]._id,
          startDate: new Date('2026-01-05'),
          plannedLessons: 12,
          completedLessons: 5,
          courseFee: 4500,
          amountPaid: 2500,
          status: StudentStatus.ACTIVE,
          transmission: 'manual',
        },
        {
          studentId: 'SPD-2026-0002',
          name: 'Priya Patel',
          mobile: '9876500002',
          email: 'priya@example.com',
          course: courses[1]._id,
          instructor: instructors[1]._id,
          startDate: new Date('2026-01-10'),
          plannedLessons: 8,
          completedLessons: 3,
          courseFee: 3500,
          amountPaid: 1500,
          status: StudentStatus.ACTIVE,
          transmission: 'manual',
        },
        {
          studentId: 'SPD-2026-0003',
          name: 'Rahul Verma',
          mobile: '9876500003',
          email: 'rahul@example.com',
          course: courses[2]._id,
          instructor: instructors[0]._id,
          startDate: new Date('2025-12-15'),
          plannedLessons: 4,
          completedLessons: 4,
          courseFee: 2000,
          amountPaid: 2000,
          status: StudentStatus.COMPLETED,
          transmission: 'both',
        },
      ];

      await studentModel.create(students);
      console.log('Students created');

      // Give seeded students portal access (email + default password Sai@<last4 of mobile>)
      const bcrypt = require('bcryptjs');
      for (const s of students) {
        const tail = s.mobile.replace(/\D/g, '').slice(-4).padStart(4, '0');
        await studentModel.updateOne(
          { studentId: s.studentId },
          { $set: { password: await bcrypt.hash(`Sai@${tail}`, 12), isActive: true } },
        );
      }
      console.log('Student portal passwords set (default: Sai@ + last 4 digits of mobile)');

      // Create sample lessons
      const today = new Date();
      const student1 = await studentModel.findOne({ studentId: 'SPD-2026-0001' });
      const student2 = await studentModel.findOne({ studentId: 'SPD-2026-0002' });
      const lessons = [
        {
          student: student1?._id,
          instructor: instructors[0]._id,
          course: courses[0]._id,
          date: today,
          startTime: '09:00',
          duration: 60,
          status: LessonStatus.SCHEDULED,
          transmission: 'manual',
        },
        {
          student: student2?._id,
          instructor: instructors[1]._id,
          course: courses[1]._id,
          date: today,
          startTime: '10:00',
          duration: 60,
          status: LessonStatus.SCHEDULED,
          transmission: 'manual',
        },
      ];

      await lessonModel.create(lessons);
      console.log('Lessons created');

      // Create sample attendance
      const createdLessons = await lessonModel.find().lean();
      if (createdLessons.length > 0) {
        const lesson0: any = createdLessons[0];
        await attendanceModel.create([
          {
            student: lesson0.student,
            instructor: lesson0.instructor,
            lesson: lesson0._id,
            course: lesson0.course,
            date: today,
            scheduledTime: '09:00',
            status: AttendanceStatus.PRESENT,
            checkInTime: new Date(today.getTime() + 9 * 60 * 60 * 1000),
            checkOutTime: new Date(today.getTime() + 10 * 60 * 60 * 1000),
            duration: 60,
            markedBy: null,
            markedAt: new Date(),
          },
        ]);
        console.log('Attendance created');
      }

      // Create sample payments
      const student1ForPayment = await studentModel.findOne({ studentId: 'SPD-2026-0001' });
      const student2ForPayment = await studentModel.findOne({ studentId: 'SPD-2026-0002' });
      await paymentModel.create([
        {
          student: student1ForPayment?._id,
          amount: 2500,
          paymentDate: new Date('2026-01-05'),
          method: PaymentMethod.CASH,
          receivedBy: null,
        },
        {
          student: student2ForPayment?._id,
          amount: 1500,
          paymentDate: new Date('2026-01-10'),
          method: PaymentMethod.UPI,
          transactionRef: 'UPI123456',
          receivedBy: null,
        },
      ]);
      console.log('Payments created');
    }
  }

  // Create sample demo bookings
  const existingDemos = await demoBookingModel.countDocuments();
  if (existingDemos === 0) {
    await demoBookingModel.create([
      {
        name: 'Vikram Singh',
        mobile: '9876500010',
        email: 'vikram@example.com',
        preferredDate: '2026-01-20',
        preferredTime: '10:00',
        course: 'Beginner Driving Course',
        experience: 'beginner',
        contactMethod: 'phone',
        status: DemoStatus.NEW,
        consent: true,
      },
      {
        name: 'Neha Gupta',
        mobile: '9876500011',
        email: 'neha@example.com',
        preferredDate: '2026-01-21',
        preferredTime: '14:00',
        course: 'Automatic Transmission Course',
        experience: 'some_experience',
        contactMethod: 'whatsapp',
        status: DemoStatus.CONTACTED,
        consent: true,
      },
    ]);
    console.log('Demo bookings created');
  }

  // Create sample service requests
  const existingServices = await serviceRequestModel.countDocuments();
  if (existingServices === 0) {
    await serviceRequestModel.create([
      {
        requestId: 'SRV-2026-0001',
        customerName: 'Amit Sharma',
        contactNumber: '9876500001',
        serviceType: ServiceType.INSURANCE,
        vehicleRegNumber: 'MH-12-AB-1234',
        status: ServiceStatus.IN_PROGRESS,
        estimatedFee: 500,
      },
      {
        requestId: 'SRV-2026-0002',
        customerName: 'Priya Patel',
        contactNumber: '9876500002',
        serviceType: ServiceType.PUC,
        vehicleRegNumber: 'MH-12-CD-5678',
        status: ServiceStatus.NEW,
        estimatedFee: 300,
      },
    ]);
    console.log('Service requests created');
  }

  console.log('Seeding complete!');
  await app.close();
}

void seed();
