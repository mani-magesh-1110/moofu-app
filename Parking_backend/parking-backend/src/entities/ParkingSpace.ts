import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('parking_spaces')
export class ParkingSpace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  rating: number;

  @Column({ type: 'decimal', default: 0 })
  distanceKm: number;

  @Column({ default: true })
  isOpen: boolean;

  @Column({ default: 'Open' })
  availabilityText: string;

  @Column()
  address: string;

  @Column()
  area: string;

  @Column()
  city: string;

  @Column({ type: 'int', default: 120 })
  hourlyRate: number;

  @Column({ type: 'int', default: 40 })
  convenienceFee: number;

  @Column({ type: 'simple-json', default: '[]' })
  monthlyPlans: Array<{ id: string; label: string; monthlyPrice: number }>;

  @Column({ type: 'simple-json', default: '[]' })
  spots: Array<{ id: string; spotNumber: string; vehicleTypeAllowed: string[] }>;

  @CreateDateColumn()
  createdAt: Date;
}
