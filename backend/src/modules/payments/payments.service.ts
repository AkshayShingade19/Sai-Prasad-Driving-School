import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, PaymentMethod } from './schemas/payment.schema';
import { CreatePaymentDto, PaymentQueryDto } from './dto/payment.dto';
import { StudentStatus } from '../students/schemas/student.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async create(dto: CreatePaymentDto, userId: string) {
    const payment = await this.paymentModel.create({
      student: new Types.ObjectId(dto.student),
      amount: dto.amount,
      paymentDate: dto.paymentDate || new Date(),
      method: dto.method || PaymentMethod.CASH,
      transactionRef: dto.transactionRef || '',
      notes: dto.notes || '',
      receivedBy: new Types.ObjectId(userId),
    });

    // Update student's amountPaid
    const Student = this.paymentModel.db.model('Student');
    await Student.findByIdAndUpdate(dto.student, {
      $inc: { amountPaid: dto.amount },
    });

    return payment;
  }

  async findAll(query: PaymentQueryDto) {
    const filter: any = { isDeleted: false };

    if (query.student) filter.student = new Types.ObjectId(query.student);
    if (query.method) filter.method = query.method;
    if (query.startDate && query.endDate) {
      filter.paymentDate = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    }

    return this.paymentModel
      .find(filter)
      .populate('student', 'name studentId mobile')
      .populate('receivedBy', 'name')
      .sort({ paymentDate: -1 })
      .limit(200);
  }

  async findOne(id: string) {
    const payment = await this.paymentModel
      .findById(id)
      .populate('student', 'name studentId mobile courseFee amountPaid')
      .populate('receivedBy', 'name');
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getStudentPayments(studentId: string) {
    const payments = await this.paymentModel
      .find({ student: new Types.ObjectId(studentId), isDeleted: false })
      .populate('receivedBy', 'name')
      .sort({ paymentDate: -1 });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    return { payments, totalPaid };
  }

  async getStudentBalance(studentId: string) {
    const Student = this.paymentModel.db.model('Student');
    const student = await Student.findById(studentId);
    if (!student) throw new NotFoundException('Student not found');

    const payments = await this.paymentModel.find({
      student: new Types.ObjectId(studentId),
      isDeleted: false,
    });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = student.courseFee - totalPaid;

    return {
      courseFee: student.courseFee,
      totalPaid,
      balance,
    };
  }

  async getPendingPayments() {
    const Student = this.paymentModel.db.model('Student');
    const students = await Student.find({
      status: StudentStatus.ACTIVE,
      isArchived: false,
    }).lean();

    const pending: any[] = [];
    for (const student of students) {
      const payments = await this.paymentModel.find({
        student: student._id,
        isDeleted: false,
      });
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const balance = student.courseFee - totalPaid;
      if (balance > 0) {
        pending.push({
          studentId: student.studentId,
          name: student.name,
          mobile: student.mobile,
          courseFee: student.courseFee,
          totalPaid,
          balance,
        });
      }
    }

    return pending;
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayTotal, monthTotal, totalReceived] = await Promise.all([
      this.paymentModel.aggregate([
        { $match: { paymentDate: { $gte: today }, isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.paymentModel.aggregate([
        {
          $match: {
            paymentDate: { $gte: new Date(today.getFullYear(), today.getMonth(), 1) },
            isDeleted: false,
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.paymentModel.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      today: todayTotal[0]?.total || 0,
      thisMonth: monthTotal[0]?.total || 0,
      total: totalReceived[0]?.total || 0,
    };
  }

  async remove(id: string) {
    const payment = await this.paymentModel.findById(id);
    if (!payment) throw new NotFoundException('Payment not found');

    // Reverse the payment from student's amountPaid
    const Student = this.paymentModel.db.model('Student');
    await Student.findByIdAndUpdate(payment.student, {
      $inc: { amountPaid: -payment.amount },
    });

    payment.isDeleted = true;
    await payment.save();
    return { message: 'Payment record deleted' };
  }
}
