import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum EventType {
  MINT = 'MINT',
  BURN = 'BURN',
  SWAP = 'SWAP',
  SWAP_FORWARDED = 'SWAP_FORWARDED',
  INVESTMENT = 'INVESTMENT',
  DIVESTMENT = 'DIVESTMENT',
  PAIR_CREATED = 'PAIR_CREATED',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  @Index('idx_events_type')
  type: EventType;

  @Column({ type: 'varchar', length: 42 })
  @Index('idx_events_sender')
  sender: string;

  @Column({ type: 'varchar', length: 42, nullable: true })
  poolAddress: string;

  @Column({
    type: 'numeric',
    precision: 78,
    nullable: true,
    default: 0,
  })
  amount0: number;

  @Column({
    type: 'numeric',
    precision: 78,
    nullable: true,
    default: 0,
  })
  amount1: number;

  @Column({ type: 'varchar', length: 42, nullable: true })
  token0: string;

  @Column({ type: 'varchar', length: 42, nullable: true })
  token1: string;

  @Column({ type: 'varchar', length: 66 })
  @Index('idx_events_txhash')
  transactionHash: string;

  @Column({ type: 'integer' })
  blockNumber: number;

  @CreateDateColumn()
  timestamp: Date;
}
