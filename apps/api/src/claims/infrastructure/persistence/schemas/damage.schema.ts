import { Schema, Document } from 'mongoose';
import { SeverityEnum } from '../../../domain/value-objects/severity.enum';

export interface DamageDocument extends Document {
  part: string;
  severity: SeverityEnum;
  imageUrl: string;
  price: number;
  score: number;
}

export const DamageSchema = new Schema<DamageDocument>(
  {
    part: { type: String, required: true },
    severity: {
      type: String,
      required: true,
      enum: Object.values(SeverityEnum),
    },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true, min: 0.01 },
    score: { type: Number, required: true, min: 1, max: 10 },
  },
  { timestamps: true },
);
