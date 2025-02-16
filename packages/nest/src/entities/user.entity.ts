import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { LiquidityProvider } from './liquidity-provider.entity';

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
    { eager: true, nullable: true },
  )
  liquidityProvider: LiquidityProvider;

  @Column({ type: 'varchar', length: 42 })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({
    type: 'numeric',
    precision: 32,
    default: 0,
  })
  swaps: number;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
