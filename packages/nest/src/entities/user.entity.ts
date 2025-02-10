import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { LiquidityProvider } from './liquidityProvider.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne(
    () => LiquidityProvider,
    (liquidityProvider) => liquidityProvider.user,
    { eager: true },
  )
  liquidityProvider: LiquidityProvider;

  @Column({ type: 'varchar', length: 42, unique: true })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_users_email')
  email: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  @Index('idx_users_status')
  status: UserStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
