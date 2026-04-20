import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { ParkingSpace } from './ParkingSpace';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => ParkingSpace)
  parkingSpace: ParkingSpace;

  @Column()
  parkingId: string;

  @Column()
  vehicleType: string;

  @Column()
  vehicleNumber: string;

  @Column({ nullable: true })
  arrivalDateISO: string;

  @Column({ nullable: true })
  arrivalTimeLabel: string;

  @Column({ nullable: true })
  departureDateISO: string;

  @Column({ nullable: true })
  departureTimeLabel: string;

  @Column({ default: 2 })
  durationHours: number;

  @Column({ nullable: true })
  selectedMonthlyPlanId: string;

  @Column({ type: 'decimal', default: 0 })
  estimatedSubtotal: number;

  @Column({ type: 'decimal', default: 0 })
  convenienceFee: number;

  @Column({ type: 'decimal', default: 0 })
  totalAmount: number;

  @Column({ nullable: true })
  paymentMethodId: string;

  @Column({ unique: true, nullable: true })
  tokenNo: string;

  @CreateDateColumn()
  createdAtISO: Date;
}
