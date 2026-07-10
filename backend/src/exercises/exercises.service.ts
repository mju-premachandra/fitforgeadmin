import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.exercise.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(dto: CreateExerciseDto) {
    return this.prisma.exercise.create({
      data: {
        ...(dto.id ? { id: dto.id } : {}),
        name: dto.name.trim(),
        instructions: dto.instructions.trim(),
        frontMuscleImage: dto.frontMuscleImage,
        backMuscleImage: dto.backMuscleImage,
        video: dto.video,
      },
    });
  }

  async update(id: string, dto: UpdateExerciseDto) {
    const exists = await this.prisma.exercise.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Exercise not found');

    return this.prisma.exercise.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.instructions ? { instructions: dto.instructions.trim() } : {}),
        ...(dto.frontMuscleImage
          ? { frontMuscleImage: dto.frontMuscleImage }
          : {}),
        ...(dto.backMuscleImage
          ? { backMuscleImage: dto.backMuscleImage }
          : {}),
        ...(dto.video ? { video: dto.video } : {}),
      },
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.exercise.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Exercise not found');
    await this.prisma.exercise.delete({ where: { id } });
    return { success: true };
  }
}
