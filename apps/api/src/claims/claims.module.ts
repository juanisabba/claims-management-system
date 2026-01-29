import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClaimSchema } from './infrastructure/persistence/schemas/claim.schema';
import { CreateClaimUseCase } from './application/use-cases/create-claim.use-case';
import { AddDamageUseCase } from './application/use-cases/add-damage.use-case';
import { TransitionStatusUseCase } from './application/use-cases/transition-status.use-case';
import { ClaimController } from './infrastructure/controllers/claim.controller';
import { IClaimRepository } from './domain/repositories/claim.repository.interface';
import { MongooseClaimRepository } from './infrastructure/persistence/mongo-claim.repository';

@Module({
  imports: [
    // Usamos el string 'Claim' para evitar depender de la clase con decoradores
    MongooseModule.forFeature([{ name: 'Claim', schema: ClaimSchema }]),
  ],
  controllers: [ClaimController],
  providers: [
    {
      provide: 'IClaimRepository',
      useClass: MongooseClaimRepository,
    },
    {
      provide: CreateClaimUseCase,
      // Usamos el tipo de la interfaz para el argumento 'repo'
      useFactory: (repo: IClaimRepository) => new CreateClaimUseCase(repo),
      // Mantenemos el token de string
      inject: ['IClaimRepository'],
    },
    {
      provide: AddDamageUseCase,
      useFactory: (repo: IClaimRepository) => new AddDamageUseCase(repo),
      inject: ['IClaimRepository'],
    },
    {
      provide: TransitionStatusUseCase,
      useFactory: (repo: IClaimRepository) => new TransitionStatusUseCase(repo),
      inject: ['IClaimRepository'],
    },
  ],
  // Exportamos los use cases si otros módulos los necesitan
  exports: [CreateClaimUseCase, AddDamageUseCase, TransitionStatusUseCase],
})
export class ClaimsModule {}
