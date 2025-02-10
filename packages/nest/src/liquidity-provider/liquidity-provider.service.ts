import { Inject, Injectable } from '@nestjs/common';
import { LiquidityProvider } from 'src/entities/liquidityProvider.entity';
import { UsersService } from 'src/users/users.service';
import { REPOSITORIES } from 'src/utils/constants';
import { Repository } from 'typeorm';

@Injectable()
export class LiquidityProviderService {
  constructor(
    @Inject(REPOSITORIES.LIQUIDITY_PROVIDER)
    private liquidityProviderRepository: Repository<LiquidityProvider>,
    private usersService: UsersService,
  ) {}
  async findOne(id: number) {
    return this.liquidityProviderRepository.findOne({ where: { id: id } });
  }

  async findAll() {
    return this.liquidityProviderRepository.find();
  }

  async findLPByAddress(address: string) {
    return this.liquidityProviderRepository.findOne({
      where: { address: address },
    });
  }

  async create(createLiquidityProviderDto: Partial<LiquidityProvider>) {
    return this.liquidityProviderRepository.save(createLiquidityProviderDto);
  }

  async update(
    id: number,
    updateLiquidityProviderDto: Partial<LiquidityProvider>,
  ) {
    return this.liquidityProviderRepository.update(
      id,
      updateLiquidityProviderDto,
    );
  }

  async mint(lpAddress: string, poolAddress: string, mintedLiquidity: string) {
    let liquidityProvider = await this.findLPByAddress(lpAddress);
    if (!liquidityProvider) {
      let user = await this.usersService.findByAddress(lpAddress);
      if (!user) {
        user = await this.usersService.create({
          address: lpAddress,
          liquidityProvider: {
            address: lpAddress,
          },
        });
        if (!user) {
          throw new Error('User not found and could not be created');
        }
      }
      liquidityProvider = this.liquidityProviderRepository.create({
        address: lpAddress,
        totalShares: mintedLiquidity,
        poolLiquidity: {
          [poolAddress]: mintedLiquidity,
        },
      });
      if (!liquidityProvider) {
        throw new Error(
          'Liquidity provider not found and could not be created',
        );
      }
    }
    // Update the liquidity provider's total shares
    liquidityProvider.totalShares =
      liquidityProvider.totalShares + mintedLiquidity;

    // Update the pool's liquidity
    liquidityProvider.poolLiquidity[poolAddress] =
      liquidityProvider.poolLiquidity[poolAddress] + mintedLiquidity;
    await this.update(liquidityProvider.id, liquidityProvider);
  }
}
