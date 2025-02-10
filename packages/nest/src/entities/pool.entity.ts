import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { LiquidityProvider } from './liquidityProvider.entity';

@Entity('pools')
export class Pool {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 42 })
  @Index('idx_pools_address', { unique: true })
  address: string;

  @Column({ type: 'varchar', length: 42 })
  @Index('idx_pools_token0')
  token0: string;

  @Column({ type: 'varchar', length: 42 })
  @Index('idx_pools_token1')
  token1: string;

  @Column({
    type: 'numeric',
    precision: 78,
    scale: 0,
    default: '0',
  })
  reserve0: string;

  @Column({
    type: 'numeric',
    precision: 78,
    scale: 0,
    default: '0',
  })
  reserve1: string;

  @Column({
    type: 'numeric',
    precision: 32,
    scale: 0,
    default: '0',
  })
  swaps: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
