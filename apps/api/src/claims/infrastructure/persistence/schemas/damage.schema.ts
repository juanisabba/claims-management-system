import { Schema, Document } from 'mongoose';

export interface DamageDocument extends Document<string> {
  _id: string;
  part: string;
  severity: string;
  imageUrl: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export const DamageSchema = new Schema<DamageDocument>(
  {
    _id: { type: String, required: true },
    part: { type: String, required: true },
    severity: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
  },
  {
    // _id: false en las opciones evita que Mongoose intente sobrescribir
    _id: false,
    timestamps: true,
  },
);
