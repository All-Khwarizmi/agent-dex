import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

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

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  reserve0: string;

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  reserve1: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
