import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class LiquidityProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.liquidityProvider, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  user: User;

  @Column({ type: 'varchar', length: 42 })
  address: string;

  @Column({ type: 'numeric', precision: 78, scale: 0, default: 0 })
  totalShares: number;

  // An object that maps the liquidity of each pool to the amount of shares
  // @example
  // {
  //   "0x123...456": 100,
  //   "0x789...012": 200
  // }
  @Column('jsonb', { default: '{}' })
  poolLiquidity: { [key: string]: number };

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
