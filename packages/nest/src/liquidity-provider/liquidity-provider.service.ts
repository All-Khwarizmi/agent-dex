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

  async mint(lpAddress: string, poolAddress: string, mintedLiquidity: number) {
    let liquidityProvider = await this.findLPByAddress(lpAddress);
    if (!liquidityProvider) {
      console.log('Creating new liquidity provider');
      let user = await this.usersService.findByAddress(lpAddress.toUpperCase());
      if (!user) {
        console.log('Creating new user');
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
        totalShares: mintedLiquidity.toString(),
        poolLiquidity: {
          [poolAddress]: mintedLiquidity.toString(),
        },
      });
      liquidityProvider =
        await this.liquidityProviderRepository.save(liquidityProvider);
      console.log('LP created', liquidityProvider);
      if (!liquidityProvider) {
        throw new Error(
          'Liquidity provider not found and could not be created',
        );
      }
      return liquidityProvider;
    }
    console.log('LP found', liquidityProvider);
    const newShares = (
      Number(liquidityProvider.totalShares) + mintedLiquidity
    ).toString();

    const newPoolLiquidity = {
      ...liquidityProvider.poolLiquidity,
      [poolAddress]: (
        Number(liquidityProvider.poolLiquidity[poolAddress]) + mintedLiquidity
      ).toString(),
    };

    console.log('Updating liquidity provider', newShares, newPoolLiquidity);
    return await this.liquidityProviderRepository.update(liquidityProvider.id, {
      ...liquidityProvider,
      totalShares: newShares,
      poolLiquidity: newPoolLiquidity,
    });
  }

  async burn(lpAddress: string, poolAddress: string, burntLiquidity: number) {
    const liquidityProvider = await this.findLPByAddress(lpAddress);
    if (!liquidityProvider) {
      throw new Error('Liquidity provider not found');
    }
    // Update the liquidity provider's total shares
    liquidityProvider.totalShares = (
      Number(liquidityProvider.totalShares) - burntLiquidity
    ).toString();

    // Update the pool's liquidity
    liquidityProvider.poolLiquidity[poolAddress] = (
      Number(liquidityProvider.poolLiquidity[poolAddress]) - burntLiquidity
    ).toString();
    toString();
    await this.update(liquidityProvider.id, liquidityProvider);
  }
}
