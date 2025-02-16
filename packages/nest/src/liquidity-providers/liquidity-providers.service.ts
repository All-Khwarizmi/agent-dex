import { Inject, Injectable } from '@nestjs/common';
import { LiquidityProvider } from 'src/entities/liquidity-provider.entity';
import { UsersService } from '../users/users.service';
import { REPOSITORIES } from '../utils/constants';
import { formatNumber } from '../utils/utilities/format-number';
import { Repository } from 'typeorm';

@Injectable()
export class LiquidityProvidersService {
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

      liquidityProvider = await this.liquidityProviderRepository.save({
        address: lpAddress,
        totalShares: mintedLiquidity,
        poolLiquidity: {
          [poolAddress]: mintedLiquidity,
        },
        user,
      });

      console.log('LP created', liquidityProvider);
      if (!liquidityProvider) {
        throw new Error(
          'Liquidity provider not found and could not be created',
        );
      }
      return liquidityProvider;
    }

    console.log('LP found', liquidityProvider);
    const newShares =
      formatNumber(liquidityProvider.totalShares) + mintedLiquidity;

    const newPoolLiquidity = {
      ...liquidityProvider.poolLiquidity,
      [poolAddress]:
        formatNumber(liquidityProvider.poolLiquidity[poolAddress]) +
        mintedLiquidity,
    };

    console.log('Updating liquidity provider', newShares, newPoolLiquidity);
    return await this.liquidityProviderRepository.update(liquidityProvider.id, {
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
    liquidityProvider.totalShares =
      formatNumber(liquidityProvider.totalShares) - burntLiquidity;

    // Update the pool's liquidity
    liquidityProvider.poolLiquidity[poolAddress] =
      formatNumber(liquidityProvider.poolLiquidity[poolAddress]) -
      burntLiquidity;
    await this.update(liquidityProvider.id, liquidityProvider);
  }
}
